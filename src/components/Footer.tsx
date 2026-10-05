import { motion } from "framer-motion";
import alumniLogo from "../assets/brand/alumni-logo.png";

const COLUMNS = [
  {
    title: "ADN Emprendedor",
    links: [
      { label: "Directorio", href: "#buscador" },
      { label: "Categorías", href: "#categorias" },
      { label: "Emprendimientos", href: "#emprendimientos" },
      { label: "Destacado de la semana", href: "#destacado-semana" },
    ],
  },
  {
    title: "Descubrir",
    links: [
      { label: "Egresados que Inspiran", href: "#destacados" },
      { label: "Programas", href: "#carreras" },
      { label: "Participa", href: "#conecta" },
      { label: "Juego de egresados", href: "#/juego" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-paper/10 bg-ink px-4 pb-10 pt-24 sm:px-8 lg:pt-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundImage: "linear-gradient(90deg, transparent, rgba(239,125,0,0.5), transparent)" }}
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-center gap-4">
          <span className="flex h-12 items-center rounded-lg bg-paper px-3 py-2">
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
          USB Conecta
          <br />y emprende.
        </motion.h2>

        <motion.a
          href="#explora"
          data-cursor-hover
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="group mt-10 inline-flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-gold"
        >
          Explorar directorio
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
                  <li key={l.label}>
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
            className="col-span-2 sm:col-span-1 lg:col-span-2"
          >
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-paper-dim">Alumni USB Cali</p>
            <p className="max-w-xs text-sm text-paper/80">
              Red de Graduados de la Universidad de San Buenaventura Cali — un espacio para descubrir y conectar con
              los emprendimientos de nuestros egresados.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-paper/10 pt-8 text-xs text-paper-dim sm:flex-row">
          <span>
            © {new Date().getFullYear()} Universidad de San Buenaventura Cali. Todos los derechos reservados. ·
            Vigilada Mineducación
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
