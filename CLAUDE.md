# CLAUDE.md — LUCERO STUDIO

Web estática (HTML/CSS/JS vanilla, sin build) de LUCERO STUDIO. Antes de tocar UI, lee:

- `PRODUCT.md`: audiencia, propósito y restricciones (no inventar pruebas sociales, no romper IDs/names del formulario en `script.js`).
- `DESIGN.md`: identidad visual "Correo Aéreo" (colores, tipografía, sombras, formas). **Es la fuente de verdad del aspecto.**

Este archivo define **cómo se mueve y responde** la interfaz: ingeniería de diseño al estilo Emil Kowalski. Si una regla de aquí choca con `DESIGN.md`, gana `DESIGN.md` en lo visual y este archivo en lo técnico del movimiento.

---

## 1. Principios

1. **El movimiento tiene un propósito.** Toda animación explica algo: de dónde viene un elemento, qué se puede pulsar, qué acaba de pasar. Si no explica nada, se quita.
2. **Rápido se siente mejor.** La interfaz responde en el mismo frame del gesto; la animación acompaña, nunca hace esperar.
3. **Sutil por defecto.** Desplazamientos de 1-4px, escalas de 0.95-1, opacidades parciales. El usuario debe *sentir* la fluidez, no *verla*.
4. **La frecuencia manda.** Cuanto más a menudo ocurre una interacción, menos se anima. Lo que se usa cien veces al día (teclado, foco, navegación repetida) no se anima o se anima al mínimo.
5. **Interrumpible siempre.** Un hover que se retira a mitad de camino debe revertir desde donde está, sin saltos.

---

## 2. Gusto y estética

Objetivo: una UI mínima, cuidada e intencional. Nada de layouts genéricos "hechos por IA" (hero centrado + tres tarjetas iguales con icono + CTA degradado). Cada decisión debe poder justificarse desde el mundo postal de `DESIGN.md`.

- **Layout:** espacio en blanco generoso, alineación estricta a la retícula (contenedor de 1240px, `--gutter`, grids asimétricos ya definidos) y padding equilibrado. Si algo se siente apretado, se quita contenido antes de reducir márgenes.
- **Color:**
  - Nada de negro puro (`#000`) ni acentos sobresaturados. La tinta más oscura es `--ink` (`#0b2545`); el acento es `--azul`, nunca un azul eléctrico.
  - **Adaptación:** el fondo general sigue siendo el onionskin claro de `DESIGN.md` (la identidad lo exige). Los tonos oscuros se reservan a las zonas que ya lo son (footer en `--azul-night`, banda de ruta y caras de sello en `--azul-deep`), que actúan como el equivalente "slate" de la marca: azul-pizarra profundo, no gris neutro ni negro.
  - Sobre esas zonas oscuras, bordes sutiles claros con alfa (`rgba(238, 244, 251, 0.12–0.2)`), nunca líneas opacas.
- **Tipografía:** jerarquía visual estricta, con un solo protagonista por vista.
  - Primario: `--ink` (o `--on-azul` sobre azul).
  - Secundario: `--ink-soft` (o `--on-azul-soft`).
  - Terciario (metadatos, notas, pies): `--ink-soft` con opacidad reducida o tamaño menor, sin bajar del contraste AA (4.5:1 en texto normal).
  - La profundidad se consigue atenuando el texto de apoyo, no agrandando el principal.
- **Microdetalles:** todo elemento interactivo tiene un hover fluido y rápido, **150–200ms con `ease-out`** (ver sección 5).

---

## 3. Tokens de movimiento

Usar siempre variables; nunca duraciones ni curvas sueltas en el CSS.

```css
:root {
    /* Duraciones */
    --dur-instant: 100ms;   /* color de enlaces, cambios de estado mínimos */
    --dur-fast: 150ms;      /* hover, active, foco */
    --dur-base: 200ms;      /* botones, tarjetas, bordes, sombras */
    --dur-slow: 300ms;      /* aparición de paneles, mensajes de estado, underline de nav */

    /* Curvas */
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);      /* entradas y respuestas a hover */
    --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* elementos que ya están en pantalla y se desplazan */
    --ease: cubic-bezier(0.16, 1, 0.3, 1);           /* existente: salida expresiva, mantener */
}
```

