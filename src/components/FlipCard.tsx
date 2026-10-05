import { useState } from "react";
import { motion } from "framer-motion";
import Portrait from "./Portrait";
import { hueSeed } from "../lib/color";
import type { JuegoEgresado } from "../data/juego";

const TIPO_LABEL: Record<string, string> = {
  Emprendedor: "Emprendedor",
  Empresario: "Empresario",
  Empleado: "Empleado",
};

export default function FlipCard({ persona }: { persona: JuegoEgresado }) {
  const [flipped, setFlipped] = useState(false);
  const hue = hueSeed(persona.id);
  const base = 18 + (((hue % 34) + 34) % 34);

  const esNegocio = persona.tipo === "Emprendedor" || persona.tipo === "Empresario";
  const nombreNegocio = persona.nombreNegocio;

  return (
    <button
      type="button"
      onClick={() => setFlipped((v) => !v)}
      data-cursor-hover
      aria-pressed={flipped}
      aria-label={`${persona.nombre}. Toca para ${flipped ? "ver el frente" : "ver más información"}.`}
      className="group relative block aspect-[3/4] w-full cursor-pointer text-left"
      style={{ perspective: "1400px" }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* frente: solo foto + nombre */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl border border-paper/10 shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Portrait hue={hue} className="h-full w-full">
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-display text-balance text-lg leading-tight text-paper sm:text-xl">
                {persona.nombre}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gold">
                Toca para ver más ↻
              </p>
            </div>
          </Portrait>
        </div>

        {/* reverso: tipo + información específica */}
        <div
          className="absolute inset-0 flex flex-col justify-center overflow-hidden rounded-2xl border border-gold/30 bg-ink-2 p-5 shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {esNegocio && (
            <span
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-base font-medium text-paper"
              style={{ backgroundColor: `hsl(${base}, 55%, 22%)` }}
              aria-hidden
            >
              {(nombreNegocio ?? persona.nombre).charAt(0)}
            </span>
          )}

          <p className="text-[10px] uppercase tracking-[0.25em] text-gold">{TIPO_LABEL[persona.tipo]}</p>
          <p className="font-display mt-1 text-lg text-paper">{persona.nombre}</p>

          <div className="mt-4 flex flex-col gap-3 border-t border-paper/10 pt-4">
            {esNegocio ? (
              <>
                {nombreNegocio && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-paper-dim">
                      {persona.tipo === "Empresario" ? "Empresa" : "Emprendimiento"}
                    </p>
                    <p className="mt-1 text-sm text-paper">{nombreNegocio}</p>
                  </div>
                )}
                {persona.tiempoEmprendimiento && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-paper-dim">Tiempo</p>
                    <p className="mt-1 text-sm text-paper">{persona.tiempoEmprendimiento}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {persona.cargo && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-paper-dim">Cargo</p>
                    <p className="mt-1 text-sm text-paper">{persona.cargo}</p>
                  </div>
                )}
                {persona.nombreEmpresa && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-paper-dim">Empresa</p>
                    <p className="mt-1 text-sm text-paper">{persona.nombreEmpresa}</p>
                  </div>
                )}
                {persona.aniosEnCargo && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-paper-dim">Antigüedad en el cargo</p>
                    <p className="mt-1 text-sm text-paper">{persona.aniosEnCargo}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </button>
  );
}
