import { egresados, type Egresado } from "./egresados";
import { fotos } from "./fotos";

export interface EnfoqueGroup {
  nombre: string;
  count: number;
}

const ENFOQUE_ORDER = ["Empresarial", "Social", "Ambiental", "Cultural", "Deportivo", "Otro"];

export const enfoques: EnfoqueGroup[] = ENFOQUE_ORDER.map((nombre) => ({
  nombre,
  count: egresados.filter((e) => e.enfoque === nombre).length,
})).filter((e) => e.count > 0);

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

/** A second, non-overlapping sample for the horizontal "emprendimientos" showcase. */
export const emprendimientosDestacados: Egresado[] = egresados
  .filter((e) => e.emprendimientoAsociadoA && !destacados.some((d) => d.id === e.id))
  .slice(0, 14);
