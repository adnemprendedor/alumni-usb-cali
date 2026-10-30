import { motion } from "framer-motion";
import { rutaPublica, sitio } from "../data/sitio";

/**
 * Sección "Contacto": el equipo de Alumni USB Cali (Karol, Juan Pablo, Juan
 * Carlos…) con fotos grandes, como una sección más de la página. Las personas,
 * sus fotos y el encabezado se editan desde el panel (/admin → Menú, pie y
 * redes → Personas de contacto).
 */
export default function ContactoSection() {
  const { contactos, horario, direccion } = sitio.pie;
  const enc = sitio.contacto ?? { eyebrow: "Contacto", titulo: "Habla con nuestro equipo", subtitulo: "" };
  if (!contactos.length) return null;

  return (
    <section id="contacto" className="relative border-t border-paper/10 bg-ink px-4 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
          className="mb-14"
        >
          <p className="eyebrow mb-3 text-xs uppercase tracking-[0.3em] text-gold">{enc.eyebrow}</p>
          <h2 className="font-display text-balance text-4xl font-light text-paper sm:text-5xl lg:text-6xl">{enc.titulo}</h2>
          {enc.subtitulo && <p className="mt-4 max-w-xl text-sm text-paper-dim">{enc.subtitulo}</p>}
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contactos.map((c, i) => {
            const foto = rutaPublica(c.foto);
            const logo = rutaPublica(c.logo);
            const wa = c.whatsapp?.replace(/\D/g, "");
            return (
              <motion.article
                key={`${c.nombre}-${i}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-paper/10 bg-ink-2/50 transition-colors hover:border-gold/40"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-ink-3">
                  {foto && (
                    <img
                      src={foto}
                      alt={c.nombre}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ objectPosition: c.encuadre || "50% 25%" }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-2xl leading-tight text-paper">{c.nombre}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold">{c.cargo}</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-6 text-sm">
                  {c.correo && (
                    <a href={`mailto:${c.correo}`} className="break-all text-paper/85 transition-colors hover:text-gold" data-cursor-hover>
                      ✉ {c.correo}
                    </a>
                  )}
                  {c.telefono && <span className="text-paper-dim">☎ {c.telefono}</span>}
                  {logo && (
                    <span className="mt-1 inline-flex items-center gap-2">
                      <img src={logo} alt={c.logoTexto ?? ""} className="h-6 w-auto rounded bg-paper p-0.5" />
                      {c.logoTexto && <span className="text-[11px] uppercase tracking-[0.12em] text-paper-dim">{c.logoTexto}</span>}
                    </span>
                  )}
                  {wa && (
                    <a
                      href={`https://wa.me/${wa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor-hover
                      className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-ink transition-opacity hover:opacity-90"
                    >
                      Escribir por WhatsApp
                    </a>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>

        {(horario || direccion) && (
          <p className="mt-10 text-center text-xs uppercase tracking-[0.18em] text-paper-dim">
            {horario}
            {horario && direccion ? " · " : ""}
            {direccion}
          </p>
        )}
      </div>
    </section>
  );
}
