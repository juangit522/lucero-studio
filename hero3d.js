/* =========================================================
   LUCERO STUDIO - Escena 3D del hero
   Correo aéreo (sobres, sellos y matasellos) flotando detrás del
   contenido; se aparta del cursor y la cámara sigue al ratón.

   Decorativa y prescindible: si falla Three.js, WebGL o la red,
   el hero se queda exactamente como sin ella.
   - No se carga con prefers-reduced-motion.
   - Three.js se descarga después de "load", cuando el navegador
     está libre, para no competir con la coreografía del sobre.
   - Solo dibuja mientras el hero está en pantalla y la pestaña visible.
   - En táctil o pantalla estrecha se dibuja una sola vez, estática:
     un bucle WebGL continuo gasta batería sin que haya ratón al que reaccionar.
   ========================================================= */

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js";

const container = document.querySelector(".hero-scene");
const hero = document.querySelector(".hero");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

// Colores de DESIGN.md
const INK = {
    paper: "#f7fafd",
    stampWhite: "#ffffff",
    azul: "#16508e",
    azulDeep: "#0e3a6b",
    azulNight: "#0a2a4f",
    azulLine: "rgba(22, 80, 142, 0.35)",
    red: "#c8372d",
    ground: 0xe3ebf5,
};

const CONFIG = {
    desktop: { envelopes: 14, stamps: 16, postmarks: 10 },
    compact: { envelopes: 6, stamps: 7, postmarks: 4 }, // táctil o pantalla estrecha: escena estática
    repelRadius: 0.32,  // radio de influencia del cursor, en unidades de pantalla (0-1 del alto)
    repelForce: 2.6,    // unidades de mundo que se aparta una pieza bajo el cursor
    follow: 0.08,       // suavizado del desplazamiento: sigue sin rebotar
    cameraSway: 1.6,    // cuánto se mueve la cámara con el ratón
};

if (container && hero && !reducedMotion.matches) {
    const start = () => loadScene().catch(() => { /* sin escena: el hero sigue intacto */ });
    const whenIdle = () => ("requestIdleCallback" in window ? requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 600));
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
}

/* ---------- Texturas dibujadas en canvas 2D (sin imágenes externas) ---------- */
function makeCanvas(width, height, draw) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    draw(canvas.getContext("2d"), width, height);
    return canvas;
}

// Sobre de correo aéreo: papel con ribete de chevrones, sello y líneas de dirección.
function drawEnvelope(ctx, w, h) {
    const band = h * 0.09;
    ctx.fillStyle = INK.paper;
    ctx.fillRect(0, 0, w, h);

    // Ribete: rojo / papel / azul / papel a -45°, recortado al marco
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.rect(band, band, w - band * 2, h - band * 2);
    ctx.clip("evenodd");
    const stripe = band * 1.1;
    const colors = [INK.red, INK.paper, INK.azul, INK.paper];
    for (let x = -h, k = 0; x < w; x += stripe, k++) {
        ctx.fillStyle = colors[k % 4];
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + stripe, 0);
        ctx.lineTo(x + stripe + h, h);
        ctx.lineTo(x + h, h);
        ctx.fill();
    }
    ctx.restore();

    // Sello
    const sw = w * 0.16;
    const sx = w - band - sw - w * 0.05;
    const sy = band + h * 0.08;
    ctx.fillStyle = INK.azulDeep;
    ctx.fillRect(sx, sy, sw, sw * 1.2);
    ctx.strokeStyle = "rgba(238, 244, 251, 0.7)";
    ctx.lineWidth = w * 0.006;
    ctx.strokeRect(sx + sw * 0.14, sy + sw * 0.14, sw * 0.72, sw * 0.92);

    // Líneas de dirección
    ctx.strokeStyle = INK.azulLine;
    ctx.lineWidth = h * 0.018;
    [0.58, 0.7, 0.82].forEach((y, i) => {
        ctx.beginPath();
        ctx.moveTo(w * (0.42 + i * 0.02), h * y);
        ctx.lineTo(w * 0.86, h * y);
        ctx.stroke();
    });
}

