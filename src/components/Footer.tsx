import { motion } from "framer-motion";
import alumniLogo from "../assets/brand/alumni-logo.png";
import { sitio } from "../data/sitio";

const pie = sitio.pie;
const COLUMNS = pie.columnas.map((c) => ({ title: c.titulo, links: c.enlaces }));

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-paper/10 bg-ink px-4 pb-10 pt-24 sm:px-8 lg:pt-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundImage: "linear-gradient(90deg, transparent, rgba(239,125,0,0.5), transparent)" }}
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-center gap-4">
          <span className="flex h-20 items-center rounded-xl bg-paper px-4 py-3 shadow-lg sm:h-24">
            <img src={alumniLogo} alt="Alumni USB Cali — Red de Graduados" className="h-full w-auto object-contain" />
          </span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-balance text-4xl font-light leading-tight text-paper sm:text-5xl lg:text-6xl"
        >
          {pie.titulo.split("\n").map((linea, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {linea}
            </span>
          ))}
        </motion.h2>

        <motion.a
          href={pie.botonHref}
          data-cursor-hover
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="group mt-10 inline-flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-gold"
        >
          {pie.botonLabel}
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </motion.a>

        <div className="mt-20 grid grid-cols-2 gap-8 border-t border-paper/10 pt-12 sm:grid-cols-3 lg:grid-cols-4">
          {COLUMNS.map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-paper-dim">{col.title}</p>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={`${l.label}-${l.href}`}>
                    <a href={l.href} className="text-sm text-paper/80 transition-colors hover:text-gold">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.16 }}
          >
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-paper-dim">{pie.acercaTitulo}</p>
            <p className="max-w-xs text-sm text-paper/80">{pie.acercaTexto}</p>
            {sitio.redes.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {sitio.redes.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-hover
                    className="rounded-full border border-paper/15 px-3 py-1 text-xs text-paper/80 transition-colors hover:border-gold/50 hover:text-gold"
                  >
                    {r.nombre}
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="col-span-2 sm:col-span-1 lg:col-span-1"
          >
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-paper-dim">Contacto</p>

            <ul className="flex flex-col gap-3">
              {pie.contactos.map((c) => (
                <li key={c.nombre}>
                  <p className="text-sm text-paper/80">{c.nombre}</p>
                  {c.correo && (
                    <a href={`mailto:${c.correo}`} className="block text-xs text-paper-dim transition-colors hover:text-gold">
                      {c.correo}
                    </a>
                  )}
                </li>
              ))}
            </ul>
            {sitio.secciones.some((x) => x.id === "contacto" && x.visible) && (
              <a href="#contacto" data-cursor-hover className="mt-4 inline-block text-xs uppercase tracking-[0.15em] text-gold hover:underline">
                Ver equipo de contacto →
              </a>
            )}

            {pie.horario && <p className="mt-5 text-xs uppercase tracking-[0.15em] text-paper-dim">{pie.horario}</p>}

            {pie.direccion && <p className="mt-2 text-sm text-paper-dim">{pie.direccion}</p>}
          </motion.div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-paper/10 pt-8 text-xs text-paper-dim sm:flex-row">
          <span>
            © {new Date().getFullYear()} {pie.copyright}
          </span>
          <div className="flex items-center gap-4">
            <span>Alumni USB Cali · Red de Graduados</span>
            <a
              href="#/admin"
              data-cursor-hover
              className="rounded-full border border-paper/15 px-3 py-1 uppercase tracking-[0.15em] text-paper-dim transition-colors hover:border-gold/40 hover:text-gold"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
