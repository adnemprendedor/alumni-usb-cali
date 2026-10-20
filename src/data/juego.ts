// Tarjetas del juego "Conoce a nuestros egresados" (sección /juego).
// Mezcla egresados empleados (Diáspora CTI+E, enviados por Karol Valderrama,
// más el rector) con egresados emprendedores del directorio. El orden de
// juego.json ya viene intercalado (empleado / emprendedor, exterior / Colombia)
// y además la página permite mezclar las tarjetas.
//
// Para agregar a alguien: una entrada nueva en juego.json con estos campos.
// - foto: ruta dentro de /public (p. ej. "juego/nombre.png" o "egresados/x.jpg")
// - logo: ruta dentro de /public del logo de la empresa o emprendimiento
//   (opcional; si no hay, el reverso muestra la inicial de la empresa).
import data from "./juego.json";

export type TipoJuego = "Empleado" | "Emprendedor";

export interface JuegoEgresado {
  id: string;
  slug: string;
  nombre: string;
  tipo: TipoJuego;
  foto?: string | null;
  logo?: string | null;
  pais: string;
  programa: string;
  /** Empresa donde trabaja o nombre del emprendimiento */
  empresa?: string | null;
  ocupacion?: string | null;
}

export const juego: JuegoEgresado[] = data as JuegoEgresado[];
