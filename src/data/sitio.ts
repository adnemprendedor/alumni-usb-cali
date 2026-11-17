// Configuración general del sitio que se edita desde el panel de
// administración (/admin): orden y visibilidad de las secciones de la página
// de inicio, emprendedor de la semana, menú, pie de página, redes sociales y
// videos. El contenido vive en sitio.json — el panel lo edita vía GitHub.
import data from "./sitio.json";

export interface Enlace {
  label: string;
  href: string;
}

/** Páginas del sitio: el inicio (la Red) y cada línea de visibilización. */
export type PaginaId = "inicio" | "adn" | "mundo" | "inspiran";

export interface SeccionConfig {
  id: string;
  nombre: string;
  visible: boolean;
  /** En qué página va la sección (si falta, va en el inicio). */
  pagina?: PaginaId;
}

export interface TarjetaLinea {
  titulo: string;
  texto: string;
  href: string;
  cta: string;
  imagen?: string | null;
  color?: string | null;
}

export interface Servicio {
  titulo: string;
  texto: string;
  href: string;
  cta: string;
  destacado?: boolean;
}

export interface Oportunidad {
  titulo: string;
  texto: string;
  href: string;
  cta: string;
  etiqueta?: string | null;
}

export interface Novedad {
  /** "2026-11" o "2026-11-20" */
  fecha: string;
  titulo: string;
  texto: string;
  etiqueta?: string | null;
  href?: string | null;
  imagen?: string | null;
}

interface Encabezado {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
}

export interface RedConfig {
  concepto: {
    nombre: string;
    lema: string;
    texto: string;
    bienvenida: string;
    ctaLabel: string;
    ctaHref: string;
    banner?: string | null;
    bannerTexto?: string;
  };
  explora: Encabezado;
  lineas: TarjetaLinea[];
  participa: Encabezado;
  servicios: Servicio[];
  historias: Encabezado & { cantidad: number };
  oportunidades: Encabezado & { items: Oportunidad[] };
  novedades: Encabezado & { items: Novedad[] };
  conecta: Encabezado & {
    portalLabel: string;
    portalHref: string;
    correo: string;
    whatsapp?: string | null;
    asuntos: string[];
  };
  privacidadLabel: string;
  privacidadHref: string;
}

export interface Contacto {
  nombre: string;
  cargo: string;
  correo?: string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  foto?: string | null;
  logo?: string | null;
  logoTexto?: string | null;
  /** Encuadre de la foto grande (object-position), p. ej. "50% 25%" */
  encuadre?: string | null;
}

export interface Historia {
  titulo: string;
  subtitulo: string;
  reel: string;
}

export interface SitioConfig {
  secciones: SeccionConfig[];
  red: RedConfig;
  destacadoSemana: { modo: "auto" | "manual"; slug: string | null };
  contacto?: { eyebrow: string; titulo: string; subtitulo: string };
  menu: Enlace[];
  botonMenu: Enlace;
  pie: {
    titulo: string;
    botonLabel: string;
    botonHref: string;
    columnas: { titulo: string; enlaces: Enlace[] }[];
    acercaTitulo: string;
    acercaTexto: string;
    contactos: Contacto[];
    horario: string;
    direccion: string | null;
    copyright: string;
  };
  redes: { nombre: string; url: string }[];
  videos: {
    eyebrow: string;
    titulo: string;
    subtitulo: string;
    videoPrincipal: string | null;
    feriaTitulo: string;
    feriaReel: string | null;
    historiasTitulo: string;
    historias: Historia[];
  };
}

export const sitio = data as SitioConfig;

/** Ruta de un archivo de /public (foto, logo, video) o una URL externa tal cual. */
export function rutaPublica(p?: string | null): string | null {
  if (!p) return null;
  if (/^(https?:)?\/\//.test(p) || p.startsWith("data:")) return p;
  return `${import.meta.env.BASE_URL}${p.replace(/^\//, "")}`;
}

/** Rutas de cada página del sitio. */
export const RUTAS: Record<PaginaId, string> = {
  inicio: "/",
  adn: "/adn-emprendedor",
  mundo: "/egresados-por-el-mundo",
  inspiran: "/egresados-que-inspiran",
};

/** ¿Es un enlace que sale del sitio? (para abrirlo en otra pestaña) */
export const esExterno = (href?: string | null) => !!href && /^(https?:|mailto:|tel:)/.test(href);