### Reglas de duración

- **Microinteracciones: 150-300ms.** Hover y active en `--dur-fast`; transiciones de componente en `--dur-base`; apariciones en `--dur-slow`.
- **Nunca más de 300ms** en algo que responde a un gesto del usuario.
- **Las salidas son más rápidas que las entradas** (≈ 70-80% de la duración de entrada). Un panel que entra en 300ms sale en 200ms.
- **Excepción documentada:** la coreografía de carga del hero (sobre que se endereza en 0.8s, matasellos que estampa en 0.7s, "ENVIADO" en 0.55s) es un momento único, no una interacción repetida. Puede superar 300ms. También el piloto de "Disponible para nuevos proyectos" del hero (`--dur-pulse`, 2.4s en bucle): es un indicador de estado continuo, no responde a ningún gesto; solo anima `transform` y `opacity` de un pseudo-elemento de 8px. No añadir más excepciones sin justificarlas aquí.

### Reglas de curva

- **`ease-out` para casi todo** lo que responde al usuario: arranca rápido, así se percibe inmediato.
- **`ease-in-out`** solo para elementos ya visibles que cambian de posición.
- **Prohibido `ease-in`** en interacciones: arranca lento y la UI se siente torpe.
- **Prohibido `linear`** salvo en rotaciones continuas o indicadores de progreso.
- Nada de rebotes ni overshoot: el mundo es papel sobre una mesa, no goma.

---

## 4. Qué se anima y qué no

- **Solo `transform` y `opacity`** para movimiento (van por GPU). `box-shadow`, `background-color`, `border-color` y `color` se permiten en transiciones cortas de estado.
- **Nunca animar** `width`, `height`, `top`, `left`, `margin`, `padding`: provocan reflow.
- **Nunca `transition: all`.** Declarar cada propiedad:
  ```css
  transition:
      transform var(--dur-base) var(--ease-out),
      box-shadow var(--dur-base) var(--ease-out),
      background-color var(--dur-fast) var(--ease-out);
  ```
- **Nunca escalar desde 0.** Las apariciones parten de `scale(0.95)` + `opacity: 0`; nada en el mundo real surge de la nada.
- **`transform-origin` coherente con el origen:** un desplegable crece desde su disparador, no desde el centro.
- **Transiciones CSS antes que `@keyframes`** para estados interactivos: las transiciones se interrumpen y revierten; los keyframes reinician.
- **`will-change`** solo de forma puntual en el elemento que lo necesita, nunca global.

---

## 5. Estados hover / active / focus

### Hover
- **Duración: 150–200ms, siempre `ease-out`** (`--dur-fast` o `--dur-base` con `--ease-out`). Ningún hover pasa de 200ms.
- Solo en dispositivos con puntero real; en táctil el hover se queda "pegado":
  ```css
  @media (hover: hover) and (pointer: fine) {
      .btn:hover { transform: translateY(-2px); }
  }
  ```
- **Elevación:** los elementos elevables suben 1-4px y pasan de `--shadow-paper` a `--shadow-lift` (o la sombra de botón más profunda). La sombra y el desplazamiento se mueven juntos, con la misma duración y curva.
- **Color:** los enlaces cambian de `--ink-soft` a `--azul` en `--dur-fast`.
- El área interactiva no cambia de tamaño en hover (evita que el layout "tiemble").

### Active (pulsación)
- **Respuesta táctil inmediata:** `transform: scale(0.97)` o bajar 1px, en `--dur-instant`/`--dur-fast`.
  ```css
  .btn:active {
      transform: translateY(1px) scale(0.98);
      transition-duration: var(--dur-instant);
  }
  ```
- Al pulsar, la sombra se **reduce** (el papel se aprieta contra la mesa), nunca crece.
- Todo elemento pulsable tiene estado `:active`. Sin excepción.

### Focus
- `:focus-visible` con el anillo existente (2px `--azul`, offset 3px). **El foco no se anima**: aparece al instante; es navegación de teclado de alta frecuencia.
- Nunca quitar el outline sin un sustituto igual de visible.

### Disabled
- `opacity: 0.5`, `cursor: not-allowed`, sin hover ni active. No animar la entrada al estado disabled.

---

## 6. Bordes semi-transparentes

