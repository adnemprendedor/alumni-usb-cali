# Alumni USB Cali — USB Conecta y emprende

Directorio digital de la Red de Graduados de la Universidad de San Buenaventura Cali, con foco en los emprendimientos de sus egresados. Experiencia web inmersiva en React + TypeScript, con animaciones de scroll en Framer Motion y GSAP/ScrollTrigger, e identidad visual USB Cali (naranja `#EF7D00` + negro `#1D1D1B`, tipografía Montserrat).

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS 4** (vía `@tailwindcss/vite`)
- **Framer Motion** — animaciones de entrada, transiciones de página, contadores, cursor
- **GSAP + ScrollTrigger** — scroll horizontal pineado (sección Emprendimientos)
- **React Router (HashRouter)** — rutas del directorio, del perfil de cada egresado y del panel de administración (`/admin`)

Se usó `HashRouter` (en vez de `BrowserRouter`) para que el sitio funcione en cualquier hosting estático sin configurar reescritura de rutas en el servidor (por ejemplo GitHub Pages, Netlify sin `_redirects`, o un hosting compartido básico). Si el proyecto se despliega detrás de un servidor propio que sí pueda reescribir rutas al `index.html`, se puede migrar a `BrowserRouter` sin tocar el resto del código. `vite.config.ts` usa `base: './'` (ruta relativa) — junto con `HashRouter`, esto hace que el sitio funcione en cualquier subruta de GitHub Pages sin configuración adicional.

## Cómo correrlo

```bash
npm install
npm run dev        # servidor de desarrollo con recarga en caliente
npm run build       # build de producción en /dist
npm run preview     # sirve el build de /dist localmente para revisarlo
```

## Estructura

```
src/
  components/   # Hero, Navbar, secciones de scroll, cursor, transiciones, ConectaSection…
  pages/        # HomePage y ProfilePage (ficha de cada egresado)
  data/         # egresados.json/.ts, media.json/fotos.ts/logos.ts, content.json — ver "Los datos" abajo
  admin/        # panel de administración (/admin): login, editores, cliente de la API de GitHub
  hooks/        # usePrefersReducedMotion
  lib/          # registro de GSAP/ScrollTrigger, generador de color por seed
  assets/brand/ # logos Alumni USB Cali y Universidad de San Buenaventura (estos sí van empaquetados por Vite)
public/
  egresados/    # fotos de perfil (servidas tal cual, sin procesar por Vite)
  logos/        # logos de cada emprendimiento
.github/workflows/deploy.yml  # build + despliegue automático a GitHub Pages
scripts/generar-clave-admin.mjs  # genera el hash para cambiar el usuario/clave del panel
```

### Por qué los datos están en `.json` y las fotos en `public/`

Antes, `egresados.ts` era un array de TypeScript escrito a mano y las fotos/logos se importaban desde `src/assets/` (Vite las empaqueta con un nombre con hash, ilegible desde afuera). Para que el panel de administración (ver abajo) pueda leer y **guardar cambios reales** sin que nadie tenga que tocar código, los datos que se editan desde `/admin` ahora viven en archivos `.json` planos (`egresados.json`, `media.json`, `content.json`) y las fotos/logos se movieron a `public/egresados/` y `public/logos/`, que Vite sirve tal cual, con nombre de archivo predecible (`public/egresados/<slug>.jpg`). Los archivos `.ts` del mismo nombre (`egresados.ts`, `fotos.ts`, `logos.ts`) siguen existiendo como una capa delgada que le da tipos de TypeScript al resto del código — no hay que tocarlos al editar contenido.

## Logos

El logo de la **Universidad de San Buenaventura** va en el Navbar (arriba de toda la página, visible en todo momento al hacer scroll). El logo de **Alumni USB Cali** se movió más abajo, al Footer, junto con el resto de la información institucional. Ambos vienen del material de marca que se envió y se muestran sobre una placa clara (`bg-paper`) porque los archivos PNG originales no tienen fondo transparente.

## El directorio completo (`#buscador`)

La sección "¿A quién estás buscando?" ya no es solo un buscador de coincidencia exacta: muestra los **264 egresados** con buscador de texto libre, filtro por enfoque (con conteo real por categoría) y paginado de 24 en 24 con un botón "Cargar más", para no renderizar todas las tarjetas de una vez. Los accesos "Egresados" del menú y de "Explora la red Alumni" ahora apuntan aquí en vez de a la sección de destacados, que sigue existiendo como vitrina editorial más arriba en la página.

