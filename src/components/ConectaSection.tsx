import { motion } from "framer-motion";
import alumniLogo from "../assets/brand/alumni-logo.png";
import content from "../data/content.json";

/**
 * Todo el texto de esta sección (pasos, requisitos, tarjeta "Actualiza tus
 * datos" y los enlaces) vive en src/data/content.json → conecta, y se puede
 * editar desde el panel de administración (/admin) sin tocar código.
 */
const { eyebrow, titulo, subtitulo, pasos, requisitos, actualizar, enlaces, convocatoria } = content.conecta;

export default function ConectaSection() {
  return (
    <section id="conecta" className="relative border-t border-paper/10 bg-ink px-4 py-28 sm:px-8 lg:py-40">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
          <h2 className="font-display text-balance text-4xl font-light text-paper sm:text-5xl lg:text-6xl">
            {titulo}
          </h2>
          <p className="mt-4 max-w-xl text-sm text-paper-dim">{subtitulo}</p>
        </motion.div>

        {/* convocatoria para nuevos emprendedores — el CTA principal de esta sección */}
        {convocatoria && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8 }}
            className="relative mb-16 overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-ink-2 to-ink p-8 sm:p-12"
          >
            <div className="grain absolute inset-0 opacity-30" />
            <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="mb-2 text-xs uppercase tracking-[0.25em] text-gold">ADN Emprendedor</p>
                <h3 className="font-display text-balance text-2xl font-light text-paper sm:text-3xl">
                  {convocatoria.titulo}
                </h3>
                <p className="mt-3 text-sm text-paper-dim">{convocatoria.texto}</p>
              </div>
              <a
                href={convocatoria.href || "#"}
                target={convocatoria.href?.startsWith("http") ? "_blank" : undefined}
                rel={convocatoria.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                data-cursor-hover
                className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-gold px-7 py-3.5 text-sm uppercase tracking-[0.15em] text-ink transition-opacity hover:opacity-90"
              >
                {convocatoria.ctaLabel}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </div>
          </motion.div>
        )}

        {/* pasos */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((p, i) => (
            <motion.div
              key={p.numero}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-gold/30 pt-5"
            >
              <p className="font-display mb-3 text-3xl font-light text-gold">{p.numero}</p>
              <h3 className="mb-2 text-lg text-paper">{p.titulo}</h3>
              <p className="text-sm text-paper-dim">{p.texto}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA principal: actualizar datos, con el logo de Alumni */}
        <motion.a
          href={actualizar.href || "#"}
          target={actualizar.href?.startsWith("http") ? "_blank" : undefined}
          rel={actualizar.href?.startsWith("http") ? "noopener noreferrer" : undefined}
          data-cursor-hover
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="group relative mt-16 flex flex-col items-start gap-6 overflow-hidden rounded-3xl border border-gold/40 bg-ink-2/60 p-8 transition-colors hover:border-gold sm:flex-row sm:items-center sm:justify-between sm:p-10"
        >
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-paper p-4 shadow-lg sm:h-32 sm:w-32">
              <img src={alumniLogo} alt="Alumni USB Cali" className="h-full w-full object-contain" />
            </span>
            <div>
              <h3 className="font-display text-2xl font-light text-paper">{actualizar.titulo}</h3>
              <p className="mt-1 max-w-md text-sm text-paper-dim">{actualizar.desc}</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold">
            Ir ahora
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </motion.a>

        {/* requisitos */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 rounded-3xl border border-paper/10 bg-ink-2/60 p-8 sm:p-10"
        >
          <h3 className="font-display mb-5 text-2xl font-light text-paper">Requisitos</h3>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {requisitos.map((r) => (
              <li key={r} className="flex gap-3 text-sm text-paper-dim">
                <span className="text-gold">—</span>
                {r}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* otros enlaces */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {enlaces.map((link, i) => (
            <motion.a
              key={link.titulo}
              href={link.href || "#"}
              target={link.href?.startsWith("http") ? "_blank" : undefined}
              rel={link.href?.startsWith("http") ? "noopener noreferrer" : undefined}
              data-cursor-hover
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-paper/10 p-7 transition-colors hover:border-gold/50"
            >
              <h3 className="font-display mb-2 text-xl text-paper">{link.titulo}</h3>
              <p className="text-sm text-paper-dim">{link.desc}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold opacity-0 transition-opacity group-hover:opacity-100">
                Ir ahora →
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
