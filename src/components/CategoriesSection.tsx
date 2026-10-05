import { motion } from "framer-motion";
import { sectores } from "../data/derived";
import { hueSeed } from "../lib/color";
import content from "../data/content.json";

const { eyebrow, titulo: SECTION_TITLE } = content.secciones.enfoques;

/** Guarda la categoría elegida para que SearchSection la lea al montar y
 * aplique el filtro automáticamente — así una tarjeta de categoría navega
 * directo a los resultados filtrados del directorio. */
function irAlDirectorioFiltrado(nombre: string) {
  try {
    sessionStorage.setItem("categoriaFiltro", nombre);
  } catch {
    // almacenamiento no disponible: la navegación por ancla sigue funcionando
  }
}

export default function CategoriesSection() {
  return (
    <section id="categorias" className="relative overflow-hidden bg-ink px-4 py-28 sm:px-8 lg:py-40">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
          className="mb-14 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
            <h2 className="font-display text-balance text-4xl font-light text-paper sm:text-5xl lg:text-6xl">
              {SECTION_TITLE}
            </h2>
          </div>
          <p className="max-w-xs text-sm text-paper-dim">
            Cada emprendimiento clasificado según su categoría o sector de actividad.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {sectores.map((cat, i) => {
            const hue = 18 + (hueSeed(cat.nombre) % 40);
            return (
              <motion.div
                key={cat.nombre}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <a
                  href="#buscador"
                  data-cursor-hover
                  onClick={() => irAlDirectorioFiltrado(cat.nombre)}
                  className="group relative flex h-36 flex-col justify-between overflow-hidden rounded-2xl border border-paper/10 p-5 transition-colors hover:border-gold/50 sm:h-40"
                >
                  <div
                    className="absolute inset-0 -z-10 opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      backgroundImage: `radial-gradient(120% 120% at 20% 0%, hsla(${hue}, 55%, 24%, 1), hsla(${hue}, 40%, 10%, 1) 70%)`,
                    }}
                  />
                  <div className="grain absolute inset-0 -z-10" />

                  <span className="text-xs uppercase tracking-[0.2em] text-paper-dim/80 transition-colors group-hover:text-gold">
                    +{cat.count}
                  </span>

                  <div>
                    <h3 className="font-display text-balance text-lg font-light leading-tight text-paper sm:text-xl">
                      {cat.nombre}
                    </h3>
                    <motion.span
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-paper-dim/70 transition-colors group-hover:text-gold"
                    >
                      Ver emprendimientos
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </motion.span>
                  </div>
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
