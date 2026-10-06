import { egresados, type Egresado } from "./egresados";
import { fotos } from "./fotos";
import { logos } from "./logos";
import { SECTORES, sectorDe } from "../lib/sector";

export interface EnfoqueGroup {
  nombre: string;
  count: number;
}

const ENFOQUE_ORDER = ["Empresarial", "Social", "Ambiental", "Cultural", "Deportivo", "Otro"];

export const enfoques: EnfoqueGroup[] = ENFOQUE_ORDER.map((nombre) => ({
  nombre,
  count: egresados.filter((e) => e.enfoque === nombre).length,
})).filter((e) => e.count > 0);

/**
 * Categoría / sector de cada emprendimiento, siguiendo la propuesta "ADN
 * Emprendedor" (Gastronomía, Moda y belleza, Educación, Tecnología, Salud y
 * bienestar, Servicios profesionales, Arte y cultura, Comercio, Turismo,
 * Otros). Es una clasificación automática por palabras clave — ver
 * src/lib/sector.ts para el detalle y cómo corregir un caso puntual.
 */
export const sectorPorSlug: Record<string, string> = Object.fromEntries(
  egresados.map((e) => [e.slug, sectorDe(e)])
);

export const sectores: EnfoqueGroup[] = SECTORES.map((nombre) => ({
  nombre,
  count: egresados.filter((e) => sectorPorSlug[e.slug] === nombre).length,
})).filter((s) => s.count > 0);

export interface ProgramaGroup {
  nombre: string;
  count: number;
}

export const programas: ProgramaGroup[] = Array.from(
  egresados.reduce((map, e) => {
    if (!e.programa) return map;
    map.set(e.programa, (map.get(e.programa) ?? 0) + 1);
    return map;
  }, new Map<string, number>())
)
  .map(([nombre, count]) => ({ nombre, count }))
  .sort((a, b) => b.count - a.count || a.nombre.localeCompare(b.nombre));

export const facultades = Array.from(new Set(egresados.map((e) => e.facultad).filter((f): f is string => !!f)));

export const stats = [
  { numero: egresados.length, label: "Egresados emprendedores" },
  { numero: programas.length, label: "Programas académicos" },
  { numero: facultades.length, label: "Facultades representadas" },
];

/**
 * The editorial "destacados" section (ADN Emprendedor Egresados USB): shows
 * every egresado who has a real photo from the official "ADN Emprendedor de
 * Egresados USB" material. Requested by Jose so the people with real photos
 * are the ones featured in the main showcase, instead of a generic sample.
 * If nobody has a photo yet, falls back to a small curated sample of
 * complete entries so the section never renders empty.
 */
const conFoto = egresados.filter((e) => fotos[e.slug]);

export const destacados: Egresado[] =
  conFoto.length > 0
    ? conFoto
    : egresados.filter((e) => e.programa && e.enfoque && e.tipo && e.nombreEmprendimiento).slice(0, 6);

/**
 * Segunda muestra, sin solapar con "destacados", para el carril horizontal
 * "Lo que construyen los egresados". Prioriza quienes tienen algo real que
 * mostrar (logo, foto o descripción) para que las tarjetas no se vean
 * vacías; completa el resto con egresados que al menos tienen el campo
 * "emprendimiento asociado a" diligenciado.
 */
const conContenidoReal = egresados.filter(
  (e) => (fotos[e.slug] || logos[e.slug] || e.descripcion) && !destacados.some((d) => d.id === e.id)
);
const relleno = egresados.filter(
  (e) =>
    e.emprendimientoAsociadoA &&
    !destacados.some((d) => d.id === e.id) &&
    !conContenidoReal.some((r) => r.id === e.id)
);
export const emprendimientosDestacados: Egresado[] = [...conContenidoReal, ...relleno].slice(0, 16);

/**
 * "Emprendimiento destacado": una sola selección que rota periódicamente
 * (cada semana del año), de la propuesta "ADN Emprendedor" — una sección
 * dinámica distinta del listado narrativo de "destacados". Se elige entre
 * quienes tienen una descripción real (historia propia), para que el
 * destacado siempre cuente con una historia que mostrar.
 */
const conHistoria = egresados.filter((e) => e.descripcion);
const pool = conHistoria.length > 0 ? conHistoria : egresados.slice(0, 20);

function numeroDeSemanaDelAnio(fecha: Date): number {
  const inicio = new Date(fecha.getFullYear(), 0, 1);
  const dias = Math.floor((fecha.getTime() - inicio.getTime()) / 86400000);
  return Math.floor(dias / 7);
}

export const emprendimientoDestacado: Egresado =
  pool[numeroDeSemanaDelAnio(new Date()) % pool.length];
