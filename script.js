/* =========================================================
   LUCERO STUDIO - Formulario de contacto
   Validación, protección contra envíos repetidos y antispam.

   IMPORTANTE: la validación en el navegador mejora la experiencia
   y frena bots simples, pero cualquiera puede saltársela. El servicio
   que reciba el formulario (Formspree, Web3Forms, backend propio...)
   debe volver a validar los datos y aplicar su propio filtro antispam.
   ========================================================= */

(function () {
    "use strict";

    /* ---------- Configuración ---------- */
    const CONFIG = {
        // URL del servicio que recibe el formulario. Ejemplos:
        //   Formspree:  "https://formspree.io/f/TU_ID"
        //   Web3Forms:  "https://api.web3forms.com/submit"
        // Mientras esté vacío, el formulario valida pero no envía nada.
        endpoint: "https://api.web3forms.com/submit",

        // Campos extra que exige el servicio.
        // La access_key de Web3Forms está pensada para ir en el código público de la web:
        // solo permite enviar mensajes al correo registrado, no leerlos ni cambiar la cuenta.
        extraFields: {
            access_key: "f50d9106-3279-4f27-8577-4c1b497b8723",
            subject: "Nuevo mensaje desde la web de LUCERO STUDIO",
            from_name: "Web LUCERO STUDIO",
        },

        // Nombre con el que se envía el campo trampa (honeypot) al servicio,
        // para que también lo filtre en el servidor.
        // Formspree: "_gotcha" · Web3Forms: "botcheck"
        honeypotFieldName: "botcheck",

        // Tiempo mínimo (ms) que una persona tarda en rellenar el formulario.
        // Los bots suelen enviarlo casi al instante.
        minFillTimeMs: 3000,

        // Espera obligatoria (ms) entre un envío correcto y el siguiente.
        cooldownMs: 60000,

        // Tiempo máximo (ms) de espera de la respuesta del servidor.
        requestTimeoutMs: 15000,

        // CAPTCHA opcional. Para activarlo:
        //  1. Añade el script del proveedor en index.html
        //     (Turnstile: https://challenges.cloudflare.com/turnstile/v0/api.js).
        //  2. Pon el widget dentro de #captcha-container
        //     (Turnstile: <div class="cf-turnstile" data-sitekey="TU_SITEKEY"></div>).
        //  3. Cambia enabled a true e indica el nombre del campo con el token.
        //     Turnstile: "cf-turnstile-response" · hCaptcha: "h-captcha-response"
        //     reCAPTCHA v2: "g-recaptcha-response"
        captcha: {
            enabled: false,
            tokenFieldName: "cf-turnstile-response",
        },
    };

    const LIMITS = {
        name: { min: 2, max: 80 },
        email: { max: 254 },
        message: { min: 10, max: 2000 },
    };

    const COOLDOWN_KEY = "lucero_contact_last_sent";

    // Formato de correo práctico: parte local permitida por RFC 5322 (sin comillas),
    // dominio con etiquetas válidas y extensión de al menos 2 letras.
    const EMAIL_REGEX =
        /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

    // Caracteres de control (excepto salto de línea y tabulador en el mensaje).
    const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
    const LINE_BREAKS = /[\r\n]/;

    /* ---------- Elementos ---------- */
    const form = document.getElementById("contact-form");
    if (!form) return;

    const fields = {
        name: form.elements.namedItem("name"),
        email: form.elements.namedItem("email"),
        message: form.elements.namedItem("message"),
    };
    const honeypot = form.elements.namedItem("website");
    const submitButton = form.querySelector('button[type="submit"]');
    const statusEl = document.getElementById("form-status");
    const originalButtonText = submitButton.textContent;

    const formLoadedAt = Date.now();
    let isSubmitting = false;

    /* ---------- Limpieza de datos ---------- */
    function cleanSingleLine(value) {
        return value.replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim();
    }

    function cleanMultiLine(value) {
        return value.replace(CONTROL_CHARS, "").replace(/\r\n?/g, "\n").trim();
    }

    function getCleanData() {
        return {
            name: cleanSingleLine(fields.name.value),
            email: cleanSingleLine(fields.email.value).toLowerCase(),
            message: cleanMultiLine(fields.message.value),
        };
    }

    /* ---------- Validación ---------- */
    function isValidEmail(email) {
        if (email.length > LIMITS.email.max) return false;
        if (!EMAIL_REGEX.test(email)) return false;
        const localPart = email.split("@")[0];
        return localPart.length <= 64;
    }

    const validators = {
        name(value, raw) {
            if (!value) return "Escribe tu nombre.";
            if (LINE_BREAKS.test(raw)) return "El nombre no puede contener saltos de línea.";
            if (value.length < LIMITS.name.min) return `El nombre debe tener al menos ${LIMITS.name.min} caracteres.`;
            if (value.length > LIMITS.name.max) return `El nombre no puede superar ${LIMITS.name.max} caracteres.`;
            if (/[<>{}]|https?:\/\//i.test(value)) return "El nombre contiene caracteres no permitidos.";
            return "";
        },
        email(value, raw) {
            if (!value) return "Escribe tu correo electrónico.";
            if (LINE_BREAKS.test(raw)) return "El correo no puede contener saltos de línea.";
            if (!isValidEmail(value)) return "Introduce un correo válido, por ejemplo: nombre@dominio.com";
            return "";
        },
        message(value) {
            if (!value) return "Escribe tu mensaje.";
            if (value.length < LIMITS.message.min) return `El mensaje debe tener al menos ${LIMITS.message.min} caracteres.`;
            if (value.length > LIMITS.message.max) return `El mensaje no puede superar ${LIMITS.message.max} caracteres.`;
            return "";
        },
    };

    function showFieldError(fieldName, message) {
        const input = fields[fieldName];
        const errorEl = document.getElementById(`${fieldName}-error`);
        // textContent (no innerHTML) para no interpretar nunca HTML.
        if (errorEl) errorEl.textContent = message;
        input.classList.toggle("is-invalid", Boolean(message));
        input.setAttribute("aria-invalid", message ? "true" : "false");
    }

    function validateField(fieldName) {
        const data = getCleanData();
        const error = validators[fieldName](data[fieldName], fields[fieldName].value);
        showFieldError(fieldName, error);
        return !error;
    }

    function validateAll() {
        let firstInvalid = null;
        Object.keys(fields).forEach((fieldName) => {
            if (!validateField(fieldName) && !firstInvalid) firstInvalid = fields[fieldName];
        });
        if (firstInvalid) firstInvalid.focus();
        return !firstInvalid;
    }

    /* ---------- Estado del formulario ---------- */
    function setStatus(message, type) {
        statusEl.textContent = message;
        statusEl.className = "form-status" + (type ? ` is-${type}` : "");
    }

    function setSubmitting(submitting) {
        isSubmitting = submitting;
        submitButton.disabled = submitting;
        submitButton.setAttribute("aria-busy", String(submitting));
        submitButton.textContent = submitting ? "Enviando..." : originalButtonText;
        form.classList.toggle("is-submitting", submitting);
    }

    /* ---------- Antispam ---------- */
    function looksLikeBot() {
        const honeypotFilled = honeypot && honeypot.value !== "";
        const tooFast = Date.now() - formLoadedAt < CONFIG.minFillTimeMs;
        return honeypotFilled || tooFast;
    }

    function getCooldownRemaining() {
        try {
            const last = Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
            return Math.max(0, CONFIG.cooldownMs - (Date.now() - last));
        } catch (e) {
            return 0;
        }
    }

    function markSent() {
        try {
            localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        } catch (e) {
            /* Almacenamiento no disponible: se omite la espera entre envíos. */
        }
    }

    function getCaptchaToken() {
        if (!CONFIG.captcha.enabled) return null;
        const tokenInput = form.querySelector(`[name="${CONFIG.captcha.tokenFieldName}"]`);
        return tokenInput && tokenInput.value ? tokenInput.value : "";
    }

    function resetCaptcha() {
        if (!CONFIG.captcha.enabled) return;
        if (window.turnstile) window.turnstile.reset();
        else if (window.hcaptcha) window.hcaptcha.reset();
        else if (window.grecaptcha) window.grecaptcha.reset();
    }

    /* ---------- Envío ---------- */
    async function sendToService(data, captchaToken) {
        const payload = {
            ...CONFIG.extraFields,
            name: data.name,
            email: data.email,
            message: data.message,
            [CONFIG.honeypotFieldName]: honeypot ? honeypot.value : "",
        };
        if (captchaToken) payload[CONFIG.captcha.tokenFieldName] = captchaToken;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.requestTimeoutMs);

        try {
            const response = await fetch(CONFIG.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
                credentials: "omit",
                referrerPolicy: "strict-origin-when-cross-origin",
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            // Web3Forms responde { success: true|false, message: "..." }.
            const result = await response.json().catch(() => null);
            if (result && result.success === false) {
                throw new Error(result.message || "El servicio rechazó el envío");
            }
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (isSubmitting) return;

        setStatus("", "");

        if (!validateAll()) {
            setStatus("Revisa los campos marcados.", "error");
            return;
        }

        // Bot detectado: se simula éxito sin enviar nada para no darle pistas.
        if (looksLikeBot()) {
            form.reset();
            setStatus("¡Gracias! Tu mensaje ha sido enviado.", "success");
            return;
        }

        const remaining = getCooldownRemaining();
        if (remaining > 0) {
            const seconds = Math.ceil(remaining / 1000);
            setStatus(`Ya enviaste un mensaje. Espera ${seconds} s antes de enviar otro.`, "error");
            return;
        }

        const captchaToken = getCaptchaToken();
        if (captchaToken === "") {
            setStatus("Completa la verificación antispam antes de enviar.", "error");
            return;
        }

        if (!CONFIG.endpoint) {
            console.warn("[Formulario] Falta configurar CONFIG.endpoint en script.js; el mensaje no se envió.");
            setStatus("El envío del formulario todavía no está configurado.", "error");
            return;
        }

        setSubmitting(true);
        try {
            await sendToService(getCleanData(), captchaToken);
            markSent();
            form.reset();
            Object.keys(fields).forEach((fieldName) => showFieldError(fieldName, ""));
            setStatus("¡Gracias! Tu mensaje ha sido enviado. Te responderemos pronto.", "success");
        } catch (error) {
            console.error("[Formulario] Error al enviar:", error);
            const timedOut = error && error.name === "AbortError";
            setStatus(
                timedOut
                    ? "El servidor tardó demasiado en responder. Inténtalo de nuevo."
                    : "No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.",
                "error"
            );
        } finally {
            resetCaptcha();
            setSubmitting(false);
        }
    }

    /* ---------- Eventos ---------- */
    Object.keys(fields).forEach((fieldName) => {
        const input = fields[fieldName];
        // Valida al salir del campo y, si ya tenía error, mientras se corrige.
        input.addEventListener("blur", () => {
            if (input.value) validateField(fieldName);
        });
        input.addEventListener("input", () => {
            if (input.classList.contains("is-invalid")) validateField(fieldName);
        });
    });

    form.addEventListener("submit", handleSubmit);
})();

/* =========================================================
   Interfaz: aparición al hacer scroll y fichas de servicio.
   Independiente del formulario: si falla, el contenido sigue visible.
   ========================================================= */
(function () {
    "use strict";

    /* ---------- Aparición escalonada (una sola vez por elemento) ---------- */
    const MAX_STAGGER = 5; // a partir del 6.º, entran con el último
    const items = document.querySelectorAll(".reveal");

    if (items.length && "IntersectionObserver" in window) {
        items.forEach((item) => {
            const siblings = Array.from(item.parentElement.children).filter((el) => el.classList.contains("reveal"));
            item.style.setProperty("--i", Math.min(siblings.indexOf(item), MAX_STAGGER));
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -10% 0px" });

        document.documentElement.classList.add("reveal-ready");
        items.forEach((item) => observer.observe(item));
    }

    /* ---------- Inclinación 3D de fichas y tarjetas (solo con ratón) ---------- */
    // JS solo fija --rx / --ry una vez por frame; la transición CSS de transform
    // suaviza el movimiento y lo devuelve a reposo al salir.
    const TILT_MAX_DEG = 3;     // tope de DESIGN.md para objetos de papel
    const TILT_MAX_DEPTH = 10;  // px que puede hundirse o levantarse un canto
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Ángulo con el que un canto a size/2 del centro se desplaza TILT_MAX_DEPTH en profundidad:
    // así una ficha pequeña y la tarjeta apaisada se inclinan con el mismo "peso".
    function maxAngle(size) {
        const deg = (Math.atan(TILT_MAX_DEPTH / (size / 2)) * 180) / Math.PI;
        return Math.min(TILT_MAX_DEG, deg);
    }

    function clamp(value) {
        return Math.max(-1, Math.min(1, value));
    }

    document.querySelectorAll(".service, .app-card").forEach((card) => {
        let box = null; // posición en coordenadas de página: no caduca al hacer scroll
        let pageX = 0;
        let pageY = 0;
        let frame = 0;

        function update() {
            frame = 0;
            const nx = clamp(((pageX - box.left) / box.width) * 2 - 1);
            const ny = clamp(((pageY - box.top) / box.height) * 2 - 1);
            // El canto bajo el cursor se hunde, como una hoja que se presiona con el dedo.
            card.style.setProperty("--rx", (-ny * maxAngle(box.height)).toFixed(2) + "deg");
            card.style.setProperty("--ry", (nx * maxAngle(box.width)).toFixed(2) + "deg");
        }

        function reset() {
            cancelAnimationFrame(frame);
            frame = 0;
            box = null;
            card.style.removeProperty("--rx");
            card.style.removeProperty("--ry");
        }

        card.addEventListener("pointermove", (event) => {
            if (event.pointerType !== "mouse" || !finePointer.matches || reducedMotion.matches) return;
            if (!box) {
                const rect = card.getBoundingClientRect();
                box = { left: rect.left + window.scrollX, top: rect.top + window.scrollY, width: rect.width, height: rect.height };
            }
            pageX = event.pageX;
            pageY = event.pageY;
            if (!frame) frame = requestAnimationFrame(update);
        });
        card.addEventListener("pointerleave", reset);
    });

    /* ---------- "Consultar" en un servicio: lo anota en la carta si está vacía ---------- */
    const message = document.getElementById("message");
    if (!message) return;

    document.querySelectorAll(".service-link[data-service]").forEach((link) => {
        link.addEventListener("click", () => {
            if (message.value.trim()) return;
            message.value = "Hola, me interesa: " + link.dataset.service + ". ";
        });
    });
})();
