// Datos de ejemplo para el juego de tarjetas "Conoce a nuestros egresados"
// (sección /juego). Son 20 egresados FICTICIOS de relleno — la profesora
// pidió el juego pero Jose todavía no tiene las 20 fotos ni los datos
// reales. El contenido vive en juego.json siguiendo el mismo patrón que
// egresados.json, así que cuando haya datos reales solo hay que reemplazar
// las entradas de ese archivo (mismo formato, mismos campos).
import data from "./juego.json";

export type TipoJuego = "Empleado" | "Empresario" | "Emprendedor";

export interface JuegoEgresado {
  id: string;
  slug: string;
  nombre: string;
  tipo: TipoJuego;
  /** Solo para Emprendedor / Empresario */
  nombreNegocio?: string | null;
  tiempoEmprendimiento?: string | null;
  /** Solo para Empleado */
  cargo?: string | null;
  aniosEnCargo?: string | null;
  nombreEmpresa?: string | null;
}

export const juego: JuegoEgresado[] = data as JuegoEgresado[];
