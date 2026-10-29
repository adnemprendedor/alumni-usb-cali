// Configuración general del sitio que se edita desde el panel de
// administración (/admin): orden y visibilidad de las secciones de la página
// de inicio, emprendedor de la semana, menú, pie de página, redes sociales y
// videos. El contenido vive en sitio.json — el panel lo edita vía GitHub.
import data from "./sitio.json";

export interface Enlace {
  label: string;
  href: string;
}

export interface SeccionConfig {
  id: string;
  nombre: string;
  visible: boolean;
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
