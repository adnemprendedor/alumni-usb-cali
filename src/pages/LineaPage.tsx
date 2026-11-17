import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { RUTAS, sitio, type PaginaId } from "../data/sitio";
import { SECCIONES, seccionesDe } from "./secciones";

/** Datos de cada línea de visibilización de la Red (para la cabecera). */
const LINEAS: { id: PaginaId | "juego"; titulo: string; ruta: string }[] = [
  { id: "adn", titulo: "ADN Emprendedor", ruta: RUTAS.adn },
  { id: "mundo", titulo: "Egresados por el mundo", ruta: RUTAS.mundo },
  { id: "inspiran", titulo: "Egresados que inspiran", ruta: RUTAS.inspiran },
  { id: "juego", titulo: "Juego Alumni USB", ruta: "/juego" },
];

/** Barra que ubica al visitante: esta página es una línea de la Red Alumni. */
export function CabeceraLinea({ actual }: { actual: PaginaId | "juego" }) {
  return (
    <div className="relative z-20 bg-ink px-4 pb-2 pt-28 sm:px-8 sm:pt-36">
      <nav aria-label="Líneas de la Red Alumni" className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3">
        <Link to="/" data-cursor-hover className="text-xs uppercase tracking-[0.18em] text-paper-dim hover:text-gold">
          {sitio.red.concepto.nombre}
        </Link>
        <span className="text-paper-dim/50" aria-hidden>
          /
        </span>
        <ul className="flex flex-wrap gap-2">
          {LINEAS.map((l) => (
            <li key={l.id}>
              <Link
                to={l.ruta}
                aria-current={l.id === actual ? "page" : undefined}
                data-cursor-hover
                className={`inline-block rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                  l.id === actual
                    ? "border-gold bg-gold text-ink"
                    : "border-white/15 text-paper-dim hover:border-gold/60 hover:text-paper"
                }`}
              >
                {l.titulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/** Página de una línea de la Red (ADN Emprendedor, Por el mundo, Inspiran). */
export default function LineaPage({ pagina }: { pagina: PaginaId }) {
  return (
    <>
      <CabeceraLinea actual={pagina} />
      <div className="linea-contenido">
        {seccionesDe(pagina).map((s) => {
          const Seccion = SECCIONES[s.id];
          return <Seccion key={s.id} />;
        })}
      </div>
      <Footer />
    </>
  );
}
