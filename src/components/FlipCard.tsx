import { useState } from "react";
import { motion } from "framer-motion";
import Portrait from "./Portrait";
import { hueSeed } from "../lib/color";
import type { JuegoEgresado } from "../data/juego";

function Dato({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.15em] text-paper-dim">{label}</p>
      <p className="mt-0.5 text-sm leading-snug text-paper">{value}</p>
    </div>
  );
}

export default function FlipCard({ persona }: { persona: JuegoEgresado }) {
  const [flipped, setFlipped] = useState(false);
  const hue = hueSeed(persona.id);
  const foto = persona.foto ? `${import.meta.env.BASE_URL}${persona.foto}` : null;

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
        {/* frente: foto + nombre + país */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl border border-paper/10 shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Portrait hue={hue} className="h-full w-full">
            {foto && (
              <div className="absolute inset-x-0 top-[9%] flex justify-center">
                <img
                  src={foto}
                  alt={persona.nombre}
                  loading="lazy"
                  className="aspect-square w-[68%] rounded-full object-cover object-top ring-2 ring-gold/60 ring-offset-2 ring-offset-transparent shadow-xl"
                />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-display text-balance text-base leading-tight text-paper sm:text-lg">
                {persona.nombre}
              </p>
              <p className="mt-1 text-xs text-paper-dim">{persona.pais}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gold">
                Toca para ver más ↻
              </p>
            </div>
          </Portrait>
        </div>

        {/* reverso: programa, empresa y ocupación */}
        <div
          className="absolute inset-0 flex flex-col overflow-y-auto rounded-2xl border border-gold/30 bg-ink-2 p-5 shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="my-auto">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold">{persona.pais}</p>
          <p className="font-display mt-1 text-base leading-tight text-paper sm:text-lg">{persona.nombre}</p>

          <div className="mt-3 flex flex-col gap-2.5 border-t border-paper/10 pt-3">
            <Dato label="Programa USB" value={persona.programa} />
            <Dato label="Empresa" value={persona.empresa} />
            <Dato label="Ocupación" value={persona.ocupacion} />
          </div>
          </div>
        </div>
      </motion.div>
    </button>
  );
}