Los bordes se tiñen con alfa sobre el fondo en vez de usar grises opacos: así se adaptan a cualquier papel (onionskin, letter paper, stamp white) sin recalcular colores.

- **Hairline / divisor:** `1px solid var(--azul-line)` (`rgba(22, 80, 142, 0.22)`).
- **Relleno sutil / wash:** `var(--azul-faint)` (`rgba(22, 80, 142, 0.1)`).
- **Sobre azul:** `rgba(238, 244, 251, 0.2)` (on-azul con alfa), nunca un azul más claro opaco.
- **Hover de borde:** subir la opacidad o pasar a `--azul` sólido, en `--dur-fast`.
- Un borde sutil + sombra suave define mejor el canto de una hoja que una sombra fuerte sola.
- Si se añade un nuevo tono de línea, se crea como token `rgba()` en `:root`; nada de hex opacos para bordes decorativos.

---

## 7. Sombras en capas

Toda sombra es **al menos de dos capas**, teñida con la tinta (`rgba(11, 37, 69, …)`), nunca negro puro:

1. **Capa de contacto:** corta y nítida, pega el objeto a la superficie (`0 1px 2px`).
2. **Capa ambiental:** larga, difusa y con spread negativo para que no se desborde por los lados (`0 10px 28px -8px`).

| Token | Uso |
|---|---|
| `--shadow-paper` | Hojas en reposo: pane de sellos, hoja de próximos, privacidad, tarjetas de app. |
| `--shadow-lift` | Objetos destacados y hover de tarjetas: sobre del hero, carta del formulario. |
| Sombra de botón primario | La única pieza de chrome que se eleva; se profundiza en hover, se reduce en active. |
| `filter: drop-shadow(...)` | Sellos perforados, para que la sombra siga la perforación. |

- Prohibido: sombras duras desplazadas, glows, neón, sombras de color saturado.
- Transición de sombra = misma duración y curva que el `transform` que la acompaña.

---

## 8. Apariciones y listas

- **Entrada estándar:** `opacity: 0 → 1` + `translateY(8px) → 0` (o `scale(0.95) → 1`), `--dur-slow`, `--ease-out`.
- **Stagger** en listas y grids: 30-60ms entre elementos, máximo ~6 escalonados; el resto entra con el último.
- Animaciones de scroll con `IntersectionObserver`, una sola vez por elemento (`unobserve` tras entrar). Nada ligado frame a frame al scroll.
- Mensajes de estado del formulario (éxito/error) aparecen con fade + desplazamiento corto; se anuncian con `aria-live`.

---

## 9. Accesibilidad y rendimiento

- **`prefers-reduced-motion: reduce`** ya está cubierto en `styles.css`: reduce todas las animaciones y transiciones a 0.01ms y desactiva el scroll suave. Todo nuevo movimiento debe seguir funcionando bien con ese bloque; si algo depende de `animationend`/`transitionend` en JS, comprobar que se dispara igual.
- 60fps: si una animación da tirones, se simplifica o se quita; no se "arregla" alargándola.
- Números que cambian: `font-variant-numeric: tabular-nums` para que no bailen.
- Objetivos táctiles de al menos 44×44px; el feedback de `:active` es obligatorio en móvil porque no hay hover.
- JS solo para lo que CSS no puede (observers, estado del formulario). Nada de librerías de animación: no hay build step.

---

## 10. Checklist antes de dar por terminado un cambio de UI

- [ ] Duraciones y curvas salen de tokens; ninguna interacción supera 300ms.
- [ ] Sin `transition: all`, sin `ease-in`, sin animar propiedades de layout.
- [ ] Hover a 150–200ms con `ease-out`, envuelto en `@media (hover: hover) and (pointer: fine)`.
- [ ] Todo elemento pulsable tiene `:active` y `:focus-visible`.
- [ ] Bordes decorativos con tokens `rgba`; sombras en dos capas teñidas de tinta.
- [ ] Nada aparece desde `scale(0)`; `transform-origin` correcto.
- [ ] Probado con `prefers-reduced-motion: reduce`.
- [ ] Respeta `DESIGN.md`: chrome sin rotar, rojo solo en el ribete, papel sobre onionskin.
- [ ] Sin negro puro ni acentos saturados; texto secundario y terciario atenuado; espacio en blanco generoso.
