import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { enfoques } from "../data/derived";
import { hueSeed } from "../lib/color";
import content from "../data/content.json";

const { eyebrow, titulo: SECTION_TITLE } = content.secciones.enfoques;

export default function CategoriesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 250, damping: 30 });
  const smy = useSpring(my, { stiffness: 250, damping: 30 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  const hue = hovered ? (18 + hueSeed(hovered)) % 45 : 28;

  return (
    <section id="categorias" className="relative overflow-hidden bg-ink px-4 py-28 sm:px-8 lg:py-40">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8 }}
      >
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
        <h2 className="font-display mb-14 text-balance text-4xl font-light text-paper sm:text-5xl lg:text-6xl">
          {SECTION_TITLE}
        </h2>
      </motion.div>

      <div
        ref={containerRef}
        onMouseMove={handleMove}
        onMouseLeave={() => setHovered(null)}
        className="relative mx-auto max-w-6xl"
      >
        {/* floating gradient blob that follows the cursor */}
        <motion.div
          className="pointer-events-none absolute -z-0 h-64 w-64 rounded-full blur-3xl transition-opacity duration-300 sm:h-80 sm:w-80"
          style={{
            left: smx,
            top: smy,
            translateX: "-50%",
            translateY: "-50%",
            opacity: hovered ? 0.55 : 0,
            backgroundImage: `radial-gradient(circle, hsla(${hue},80%,55%,0.9), transparent 70%)`,
          }}
        />

        <ul className="relative z-10 divide-y divide-paper/10 border-y border-paper/10">
          {enfoques.map((cat) => {
            const isHovered = hovered === cat.nombre;
            return (
              <li key={cat.nombre}>
                <a
                  href="#destacados"
                  data-cursor-hover
                  onMouseEnter={() => setHovered(cat.nombre)}
                  className="flex items-center justify-between gap-4 py-6 sm:py-8"
                >
                  <motion.span
                    className="font-display text-3xl leading-none text-paper sm:text-4xl lg:text-5xl"
                    animate={{
                      x: isHovered ? 16 : 0,
                      color: isHovered ? "#ef7d00" : "#f7f5f2",
                    }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {cat.nombre}
                  </motion.span>
                  <motion.span
                    className="whitespace-nowrap text-right text-xs uppercase tracking-[0.2em] text-paper-dim sm:text-sm"
                    animate={{ opacity: isHovered ? 1 : 0.5, x: isHovered ? 0 : 10 }}
                  >
                    +{cat.count} emprendimientos
                  </motion.span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
