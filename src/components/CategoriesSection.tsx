import type { ReactElement } from "react";
import { motion } from "framer-motion";
import { sectores } from "../data/derived";
import { hueSeed } from "../lib/color";
import { Motif, MOTIVO_POR_SECTOR } from "./Portrait";
import { usePrefersReducedMotion } from "../hooks/useReducedMotion";
import content from "../data/content.json";

const { eyebrow, titulo: SECTION_TITLE } = content.secciones.enfoques;

/** Un ícono simple de línea por sector, para reforzar visualmente cada
 * categoría en sus tarjetas. */
const ICONO_POR_SECTOR: Record<string, ReactElement> = {
  "Gastronomía": (
    <path d="M6 3v7a3 3 0 0 0 3 3v8M6 3v5M9 3v5M12 3v18M18 3c-2 1-3 3-3 6 0 2.5 1.3 4 3 4.5V21" />
  ),
  "Moda y belleza": (
    <path d="M12 2 9 5l3 3 3-3-3-3Zm0 6v6m-5 8 5-5 5 5M7 16h10" />
  ),
  "Educación": (
    <path d="M2 8 12 3l10 5-10 5L2 8Zm5 3v6c0 1.5 2.5 3 5 3s5-1.5 5-3v-6M22 8v7" />
  ),
  "Tecnología": (
    <path d="M4 5h16v11H4zM9 21h6M12 16v5M8 9h2m2 0h4" />
  ),
  "Salud y bienestar": (
    <path d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.6-9.5 9-9.5 9ZM9 11h2v-2h2v2h2v2h-2v2h-2v-2H9z" />
  ),
  "Servicios profesionales": (
    <path d="M4 7h16v12H4zm4-4h8v4H8zM4 12h16" />
  ),
  "Arte y cultura": (
    <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.3A4.2 4.2 0 0 0 21 12a9 9 0 0 0-9-9Zm-4.5 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
  ),
  "Comercio": (
    <path d="M3 9 4.5 4h15L21 9M3 9v11h18V9M3 9h18M9 13a3 3 0 0 0 6 0" />
  ),
  "Turismo": (
    <path d="M12 2 2 8l10 6 10-6-10-6ZM2 16l10 6 10-6M2 12l10 6 10-6" />
  ),
  "Otros": (
    <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
  ),
};

function IconoSector({ sector }: { sector: string }) {
  const path = ICONO_POR_SECTOR[sector] ?? ICONO_POR_SECTOR["Otros"];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

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
  const reducedMotion = usePrefersReducedMotion();

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
            const motivo = MOTIVO_POR_SECTOR[cat.nombre] ?? "blob";
            const stroke = `hsla(${hue + 14}, 70%, 70%, 0.3)`;
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
                  className="group isolate relative flex h-36 flex-col justify-between overflow-hidden rounded-2xl border border-paper/10 p-5 transition-colors hover:border-gold/50 sm:h-40"
                >
                  <div
                    className="absolute inset-0 -z-10 opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      backgroundImage: `radial-gradient(120% 120% at 20% 0%, hsla(${hue}, 55%, 24%, 1), hsla(${hue}, 40%, 10%, 1) 70%)`,
                    }}
                  />
                  <div className="grain absolute inset-0 -z-10" />
                  <div className="absolute inset-0 -z-10">
                    <Motif motivo={motivo} stroke={stroke} reducedMotion={reducedMotion} seed={hue + i} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors group-hover:border-gold group-hover:bg-gold/10">
                      <IconoSector sector={cat.nombre} />
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-paper-dim/80 transition-colors group-hover:text-gold">
                      +{cat.count}
                    </span>
                  </div>

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