## Los datos: qué se publicó y qué NO

`src/data/egresados.ts` se generó a partir de `EMPRENDIMIENTOS_DATA_D.xlsx` (309 registros con emprendimiento registrado; 259 quedaron con nombre de emprendimiento válido tras la limpieza). **Se excluyeron a propósito los campos sensibles del Excel**: número de documento, celular personal, rango salarial, cargo y empresa donde trabajan. Publicar esos datos en una página pública sería un problema real de protección de datos.

El **correo electrónico sí se incluye** (247 de los 259 egresados del Excel lo tienen registrado; los 12 restantes no traían correo), porque se confirmó que hay autorización de Alumni USB Cali para publicarlo y así facilitar el contacto directo entre egresados. Se usa `CORREO PRINCIPAL`, y `CORREO ALTERNO` como respaldo cuando el principal no estaba diligenciado. Aparece como enlace `mailto:` en la ficha de cada egresado (`/egresado/:slug`) y como texto en el listado del directorio completo (`#buscador`).

**Importante:** el Excel tiene algunas filas donde "PRIMER APELLIDO"/"SEGUNDO APELLIDO"/"PRIMER NOMBRE"/"SEGUNDO NOMBRE" vienen desordenados (p. ej. un nombre que debería leerse "Juan Andrés Vanegas Guerra" aparece invertido). Eso es un problema de calidad del dato de origen, no algo que se “arregló” adivinando — conviene una revisión manual de esas filas en el Excel antes de la publicación oficial.

### Fotos, Instagram y teléfono de negocio (material "ADN Emprendedor de Egresados USB")

Además del Excel, se incorporó el material oficial "ADN Emprendedor de Egresados USB" (tarjetas con foto y datos de contacto de algunos egresados emprendedores, compartido por Alumni USB Cali). De ahí salen los campos opcionales `foto` (`src/data/media.json`, imágenes reales en `public/egresados/`), `instagram` y `telefonoNegocio` del negocio — datos que los propios egresados publicaron en su material promocional, no datos personales del Excel. Cuando existe foto real, se muestra en vez del `Portrait.tsx` generado (en el hero del perfil, en la vitrina de destacados y como avatar en el listado); cuando no, se sigue usando el retrato generado por código. Las fotos se recortaron directamente de un PDF con la foto individual de cada emprendedora en alta resolución (compartido aparte por Jose), no de las tarjetas compuestas originales.

También se agregó el **logo de cada emprendimiento** (`src/data/media.json`, imágenes en `public/logos/`), recortado del material oficial. Se muestra junto al nombre del emprendimiento en la ficha de cada perfil (`/egresado/:slug`, sección "Ficha del emprendimiento"). Solo las 8 personas con foto tienen logo por ahora; si una persona no tiene logo, la ficha simplemente muestra el nombre sin logo.

La vitrina editorial "ADN Emprendedor Egresados USB" (`FeaturedSection.tsx`, id `#destacados`, arriba en el home) ahora muestra automáticamente a **todos los egresados que tienen foto real** (hoy 8), en vez de una muestra genérica — así la sección principal de ADN Emprendedor son justamente las personas con material oficial de Alumni. Si en algún momento nadie tiene foto todavía, esa sección cae de vuelta a una muestra curada de perfiles completos para no quedar vacía.

Con este material se actualizaron **3 perfiles que ya existían** en el Excel (se les agregó foto, Instagram, teléfono y una breve descripción del emprendimiento, y se corrigió el nombre del emprendimiento con el dato más reciente):

- Stephanny Fiat C. — Fiat Ilustra
- Juanita Echeverri Arboleda — el emprendimiento pasó de "Little Sweet" a **"Mermé"** (nombre corregido)
- Laura Valentina Garzón — el emprendimiento pasó de "Aura Studio" a **"Aura Estudio"** (nombre corregido)

Y se agregaron **5 egresadas emprendedoras nuevas** que no estaban en el Excel, cada una con foto real, Instagram y/o teléfono de negocio: Yessica Escobar, Stephanie Prieto Sánchez, Ihovanna Orozco Gómez, Diana Carolina Monroy Rosero y Martha Myriam Ríos Martínez. Al no venir del Excel, sus campos académicos (programa, facultad, año de egreso, etc.) quedan en `null` — solo se publicó lo que el material oficial realmente trae.

