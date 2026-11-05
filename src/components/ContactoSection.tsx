import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { rutaPublica, sitio } from "../data/sitio";

/**
 * Sección "Contacto": el equipo de Alumni USB Cali (Karol, Juan Pablo, Juan
 * Carlos…) con fotos grandes, como una sección más de la página. Las personas,
 * sus fotos y el encabezado se editan desde el panel (/admin → Menú, pie y
 * redes → Personas de contacto).
 */
/**
 * Foto grande del contacto con el logo de su oficina en la esquina, como una
 * estampa. Interactiva: la foto se inclina en 3D siguiendo el mouse (o el dedo),
 * el logo flota, se despega más que la foto (paralaje), le pasa un brillo al
 * pasar por encima y al tocarlo se voltea y muestra el nombre de la oficina.
 */
function FotoContacto({
  nombre,
  cargo,
  foto,
  encuadre,
  logo,
  logoTexto,
  indice,
}: {
  nombre: string;
  cargo: string;
  foto: string | null;
  encuadre?: string | null;
  logo: string | null;
  logoTexto?: string | null;
  indice: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [volteado, setVolteado] = useState(false);

  const mover = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ct-rx", `${(-y * 10).toFixed(2)}deg`);
    el.style.setProperty("--ct-ry", `${(x * 12).toFixed(2)}deg`);
    el.style.setProperty("--ct-px", `${(x * 18).toFixed(1)}px`);
    el.style.setProperty("--ct-py", `${(y * 18).toFixed(1)}px`);
    el.style.setProperty("--ct-lx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--ct-ly", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const salir = () => {
    const el = ref.current;
    if (!el) return;
    ["--ct-rx", "--ct-ry", "--ct-px", "--ct-py", "--ct-lx", "--ct-ly"].forEach((v) => el.style.removeProperty(v));
  };

  return (
    <div className="ct-escena">
      <div
        ref={ref}
        className="ct-foto relative aspect-[4/5] overflow-hidden bg-ink-3"
        onPointerMove={mover}
        onPointerLeave={salir}
      >
        {foto && (
          <img
            src={foto}
            alt={nombre}
            loading="lazy"
            className="ct-img h-full w-full object-cover"
            style={{ objectPosition: encuadre || "50% 25%" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
        {/* luz que sigue al cursor */}
        <div className="ct-luz pointer-events-none absolute inset-0" aria-hidden />

        {logo && (
          <button
            type="button"
            data-cursor-hover
            onClick={() => setVolteado((v) => !v)}
            aria-pressed={volteado}
            aria-label={`${logoTexto ?? "Logo"}${volteado ? "" : " — toca para ver la oficina"}`}
            className="ct-sello absolute right-4 top-4 z-10 aspect-square w-[27%] min-w-[4.75rem]"
            style={{ ["--ct-delay" as string]: `${indice * -1.3}s` }}
          >
            <span className={`ct-sello-giro${volteado ? " is-volteado" : ""}`}>
              <span className="ct-cara overflow-hidden bg-white">
                <img src={logo} alt="" loading="lazy" className="h-full w-full object-cover" />
                <span className="ct-brillo" aria-hidden />
              </span>
              <span className="ct-cara ct-dorso flex flex-col items-center justify-center p-2 text-center">
                <span className="text-[9px] uppercase tracking-[0.18em] text-white/80">Oficina</span>
                <span className="font-display mt-1 text-[13px] font-semibold leading-tight text-white sm:text-sm">
                  {logoTexto ?? "USB Cali"}
                </span>
              </span>
            </span>
          </button>
        )}

        <div className="ct-texto absolute inset-x-0 bottom-0 p-6">
          <h3 className="font-display text-2xl leading-tight text-paper">{nombre}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold">{cargo}</p>
        </div>
      </div>
    </div>
  );
}

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
                <FotoContacto
                  nombre={c.nombre}
                  cargo={c.cargo}
                  foto={foto}
                  encuadre={c.encuadre}
                  logo={logo}
                  logoTexto={c.logoTexto}
                  indice={i}
                />

                <div className="flex flex-1 flex-col gap-2 p-6 text-sm">
                  {c.correo && (
                    <a href={`mailto:${c.correo}`} className="break-all text-paper/85 transition-colors hover:text-gold" data-cursor-hover>
                      ✉ {c.correo}
                    </a>
                  )}
                  {c.telefono && <span className="text-paper-dim">☎ {c.telefono}</span>}
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
