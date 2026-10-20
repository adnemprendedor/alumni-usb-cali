// Tarjetas del juego "Conoce a nuestros egresados" (sección /juego).
// Datos reales de la Diáspora CTI+E (egresados USB Cali en el exterior),
// enviados por Karol Valderrama: foto, nombre, país, programa, empresa y
// ocupación. Las fotos viven en /public/juego. Para agregar a alguien más,
// se añade una entrada en juego.json con los mismos campos y su foto en
// /public/juego (Fabian Paya Pinzón y Olaf Upegui quedan pendientes hasta
// tener su foto).
import data from "./juego.json";

export interface JuegoEgresado {
  id: string;
  slug: string;
  nombre: string;
  /** Ruta relativa dentro de /public, p. ej. "juego/nombre.png" */
  foto?: string | null;
  pais: string;
  programa: string;
  empresa?: string | null;
  ocupacion?: string | null;
}

export const juego: JuegoEgresado[] = data as JuegoEgresado[];
