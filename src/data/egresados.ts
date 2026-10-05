// Datos de egresados emprendedores. El contenido vive en egresados.json —
// el panel de administración (/admin) edita ese JSON directamente vía GitHub,
// así que este archivo solo le da forma/tipo a esos datos para el resto del
// sitio. Ver README para el detalle de qué campos se publican y por qué.
import data from "./egresados.json";

export interface Egresado {
  id: string;
  slug: string;
  nombre: string;
  correo: string | null;
  instagram?: string | null;
  sitioWeb?: string | null;
  telefonoNegocio?: string | null;
  descripcion?: string | null;
  programa: string | null;
  facultad: string | null;
  facultadAcronimo: string | null;
  gradoAcademico: string | null;
  anioEgreso: string | null;
  paisResidencia: string | null;
  nombreEmprendimiento: string;
  emprendimientoAsociadoA: string | null;
  enfoque: string | null;
  tipo: string | null;
  antiguedad: string | null;
}

export const egresados: Egresado[] = data as Egresado[];