// Sello perforado: borde de agujeros sobre papel blanco, cara azul con marco interior.
function drawStamp(ctx, w, h) {
    const hole = w * 0.055;
    const pitch = hole * 2.6;
    ctx.fillStyle = INK.stampWhite;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "destination-out";
    for (let x = pitch / 2; x < w; x += pitch) {
        [0, h].forEach((y) => { ctx.beginPath(); ctx.arc(x, y, hole, 0, Math.PI * 2); ctx.fill(); });
    }
    for (let y = pitch / 2; y < h; y += pitch) {
        [0, w].forEach((x) => { ctx.beginPath(); ctx.arc(x, y, hole, 0, Math.PI * 2); ctx.fill(); });
    }
    ctx.globalCompositeOperation = "source-over";
    const m = w * 0.13;
    ctx.fillStyle = INK.azulDeep;
    ctx.fillRect(m, m, w - m * 2, h - m * 2);
    ctx.strokeStyle = "rgba(238, 244, 251, 0.75)";
    ctx.lineWidth = w * 0.02;
    ctx.strokeRect(m * 1.6, m * 1.6, w - m * 3.2, h - m * 3.2);
    // Motivo: un avión de papel en trazo
    ctx.strokeStyle = "#eef4fb";
    ctx.lineWidth = w * 0.03;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.55);
    ctx.lineTo(w * 0.72, h * 0.38);
    ctx.lineTo(w * 0.5, h * 0.66);
    ctx.lineTo(w * 0.46, h * 0.53);
    ctx.closePath();
    ctx.stroke();
}

// Matasellos: dos círculos y cuatro ondas de cancelación, tinta azul sobre transparente.
function drawPostmark(ctx, w, h) {
    const r = h * 0.42;
    const cx = h * 0.5;
    const cy = h * 0.5;
    ctx.strokeStyle = INK.azul;
    ctx.lineCap = "round";
    ctx.lineWidth = h * 0.035;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = h * 0.025;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = h * 0.03;
    for (let i = 0; i < 4; i++) {
        const y = h * (0.26 + i * 0.16);
        ctx.beginPath();
        ctx.moveTo(h * 0.98, y);
        for (let x = h * 0.98; x < w - h * 0.05; x += h * 0.2) {
            ctx.quadraticCurveTo(x + h * 0.1, y - h * 0.07, x + h * 0.2, y);
        }
        ctx.stroke();
    }
}

