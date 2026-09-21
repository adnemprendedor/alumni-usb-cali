// Genera un slug (identificador para URLs) a partir de un nombre, quitando
// tildes, espacios y caracteres especiales. Se usa para crear el id/URL de
// un nuevo egresado y los nombres de archivo de su foto/logo.
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = slugify(base) || "egresado";
  let candidate = slug;
  let n = 2;
  while (taken.has(candidate)) {
    candidate = `${slug}-${n}`;
    n += 1;
  }
  return candidate;
}
