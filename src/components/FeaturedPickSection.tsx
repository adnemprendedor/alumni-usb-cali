import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { emprendimientoDestacado, sectorPorSlug } from "../data/derived";
import { fotos } from "../data/fotos";
import { logos } from "../data/logos";
import { hueSeed } from "../lib/color";
import Portrait from "./Portrait";

/**
 * Sección "Emprendimiento destacado" de la propuesta ADN Emprendedor: una
 * sola selección con mayor visibilidad, que rota cada semana (ver
 * src/data/derived.ts → emprendimientoDestacado), distinta del listado
 * narrativo de "Egresados que Inspiran".
 */
export default function FeaturedPickSection() {
  const e = emprendimientoDestacado;
  if (!e) return null;

  const foto = fotos[e.slug];
  const logo = logos[e.slug];
  const sector = sectorPorSlug[e.slug];
  const hue = hueSeed(e.id);

  return (
    <section id="destacado-semana" className="relative bg-ink px-4 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7 }}
          className="mb-10 flex items-center gap-3"
        >
          <span className="text-gold">★</span>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Emprendimiento destacado · esta semana</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 overflow-hidden rounded-3xl border border-gold/25 bg-ink-2/40 lg:grid-cols-2"
        >
          <div className="relative h-72 lg:h-auto lg:min-h-[420px]">
            {foto ? (
              <div className="relative h-full w-full">
                <img src={foto} alt={e.nombre} className="h-full w-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-ink/10" />
              </div>
            ) : (
              <Portrait hue={hue} variant="wide" sector={sector} className="h-full w-full" />
            )}
            {logo && (
              <span className="absolute bottom-6 left-6 flex h-16 w-16 items-center justify-center rounded-xl bg-paper p-2.5 shadow-lg sm:h-20 sm:w-20">
                <img src={logo} alt={`Logo de ${e.nombreEmprendimiento}`} className="h-full w-full object-contain" />
              </span>
            )}
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
            {sector && (
              <span className="mb-4 inline-flex w-fit items-center rounded-full border border-gold/40 px-4 py-1 text-xs uppercase tracking-[0.2em] text-gold">
                {sector}
              </span>
            )}
            <h3 className="font-display text-balance text-3xl font-light text-paper sm:text-4xl">
              {e.nombreEmprendimiento}
            </h3>
            <p className="mt-2 text-sm text-paper-dim">
              {e.nombre}
              {e.programa ? ` · ${e.programa}` : ""}
            </p>

            {e.descripcion && (
              <p className="mt-6 max-w-md text-balance text-base text-paper-dim/90">
                {e.descripcion.length > 220 ? `${e.descripcion.slice(0, 217)}…` : e.descripcion}
              </p>
            )}

            <Link
              to={`/egresado/${e.slug}`}
              data-cursor-hover
              className="group mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-gold px-7 py-3 text-sm uppercase tracking-[0.15em] text-ink transition-opacity hover:opacity-90"
            >
              Conocer emprendimiento
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