/* ---------- Escena ---------- */
async function loadScene() {
    const THREE = await import(THREE_URL);

    const canvas = document.createElement("canvas");
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch (e) {
        return; // sin WebGL
    }
    container.appendChild(canvas);

    const compact = !finePointer.matches || window.innerWidth < 700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    // Niebla del color del onionskin: las piezas lejanas se funden con la mesa.
    scene.fog = new THREE.Fog(INK.ground, 26, 52);

    const camera = new THREE.PerspectiveCamera(35, 1, 1, 100);
    camera.position.set(0, 0, 30);

    function texture(width, height, draw) {
        const tex = new THREE.CanvasTexture(makeCanvas(width, height, draw));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        return tex;
    }

    const counts = compact ? CONFIG.compact : CONFIG.desktop;
    const kinds = [
        { count: counts.envelopes, size: [2.1, 1.4], map: texture(384, 256, drawEnvelope) },
        { count: counts.stamps, size: [0.95, 1.15], map: texture(200, 240, drawStamp) },
        { count: counts.postmarks, size: [2.0, 1.0], map: texture(360, 180, drawPostmark), opacity: 0.55 },
    ];

    // Tamaño visible del plano z = 0, para repartir piezas por todo el ancho
    let viewW = 1;
    let viewH = 1;
    // Bordes de la columna de texto para la máscara CSS: horizontal en escritorio,
    // vertical cuando el hero se apila (texto arriba, sobre debajo).
    const copy = hero.querySelector(".hero-copy");
    function measureCopy() {
        if (!copy) return;
        const box = container.getBoundingClientRect();
        const text = copy.getBoundingClientRect();
        const stacked = window.matchMedia("(max-width: 1024px)").matches;
        const start = stacked ? text.top - box.top : text.left - box.left;
        const end = stacked ? text.bottom - box.top : text.right - box.left;
        container.style.setProperty("--copy-start", Math.max(0, start - 24).toFixed(0) + "px");
        container.style.setProperty("--copy-end", (end + 8).toFixed(0) + "px");
    }

    function resize() {
        measureCopy();
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        viewH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        viewW = viewH * camera.aspect;
    }
    resize();

    const pieces = [];
    const dummy = new THREE.Object3D();
    const meshes = kinds.map((kind) => {
        const material = new THREE.MeshBasicMaterial({
            map: kind.map,
            transparent: true,
            opacity: kind.opacity ?? 1,
            side: THREE.DoubleSide,
            depthWrite: false,
            fog: true,
        });
        const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(kind.size[0], kind.size[1]), material, kind.count);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.frustumCulled = false;
        scene.add(mesh);
        for (let i = 0; i < kind.count; i++) {
            // Más densidad a la derecha (junto al sobre) que detrás del titular
            const side = Math.random() < 0.65 ? 1 : -1;
            const x = side * (0.12 + Math.random() * 0.5);
            pieces.push({
                mesh,
                index: i,
                base: new THREE.Vector3(x * viewW * 1.1, (Math.random() - 0.5) * viewH * 1.1, -14 + Math.random() * 20),
                drift: 0.25 + Math.random() * 0.45,       // vuelo lento hacia la derecha, como correo aéreo
                bob: Math.random() * Math.PI * 2,         // fase del balanceo
                spin: new THREE.Euler((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.8),
                push: new THREE.Vector3(),                // desplazamiento actual por el cursor
                scale: 0.75 + Math.random() * 0.5,
            });
        }
        return mesh;
    });

    // Cursor en coordenadas normalizadas del contenedor (-1..1); null si no hay ratón
    let pointer = null;
    const cameraTarget = new THREE.Vector2();
    if (!compact) {
        window.addEventListener("pointermove", (event) => {
            if (event.pointerType !== "mouse") return;
            const rect = container.getBoundingClientRect();
            if (event.clientY > rect.bottom) { pointer = null; return; }
            pointer = {
                x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
                y: -(((event.clientY - rect.top) / rect.height) * 2 - 1),
            };
        }, { passive: true });
        document.documentElement.addEventListener("pointerleave", () => { pointer = null; });
    }

    const projected = new THREE.Vector3();
    const clock = new THREE.Clock();
    let elapsed = 0;

    function frame() {
        const dt = Math.min(clock.getDelta(), 0.05);
        elapsed += dt;
        const aspect = camera.aspect;

        // La cámara se inclina un poco hacia el cursor: la escena gana profundidad
        cameraTarget.set(pointer ? pointer.x * CONFIG.cameraSway : 0, pointer ? pointer.y * CONFIG.cameraSway * 0.6 : 0);
        camera.position.x += (cameraTarget.x - camera.position.x) * 0.05;
        camera.position.y += (cameraTarget.y - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        const spanX = viewW * 1.3;
        for (const p of pieces) {
            // Vuelo continuo con reaparición por la izquierda
            p.base.x += p.drift * dt;
            if (p.base.x > spanX / 2) p.base.x -= spanX;
            const bobY = Math.sin(elapsed * 0.6 + p.bob) * 0.35;

            dummy.position.set(p.base.x, p.base.y + bobY, p.base.z);

            // Se aparta del cursor en el plano de la pantalla
            let tx = 0;
            let ty = 0;
            if (pointer) {
                projected.copy(dummy.position).project(camera);
                const dx = (projected.x - pointer.x) * aspect;
                const dy = projected.y - pointer.y;
                const dist = Math.hypot(dx, dy) / 2; // 0-1 del alto de la pantalla
                if (dist < CONFIG.repelRadius) {
                    const falloff = (1 - dist / CONFIG.repelRadius) ** 2;
                    const len = Math.hypot(dx, dy) || 1;
                    tx = (dx / len) * falloff * CONFIG.repelForce;
                    ty = (dy / len) * falloff * CONFIG.repelForce;
                }
            }
            p.push.x += (tx - p.push.x) * CONFIG.follow;
            p.push.y += (ty - p.push.y) * CONFIG.follow;
            dummy.position.x += p.push.x;
            dummy.position.y += p.push.y;

            // Balanceo de papel; al apartarse, la pieza se ladea en la dirección del empujón
            dummy.rotation.set(
                p.spin.x + Math.sin(elapsed * 0.5 + p.bob) * 0.25 - p.push.y * 0.25,
                p.spin.y + Math.cos(elapsed * 0.4 + p.bob) * 0.3 + p.push.x * 0.25,
                p.spin.z + Math.sin(elapsed * 0.3 + p.bob) * 0.15
            );
            dummy.scale.setScalar(p.scale);
            dummy.updateMatrix();
            p.mesh.setMatrixAt(p.index, dummy.matrix);
        }
        meshes.forEach((mesh) => { mesh.instanceMatrix.needsUpdate = true; });
        renderer.render(scene, camera);
    }

    if (compact) {
        // Escena estática: una composición fija que se redibuja solo al cambiar de tamaño.
        new ResizeObserver(() => { resize(); frame(); }).observe(container);
        frame();
        container.classList.add("is-ready");
        return;
    }

    // Solo anima mientras el hero se ve y la pestaña está visible
    let heroVisible = true;
    function syncLoop() {
        const run = heroVisible && document.visibilityState === "visible";
        if (run) clock.getDelta(); // descarta el tiempo en pausa para que no dé un salto
        renderer.setAnimationLoop(run ? frame : null);
    }
    new IntersectionObserver((entries) => {
        heroVisible = entries[0].isIntersecting;
        syncLoop();
    }).observe(hero);
    document.addEventListener("visibilitychange", syncLoop);
    new ResizeObserver(resize).observe(container);

    frame();
    syncLoop();
    container.classList.add("is-ready");
}
