import { motion, type Variants } from "framer-motion";
import { programas } from "../data/derived";
import content from "../data/content.json";

const { eyebrow, titulo: SECTION_TITLE } = content.secciones.carreras;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function CareersSection() {
  return (
    <section id="carreras" className="relative bg-ink px-4 py-28 sm:px-8 lg:py-40">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
          className="mb-14"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
          <h2 className="font-display text-balance text-4xl font-light text-paper sm:text-5xl lg:text-6xl">
            {SECTION_TITLE}
          </h2>
          <p className="mt-4 max-w-lg text-sm text-paper-dim">
            {programas.length} programas de la Universidad de San Buenaventura Cali están representados en la red de egresados emprendedores.
          </p>
        </motion.div>

        <motion.ul
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-x-10"
        >
          {programas.map((p) => (
            <motion.li key={p.nombre} variants={item}>
              <a
                href="#destacados"
                data-cursor-hover
                className="group inline-flex items-baseline gap-3 font-display text-xl font-light text-paper-dim transition-colors hover:text-gold sm:text-2xl lg:text-3xl"
              >
                {p.nombre}
                <span className="text-xs text-paper-dim/60 group-hover:text-gold">({p.count})</span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
