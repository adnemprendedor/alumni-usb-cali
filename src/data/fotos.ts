// Fotos reales de egresados emprendedores, provistas directamente por Alumni USB
// Cali (material oficial "ADN Emprendedor de Egresados USB"). Solo las personas
// listadas en media.json tienen foto real — el resto del directorio sigue
// usando el retrato generado (Portrait.tsx). Los archivos viven en /public/egresados
// (no se empaquetan con Vite) para que el panel de administración pueda agregar o
// reemplazar fotos subiendo un archivo, sin tocar código ni volver a compilar nada
// a mano.
import media from "./media.json";

type MediaEntry = { foto?: string; logo?: string };
const mediaMap = media as Record<string, MediaEntry>;

export const fotos: Record<string, string> = Object.fromEntries(
  Object.entries(mediaMap)
    .filter(([, v]) => v.foto)
    .map(([slug, v]) => [slug, `${import.meta.env.BASE_URL}${v.foto}`])
);