**Nota sobre un error del material fuente:** la tarjeta de Martha Myriam Ríos Martínez en el PDF muestra el mismo correo que la tarjeta de Diana Carolina Monroy Rosero (`dianacarolinamonroy14@hotmail.com`) — es un error de copiar/pegar del documento, no el correo real de Martha. Por eso se dejó su `correo` en `null` a propósito (su Instagram y teléfono sí son correctos y se publicaron). Falta confirmar con ella o con Alumni USB Cali cuál es su correo real antes de publicarlo.

## Panel de administración (`/admin`)

El sitio incluye un panel de administración tipo WordPress en `/admin` (por ejemplo `https://tu-usuario.github.io/tu-repo/#/admin`), pensado para que la jefa pueda editar el contenido **sin tocar código, JSON ni terminal**: solo inicia sesión con usuario y clave, y usa formularios con botón "Guardar cambios".

Desde ahí se puede editar:

- **Egresados** — buscar, agregar, editar o eliminar cualquier egresado del directorio, incluyendo subir su foto y el logo de su emprendimiento.
- **Textos del sitio** — el título y subtítulo de la portada, los textos de cada sección, y todo el contenido de "Conecta" (pasos, requisitos, enlaces).

Cada "Guardar cambios" hace un commit directo al repositorio de GitHub a través de la API de GitHub, lo que dispara el despliegue automático (ver abajo) y actualiza el sitio publicado en 1-2 minutos.

Este panel necesita una configuración técnica **de una sola vez** (usuario/repositorio de GitHub + un token de acceso), que debe hacer quien despliega el sitio (no la jefa). La guía completa, paso a paso y sin dar nada por sabido, está en el documento **"Panel de administración y despliegue en GitHub"** que se entregó junto con este proyecto. Ahí también se explica cómo cambiar el usuario/clave por defecto del panel (`scripts/generar-clave-admin.mjs`) y las limitaciones de seguridad de este enfoque (el repositorio es público, así que el hash de la clave es técnicamente visible — el token de GitHub es la verdadera barrera de seguridad, y solo vive en el navegador de quien lo configura).

## Despliegue en GitHub Pages

El repositorio incluye `.github/workflows/deploy.yml`: cada vez que se hace push a `main` (incluyendo los commits que hace el panel de administración), GitHub Actions compila el proyecto (`npm run build`) y publica automáticamente el contenido de `dist/` en GitHub Pages. No hay que compilar ni subir nada a mano. Los pasos para activarlo por primera vez (crear el repositorio, subir el proyecto, activar Pages) están en la guía mencionada arriba.

## Secciones de contenido de ejemplo (revisar antes de publicar)

`src/components/ConectaSection.tsx` (sección "Conecta" del home, con id `#conecta`) trae texto de ejemplo que **no viene de ninguna página oficial de la universidad** — se redactó como placeholder editable, tal como se acordó:

- Los 4 "pasos para inscribirte" y la lista de requisitos son genéricos.
- Los tres botones ("Actualiza tus datos", "Regístrate como egresado emprendedor", "Capacitaciones") no tienen URL todavía (`href="#"`).

Hay que reemplazar ese texto y agregar las URLs reales antes de que el sitio salga a producción — esto ya se puede hacer directamente desde el panel de administración (pestaña "Textos del sitio"), sin tocar código.

## Notas de accesibilidad y rendimiento

- Los efectos de scroll pesados (parallax, scroll horizontal pineado) se desactivan automáticamente si el usuario tiene activado "reducir movimiento" en su sistema operativo (`usePrefersReducedMotion`).
- El cursor personalizado se desactiva en dispositivos táctiles.
- Las animaciones usan `transform`/`opacity` y se disparan con `whileInView`/`IntersectionObserver`, evitando animar en elementos fuera de pantalla.

## Qué sigue

- Revisar y reemplazar el contenido placeholder de "Conecta" (pasos, requisitos, URLs) — ya se puede hacer desde `/admin`.
- Corregir manualmente en el Excel los nombres con apellido/nombre invertidos, y actualizar esos registros (desde el panel o regenerando `egresados.json`).
- Confirmar con Martha Myriam Ríos Martínez (o con Alumni USB Cali) su correo real, ya que el del material PDF estaba duplicado con el de otra egresada.
- Seguir enriqueciendo perfiles con foto/Instagram/teléfono a medida que Alumni USB Cali comparta más material tipo "ADN Emprendedor" — ahora se puede hacer directamente desde `/admin`, sin regenerar nada a mano.
- Completar la configuración técnica de una sola vez (repositorio de GitHub + token) siguiendo la guía entregada, y cambiar el usuario/clave por defecto del panel antes de compartirlo.
