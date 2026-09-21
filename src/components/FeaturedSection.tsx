import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { destacados } from "../data/derived";
import { fotos } from "../data/fotos";
import { logos } from "../data/logos";
import { hueSeed } from "../lib/color";
import Portrait from "./Portrait";
import content from "../data/content.json";

const { eyebrow, titulo: SECTION_TITLE } = content.secciones.destacados;

export default function FeaturedSection() {
  const [active, setActive] = useState(destacados[0]?.id);
  const activeItem = destacados.find((e) => e.id === active) ?? destacados[0];

  if (!activeItem) return null;

  return (
    <section id="destacados" className="relative bg-ink px-4 py-28 sm:px-8 lg:py-40">
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
            {SECTION_TITLE}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* sticky portrait */}
          <div className="lg:col-span-6 lg:order-1">
            <div className="lg:sticky lg:top-28">
              <div className="relative h-[70vh] max-h-[640px] overflow-hidden rounded-3xl border border-paper/10">
                <AnimatePresence mode="sync">
                  <motion.div
                    key={activeItem.id}
                    initial={{ opacity: 0, scale: 1.06, clipPath: "inset(8% 8% 8% 8% round 24px)" }}
                    animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 24px)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    {fotos[activeItem.slug] ? (
                      <div className="relative h-full w-full">
                        <img
                          src={fotos[activeItem.slug]}
                          alt={activeItem.nombre}
                          className="h-full w-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          {logos[activeItem.slug] && (
                            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-paper p-2.5">
                              <img
                                src={logos[activeItem.slug]}
                                alt={`Logo de ${activeItem.nombreEmprendimiento}`}
                                className="h-full w-full object-contain"
                              />
                            </span>
                          )}
                          <p className="text-xs uppercase tracking-[0.25em] text-gold">{activeItem.enfoque}</p>
                          <h3 className="font-display mt-2 text-3xl text-paper">{activeItem.nombreEmprendimiento}</h3>
                          {activeItem.telefonoNegocio && (
                            <p className="mt-2 text-sm text-paper-dim">{activeItem.telefonoNegocio}</p>
                          )}
                          <p className="mt-3 text-sm text-paper-dim/80">{activeItem.nombre}</p>
                        </div>
                      </div>
                    ) : (
                      <Portrait hue={hueSeed(activeItem.id)} className="h-full w-full">
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <p className="text-xs uppercase tracking-[0.25em] text-gold">{activeItem.enfoque}</p>
                          <h3 className="font-display mt-2 text-3xl text-paper">{activeItem.nombreEmprendimiento}</h3>
                          {activeItem.telefonoNegocio && (
                            <p className="mt-2 text-sm text-paper-dim">{activeItem.telefonoNegocio}</p>
                          )}
                          <p className="mt-3 text-sm text-paper-dim/80">{activeItem.nombre}</p>
                        </div>
                      </Portrait>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* scroll-linked list */}
          <div className="flex flex-col gap-2 lg:col-span-6 lg:order-2">
            {destacados.map((person, i) => (
              <motion.div
                key={person.id}
                onViewportEnter={() => setActive(person.id)}
                viewport={{ margin: "-40% 0px -40% 0px" }}
                className="group border-b border-paper/10 py-8 first:pt-0"
              >
                <Link to={`/egresado/${person.slug}`} data-cursor-hover className="block">
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-paper-dim transition-colors group-hover:text-gold">
                    {String(i + 1).padStart(2, "0")} · {person.enfoque}
                  </p>
                  <div className="flex items-center gap-3">
                    {logos[person.slug] && (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper p-1.5">
                        <img
                          src={logos[person.slug]}
                          alt={`Logo de ${person.nombreEmprendimiento}`}
                          className="h-full w-full object-contain"
                        />
                      </span>
                    )}
                    <h3 className="font-display text-2xl text-paper transition-transform duration-500 group-hover:translate-x-2 sm:text-3xl">
                      {person.nombreEmprendimiento}
                    </h3>
                  </div>
                  {person.telefonoNegocio && <p className="mt-2 text-sm text-paper-dim">{person.telefonoNegocio}</p>}
                  <p className="mt-2 text-sm text-paper-dim">
                    {person.nombre}
                    {person.programa ? ` — ${person.programa}` : ""}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.15em] text-paper-dim/70">
                    {person.tipo}
                    {person.anioEgreso ? ` · Egresado ${person.anioEgreso}` : ""}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
