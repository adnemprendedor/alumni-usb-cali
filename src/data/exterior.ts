// Egresados que viven fuera de Colombia (mapamundi de la portada).
// Los datos vienen de la base "Diáspora CTI+E" enviada por Karol Valderrama y
// del directorio (paisResidencia distinto de Colombia). Para agregar a alguien:
// una entrada nueva en exterior.json con su ciudad y coordenadas (lat, lng).
import data from "./exterior.json";

export interface EgresadoExterior {
  id: string;
  nombre: string;
  ciudad: string | null;
  pais: string;
  lat: number;
  lng: number;
  programa: string | null;
  empresa: string | null;
  ocupacion: string | null;
  /** Foto dentro de /public (opcional) */
  foto: string | null;
  /** Logo de la empresa dentro de /public (opcional) */
  logo: string | null;
  /** slug del perfil en el directorio (opcional) */
  perfil: string | null;
}

export const exterior = data as {
  titulo: string;
  texto: string;
  origen: { nombre: string; lat: number; lng: number };
  egresados: EgresadoExterior[];
};

/** Código ISO numérico de cada país, para resaltarlo en el mapa. */
export const ISO_PAIS: Record<string, string> = {
  Colombia: "170",
  "Estados Unidos": "840",
  Canadá: "124",
  México: "484",
  Brasil: "076",
  Argentina: "032",
  Chile: "152",
  Perú: "604",
  Ecuador: "218",
  Panamá: "591",
  España: "724",
  Francia: "250",
  Alemania: "276",
  Italia: "380",
  "Reino Unido": "826",
  Portugal: "620",
  "Países Bajos": "528",
  Suiza: "756",
  Australia: "036",
  Japón: "392",
};

export interface PuntoMapa {
  clave: string;
  lugar: string;
  pais: string;
  lat: number;
  lng: number;
  personas: EgresadoExterior[];
}

/** Agrupa a los egresados que comparten ubicación en un solo pin. */
export const puntosExterior: PuntoMapa[] = (() => {
  const mapa = new Map<string, PuntoMapa>();
  for (const e of exterior.egresados) {
    const clave = `${e.lat.toFixed(2)},${e.lng.toFixed(2)}`;
    const p = mapa.get(clave);
    if (p) p.personas.push(e);
    else
      mapa.set(clave, {
        clave,
        lugar: e.ciudad ? `${e.ciudad}, ${e.pais}` : e.pais,
        pais: e.pais,
        lat: e.lat,
        lng: e.lng,
        personas: [e],
      });
  }
  return [...mapa.values()];
})();

export const paisesExterior: { pais: string; total: number }[] = (() => {
  const c = new Map<string, number>();
  for (const e of exterior.egresados) c.set(e.pais, (c.get(e.pais) ?? 0) + 1);
  return [...c.entries()].map(([pais, total]) => ({ pais, total })).sort((a, b) => b.total - a.total);
})();
