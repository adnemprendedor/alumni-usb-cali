// Clasificación automática de cada emprendimiento en una categoría/sector,
// siguiendo la lista sugerida en la propuesta "ADN Emprendedor" de Alumni USB
// Cali (Gastronomía, Moda y belleza, Educación, Tecnología, Salud y bienestar,
// Servicios profesionales, Arte y cultura, Comercio, Turismo, Otros).
//
// Es una clasificación por palabras clave sobre el nombre del emprendimiento
// y su descripción (cuando existe). Es un primer filtro automático, no una
// verificación manual: los casos sin coincidencias claras caen en "Otros" en
// vez de adivinar, para no publicar una categoría incorrecta sobre un negocio
// real. Si más adelante alguien quiere corregir casos puntuales, lo más simple
// es agregar una entrada a OVERRIDES abajo (clave = slug del egresado).
import type { Egresado } from "../data/egresados";

export const SECTORES = [
  "Gastronomía",
  "Moda y belleza",
  "Educación",
  "Tecnología",
  "Salud y bienestar",
  "Servicios profesionales",
  "Arte y cultura",
  "Comercio",
  "Turismo",
  "Otros",
] as const;

export type Sector = (typeof SECTORES)[number];

/**
 * Palabras clave por sector. Cada entrada se compara como "empieza con" sobre
 * las palabras del texto normalizado (minúsculas, sin tildes), así que
 * "medic" coincide con "médico", "medicina", "medicamento", etc.
 */
const KEYWORDS: Record<Sector, string[]> = {
  Gastronomía: [
    "restaurant", "comida", "gastronom", "cafe", "panaderia", "reposteria",
    "reposter", "catering", "asad", "parrilla", "arepa", "pizza", "helad",
    "dulce", "postre", "cocina", "aliment", "bebida", "kefir", "probiotic",
    "gourmet", "sabor", "sazon", "cafeteria", "torta", "pastel", "empanada",
    "tamal", "sancocho", "ceviche", "sushi", "panader", "licor", "cerveza",
    "vino", "chocolate", "fruver", "carniceria", "charcuteria", "mermelada",
    "desayuno", "pulpa de fruta", "pulpas",
  ],
  "Moda y belleza": [
    "moda", "boutique", "accesorio", "bisuteria", "joyer", "belleza",
    "cosmetic", "cosmet", "peluqueria", "barber", "unas", "estetic",
    "calzado", "bolso", "textil", "confeccion", "indumentaria", "crochet",
    "tejido", "ropa", "vestido", "maquillaje", "prenda", "reloj", "collar",
  ],
  Educación: [
    "educa", "colegio", "academia", "capacitacion", "formacion", "curso",
    "tutor", "idioma", "pedagog", "preescolar", "kinder", "jardin infantil",
    "refuerzo escolar", "bilingue",
  ],
  Tecnología: [
    "tecnolog", "software", "aplicacion movil", "digital", "sistemas",
    "desarrollo web", "desarrollador", "programacion", "fintech",
    "plataforma digital", "ecommerce", "e-commerce", "ciberseguridad",
    "robotica", "informatic",
  ],
  "Salud y bienestar": [
    "medic", "odontolog", "nutricion", "fisioterap", "bienestar", "fitness",
    "gimnasio", "psicolog", "terapeut", "wellness", "masaje", "yoga",
    "pilates", "clinica", "veterinari", "mascota", "estetica facial",
    "rehabilitacion",
  ],
  "Servicios profesionales": [
    "consultor", "asesor", "contab", "juridic", "abogad",
    "derecho", "arquitect", "ingenieri", "seguro", "inmobiliari", "marketing",
    "publicidad", "auditoria", "financier", "recurso human", "talento human",
    "seguridad privada", "logistica", "transporte", "comercio exterior",
    "zona franca", "notaria", "traduccion", "construccion", "coaching",
  ],
  "Arte y cultura": [
    "diseno grafic", "fotografia", "musica", "audiovisual", "cine",
    "cultural", "galeria", "editorial", "producciones",
    "ilustracion", "teatro", "danza", "pintura", "escultura", "artesania",
  ],
  Comercio: [
    "comercializ", "distribu", "mayorista", "minorista", "tienda",
    "venta de", "importacion", "exportacion", "retail", "almacen",
    "ferreteria", "supermercado", "manufactura", "bodega", "abarrotes",
  ],
  Turismo: [
    "turismo", "turistic", "viaje", "hotel", "hospedaje",
    "agencia de viajes", "tour", "ecoturismo", "hostal", "glamping",
    "excursion",
  ],
  Otros: [],
};

// Palabras completas (no prefijos) que exigen coincidencia exacta de la
// palabra para evitar falsos positivos frecuentes, p. ej. "saludable" no debe
// clasificar como "Salud y bienestar".
const EXACT_WORDS = new Set(["salud", "moda", "arte", "bar", "tour"]);

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // quita tildes
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cuenta(texto: string, palabra: string): number {
  const p = normalizar(palabra).trim();
  if (!p) return 0;
  // Siempre exige un límite de palabra al INICIO de la coincidencia (para que
  // "curso" no "aparezca dentro" de "recurso"), y además al final para las
  // palabras cortas de EXACT_WORDS (para que "salud" no aparezca dentro de
  // "saludable").
  const pattern = EXACT_WORDS.has(p)
    ? `\\b${escapeRegex(p)}\\b`
    : `\\b${escapeRegex(p)}`;
  return new RegExp(pattern).test(texto) ? 1 : 0;
}

/** Overrides manuales por slug, por si algún caso puntual necesita corrección. */
const OVERRIDES: Record<string, Sector> = {};

export function sectorDe(e: Egresado): Sector {
  if (OVERRIDES[e.slug]) return OVERRIDES[e.slug];

  const texto = normalizar(`${e.nombreEmprendimiento} ${e.descripcion ?? ""}`);

  let mejor: Sector = "Otros";
  let mejorScore = 0;

  for (const sector of SECTORES) {
    if (sector === "Otros") continue;
    const score = KEYWORDS[sector].reduce((acc, kw) => acc + cuenta(texto, kw), 0);
    if (score > mejorScore) {
      mejorScore = score;
      mejor = sector;
    }
  }

  return mejor;
}
