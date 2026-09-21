// Logos de los emprendimientos, provistos directamente por Alumni USB Cali junto
// con el material oficial "ADN Emprendedor de Egresados USB". Los archivos viven
// en /public/logos (no se empaquetan con Vite) para que el panel de administración
// pueda agregar o reemplazar un logo subiendo un archivo, sin tocar código.
import media from "./media.json";

type MediaEntry = { foto?: string; logo?: string };
const mediaMap = media as Record<string, MediaEntry>;

export const logos: Record<string, string> = Object.fromEntries(
  Object.entries(mediaMap)
    .filter(([, v]) => v.logo)
    .map(([slug, v]) => [slug, `${import.meta.env.BASE_URL}${v.logo}`])
);
