import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { egresados } from "../data/egresados";
import { enfoques } from "../data/derived";
import { fotos } from "../data/fotos";
import { logos } from "../data/logos";
import { hueSeed } from "../lib/color";
import content from "../data/content.json";

const { eyebrow, titulo: SECTION_TITLE } = content.secciones.buscador;

const PAGE_SIZE = 24;

export default function SearchSection() {
  const [query, setQuery] = useState("");
  const [enfoqueFiltro, setEnfoqueFiltro] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return egresados.filter((e) => {
      if (enfoqueFiltro && e.enfoque !== enfoqueFiltro) return false;
      if (!q) return true;
      return `${e.nombre} ${e.nombreEmprendimiento} ${e.programa ?? ""} ${e.enfoque ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, enfoqueFiltro]);

  const visibles = filtrados.slice(0, visible);

  function updateQuery(v: string) {
    setQuery(v);
    setVisible(PAGE_SIZE);
  }

  function updateFiltro(v: string | null) {
    setEnfoqueFiltro((prev) => (prev === v ? null : v));
    setVisible(PAGE_SIZE);
  }

  return (
    <section id="buscador" className="relative bg-ink px-4 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
          <h2 className="font-display text-balance text-4xl font-light text-paper sm:text-5xl lg:text-6xl">
            {SECTION_TITLE}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-paper-dim">
            Explora los {egresados.length} egresados emprendedores registrados, por nombre, emprendimiento, programa
            o enfoque.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Busca por nombre, emprendimiento o programa…"
            className="w-full rounded-full border border-paper/15 bg-ink-2/60 px-6 py-4 text-center text-paper placeholder:text-paper-dim focus:border-gold/60 focus:outline-none"
          />
        </motion.div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => updateFiltro(null)}
            data-cursor-hover
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors ${
              enfoqueFiltro === null
                ? "border-gold bg-gold text-ink"
                : "border-paper/15 text-paper-dim hover:border-gold/50 hover:text-paper"
            }`}
          >
            Todos ({egresados.length})
          </button>
          {enfoques.map((f) => (
            <button
              key={f.nombre}
              onClick={() => updateFiltro(f.nombre)}
              data-cursor-hover
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors ${
                enfoqueFiltro === f.nombre
                  ? "border-gold bg-gold text-ink"
                  : "border-paper/15 text-paper-dim hover:border-gold/50 hover:text-paper"
              }`}
            >
              {f.nombre} ({f.count})
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs uppercase tracking-[0.2em] text-paper-dim">
          {filtrados.length} {filtrados.length === 1 ? "resultado" : "resultados"}
        </p>

        {visibles.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((e, i) => {
              const hue = hueSeed(e.id);
              const base = 18 + (((hue % 34) + 34) % 34);
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: (i % PAGE_SIZE) * 0.02 }}
                >
                  <Link
                    to={`/egresado/${e.slug}`}
                    data-cursor-hover
                    className="group flex items-center gap-4 rounded-2xl border border-paper/10 bg-ink-2/40 p-4 transition-colors hover:border-gold/40"
                  >
                    {logos[e.slug] ? (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-paper p-2">
                        <img
                          src={logos[e.slug]}
                          alt={`Logo de ${e.nombreEmprendimiento}`}
                          className="h-full w-full object-contain"
                        />
                      </span>
                    ) : (
                      <span
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-medium text-paper"
                        style={{ backgroundColor: `hsl(${base}, 55%, 22%)` }}
                      >
                        {e.nombreEmprendimiento.charAt(0)}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-paper transition-colors group-hover:text-gold">
                        {e.nombreEmprendimiento}
                      </span>
                      {e.telefonoNegocio ? (
                        <span className="block truncate text-xs text-paper-dim">{e.telefonoNegocio}</span>
                      ) : e.correo ? (
                        <span className="block truncate text-xs text-paper-dim">{e.correo}</span>
                      ) : null}
                      <span className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-[11px] text-paper-dim/70">
                        {fotos[e.slug] && (
                          <img
                            src={fotos[e.slug]}
                            alt=""
                            className="h-4 w-4 shrink-0 rounded-full object-cover object-top"
                          />
                        )}
                        <span className="truncate">
                          {e.nombre}
                          {e.programa ? ` · ${e.programa}` : ""}
                        </span>
                      </span>
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="mt-12 text-center text-sm text-paper-dim">No encontramos coincidencias con esa búsqueda.</p>
        )}

        {visible < filtrados.length && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              data-cursor-hover
              className="rounded-full border border-gold/50 px-6 py-2.5 text-sm text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              Cargar más ({filtrados.length - visible} restantes)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
