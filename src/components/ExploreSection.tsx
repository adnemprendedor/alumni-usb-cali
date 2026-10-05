import { useState } from "react";
import { motion } from "framer-motion";
import content from "../data/content.json";

const { titulo: SECTION_TITLE, subtitulo: SECTION_SUBTITLE } = content.secciones.explora;

const ITEMS = [
  { title: "ADN Emprendedor", desc: "El directorio completo, con buscador y filtros.", href: "#buscador", hue: 22, span: "lg:col-span-7" },
  { title: "Emprendimientos", desc: "Los proyectos que construyen.", href: "#emprendimientos", hue: 30, span: "lg:col-span-5" },
  { title: "Categorías", desc: "Gastronomía, moda, tecnología y más.", href: "#categorias", hue: 26, span: "lg:col-span-4" },
  { title: "Programas", desc: "El talento según su programa académico.", href: "#carreras", hue: 34, span: "lg:col-span-4" },
  { title: "Participa", desc: "Registra tu emprendimiento y conecta con Alumni.", href: "#conecta", hue: 20, span: "lg:col-span-4" },
];

export default function ExploreSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="explora" className="relative bg-ink px-4 py-28 sm:px-8 lg:py-40">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
        >
          <h2 className="font-display text-balance text-4xl font-light text-paper sm:text-5xl lg:text-6xl">
            {SECTION_TITLE}
          </h2>
          <p className="max-w-xs text-sm text-paper-dim">{SECTION_SUBTITLE}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {ITEMS.map((item, i) => (
            <motion.a
              href={item.href}
              data-cursor-hover
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`group relative block h-72 overflow-hidden rounded-2xl border border-paper/10 sm:h-80 ${item.span}`}
              style={{
                opacity: hovered !== null && hovered !== i ? 0.55 : 1,
                transition: "opacity 0.4s ease",
              }}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ scale: hovered === i ? 1.08 : 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  backgroundImage: `radial-gradient(120% 100% at 30% 20%, hsla(${item.hue}, 60%, 30%, 0.9), hsla(${item.hue}, 40%, 8%, 1) 65%)`,
                }}
              />
              <div className="grain absolute inset-0" />
              <motion.div
                className="absolute inset-0 bg-ink/40"
                animate={{ opacity: hovered === i ? 0.15 : 0.45 }}
                transition={{ duration: 0.5 }}
              />

              <div className="relative flex h-full flex-col justify-end p-7">
                <motion.h3
                  className="font-display text-3xl font-light text-paper sm:text-4xl"
                  animate={{ x: hovered === i ? 8 : 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {item.title}
                </motion.h3>
                <p className="mt-2 max-w-xs text-sm text-paper-dim">{item.desc}</p>
                <motion.span
                  className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-paper/30 text-sm text-paper"
                  animate={{
                    x: hovered === i ? 6 : 0,
                    borderColor: hovered === i ? "rgba(239,125,0,0.8)" : "rgba(247,245,242,0.3)",
                    color: hovered === i ? "#ef7d00" : "#f7f5f2",
                  }}
                  transition={{ duration: 0.4 }}
                >
                  ↗
                </motion.span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
