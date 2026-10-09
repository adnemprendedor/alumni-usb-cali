import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { egresados } from "../data/egresados";
import { enfoques, sectores, sectorPorSlug } from "../data/derived";
import { fotos } from "../data/fotos";
import { logos } from "../data/logos";
import { hueSeed } from "../lib/color";
import { whatsappLink } from "../lib/whatsapp";
import content from "../data/content.json";

const { eyebrow, titulo: SECTION_TITLE, subtitulo, queEs, descripcion, tagline } = content.secciones.buscador;

const PAGE_SIZE = 24;

export default function SearchSection() {
  const [query, setQuery] = useState("");
  const [sectorFiltro, setSectorFiltro] = useState<string | null>(null);
  const [enfoqueFiltro, setEnfoqueFiltro] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Si se llegó aquí desde una tarjeta de categoría (CategoriesSection), toma
  // ese filtro una sola vez al montar.
  useEffect(() => {
    try {
      const guardado = sessionStorage.getItem("categoriaFiltro");
      if (guardado) {
        setSectorFiltro(guardado);
        sessionStorage.removeItem("categoriaFiltro");
      }
    } catch {
      // almacenamiento no disponible: simplemente no se preselecciona nada
    }
  }, []);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    const resultado = egresados.filter((e) => {
      if (sectorFiltro && sectorPorSlug[e.slug] !== sectorFiltro) return false;
      if (enfoqueFiltro && e.enfoque !== enfoqueFiltro) return false;
      if (!q) return true;
      return `${e.nombre} ${e.nombreEmprendimiento} ${e.programa ?? ""} ${e.enfoque ?? ""}`
        .toLowerCase()
        .includes(q);
    });
    // Los egresados con logo/foto verificados se muestran primero (orden estable entre sí).
    return resultado
      .map((e, index) => ({ e, index }))
      .sort((a, b) => {
        const aTieneImagen = Boolean(logos[a.e.slug] || fotos[a.e.slug]);
        const bTieneImagen = Boolean(logos[b.e.slug] || fotos[b.e.slug]);
        if (aTieneImagen === bTieneImagen) return a.index - b.index;
        return aTieneImagen ? -1 : 1;
      })
      .map(({ e }) => e);
  }, [query, sectorFiltro, enfoqueFiltro]);

  const visibles = filtrados.slice(0, visible);

  function updateQuery(v: string) {
    setQuery(v);
    setVisible(PAGE_SIZE);
  }

  function updateSector(v: string | null) {
    setSectorFiltro((prev) => (prev === v ? null : v));
    setVisible(PAGE_SIZE);
  }

  function updateEnfoque(v: string | null) {
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
          <p className="mx-auto mt-4 max-w-xl text-balance text-base text-paper-dim">
            {subtitulo ? (
              subtitulo.replace("{total}", String(egresados.length))
            ) : (
              <>
                Explora los {egresados.length} egresados emprendedores registrados, por nombre, emprendimiento,
                programa, categoría o enfoque.
              </>
            )}
          </p>

          {(queEs || descripcion || tagline) && (
            <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-gold/20 bg-ink-2/60 p-7 text-left sm:p-9">
              {queEs && (
                <h3 className="font-display mb-3 text-xl font-light text-paper sm:text-2xl">{queEs}</h3>
              )}
              {descripcion && (
                <p className="text-sm leading-relaxed text-paper-dim">
                  <strong className="font-medium text-paper">ADN Emprendedor</strong>
                  {descripcion.replace(/^ADN Emprendedor/, "")}
                </p>
              )}
              {tagline && <p className="mt-4 text-sm font-medium text-gold">{tagline}</p>}
            </div>
          )}
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

        {/* filtro por categoría / sector */}
        <div className="mt-8">
          <p className="mb-2 text-center text-[11px] uppercase tracking-[0.2em] text-paper-dim/70">Categoría</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => updateSector(null)}
              data-cursor-hover
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors ${
                sectorFiltro === null
                  ? "border-gold bg-gold text-ink"
                  : "border-paper/15 text-paper-dim hover:border-gold/50 hover:text-paper"
              }`}
            >
              Todas
            </button>
            {sectores.map((s) => (
              <button
                key={s.nombre}
                onClick={() => updateSector(s.nombre)}
                data-cursor-hover
                className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors ${
                  sectorFiltro === s.nombre
                    ? "border-gold bg-gold text-ink"
                    : "border-paper/15 text-paper-dim hover:border-gold/50 hover:text-paper"
                }`}
              >
                {s.nombre} ({s.count})
              </button>
            ))}
          </div>
        </div>

        {/* filtro secundario por enfoque */}
        <div className="mt-5">
          <p className="mb-2 text-center text-[11px] uppercase tracking-[0.2em] text-paper-dim/70">Enfoque</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => updateEnfoque(null)}
              data-cursor-hover
              className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                enfoqueFiltro === null
                  ? "border-gold/70 text-gold"
                  : "border-paper/10 text-paper-dim/70 hover:border-gold/40 hover:text-paper-dim"
              }`}
            >
              Todos
            </button>
            {enfoques.map((f) => (
              <button
                key={f.nombre}
                onClick={() => updateEnfoque(f.nombre)}
                data-cursor-hover
                className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                  enfoqueFiltro === f.nombre
                    ? "border-gold/70 text-gold"
                    : "border-paper/10 text-paper-dim/70 hover:border-gold/40 hover:text-paper-dim"
                }`}
              >
                {f.nombre} ({f.count})
              </button>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs uppercase tracking-[0.2em] text-paper-dim">
          {filtrados.length} {filtrados.length === 1 ? "resultado" : "resultados"}
        </p>

        {visibles.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((e, i) => {
              const hue = hueSeed(e.id);
              const base = 18 + (((hue % 34) + 34) % 34);
              const sector = sectorPorSlug[e.slug];
              const wa = whatsappLink(e.telefonoNegocio);
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
                    className="group relative flex items-center gap-4 rounded-2xl border border-paper/10 bg-ink-2/40 p-4 transition-colors hover:border-gold/40"
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
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="block truncate text-sm font-medium text-paper transition-colors group-hover:text-gold">
                          {e.nombreEmprendimiento}
                        </span>
                        {wa && (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noreferrer"
                            data-cursor-hover
                            onClick={(ev) => ev.stopPropagation()}
                            aria-label="Escribir por WhatsApp"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-paper/15 text-xs text-paper-dim transition-colors hover:border-gold/60 hover:text-gold"
                          >
                            ✆
                          </a>
                        )}
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
                      {sector && (
                        <span className="mt-2 inline-flex items-center rounded-full border border-paper/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-paper-dim/70">
                          {sector}
                        </span>
                      )}
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
