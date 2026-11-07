import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PAISES, VIEWBOX, proyectar } from "../data/mundo";
import { exterior, ISO_PAIS, paisesExterior, puntosExterior, type PuntoMapa } from "../data/exterior";
import { rutaPublica } from "../data/sitio";
import { usePrefersReducedMotion } from "../hooks/useReducedMotion";

/**
 * Mapamundi de egresados en el exterior (se abre desde la portada).
 * - Arcos animados desde Cali hasta cada ciudad.
 * - Pines que laten; al pasar el mouse muestran el lugar y al hacer clic el
 *   mapa hace zoom y aparece la ficha de cada egresado de ese lugar.
 * - Chips de países para saltar a cada uno; Esc o la X cierran.
 */

const VB_TOTAL = VIEWBOX.split(" ").map(Number) as [number, number, number, number];
const ORIGEN = proyectar(exterior.origen.lat, exterior.origen.lng);
const PAISES_CON_EGRESADOS = new Set(paisesExterior.map((p) => ISO_PAIS[p.pais]).filter(Boolean));

const iniciales = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

/** Curva de Cali al destino, abombada hacia arriba. */
function arco([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  return `M${x1},${y1} Q${mx},${my - dist * 0.35} ${x2},${y2}`;
}

/** Encuadre (viewBox) para hacer zoom sobre un punto o un grupo de puntos. */
function encuadre(puntos: PuntoMapa[]): string {
  const xy = puntos.map((p) => proyectar(p.lat, p.lng));
  const xs = xy.map((p) => p[0]);
  const ys = xy.map((p) => p[1]);
  const pad = 70;
  let x0 = Math.min(...xs) - pad;
  let x1 = Math.max(...xs) + pad;
  let y0 = Math.min(...ys) - pad;
  let y1 = Math.max(...ys) + pad;
  // mantener la proporción del mapa
  const ratio = VB_TOTAL[2] / VB_TOTAL[3];
  let w = x1 - x0;
  let h = y1 - y0;
  if (w / h > ratio) {
    const nh = w / ratio;
    y0 -= (nh - h) / 2;
    h = nh;
  } else {
    const nw = h * ratio;
    x0 -= (nw - w) / 2;
    w = nw;
  }
  w = Math.max(w, 260);
  h = w / ratio;
  x1 = x0 + w;
  y1 = y0 + h;
  return `${x0.toFixed(1)} ${y0.toFixed(1)} ${(x1 - x0).toFixed(1)} ${(y1 - y0).toFixed(1)}`;
}

function Ficha({ e, i }: { e: PuntoMapa["personas"][number]; i: number }) {
  const foto = rutaPublica(e.foto);
  const logo = rutaPublica(e.logo);
  const contenido = (
    <>
      <div className="relative h-14 w-14 flex-shrink-0">
        {foto ? (
          <img src={foto} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-alumni/70" />
        ) : (
          <span className="font-display flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy to-pink text-lg font-semibold text-white ring-2 ring-alumni/50">
            {iniciales(e.nombre)}
          </span>
        )}
        {logo && (
          <img
            src={logo}
            alt=""
            className="absolute -bottom-1 -right-2 h-7 w-7 rotate-6 rounded-lg bg-white object-contain p-0.5 shadow-lg"
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="font-display text-base leading-tight text-paper">{e.nombre}</p>
        {e.ocupacion && <p className="mt-0.5 text-[13px] leading-snug text-paper/80">{e.ocupacion}</p>}
        <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-gold-soft">
          {[e.empresa, e.programa].filter(Boolean).join(" · ")}
        </p>
      </div>
    </>
  );
  return (
    <motion.li
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 * i, duration: 0.4 }}
    >
      {e.perfil ? (
        <a
          href={`#/egresado/${e.perfil}`}
          className="flex items-start gap-4 rounded-2xl border border-paper/10 bg-paper/[0.04] p-3 transition-colors hover:border-alumni/50"
        >
          {contenido}
        </a>
      ) : (
        <div className="flex items-start gap-4 rounded-2xl border border-paper/10 bg-paper/[0.04] p-3">{contenido}</div>
      )}
    </motion.li>
  );
}

export default function MapaMundi({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const reduce = usePrefersReducedMotion();
  const [sel, setSel] = useState<PuntoMapa | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  const viewBox = useMemo(() => {
    if (!sel) return VIEWBOX;
    const mismoPais = puntosExterior.filter((p) => p.pais === sel.pais);
    return encuadre(mismoPais);
  }, [sel]);

  // Esc para cerrar, bloquear el scroll de fondo y enfocar el botón de cerrar
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (sel) setSel(null);
        else onCerrar();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => cerrarRef.current?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [abierto, sel, onCerrar]);

  useEffect(() => {
    if (!abierto) setSel(null);
  }, [abierto]);

  const total = exterior.egresados.length;
  const escala = sel ? Number(viewBox.split(" ")[2]) / VB_TOTAL[2] : 1; // pines más pequeños al hacer zoom

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-stretch justify-center bg-[#0d0d14]/85 p-0 backdrop-blur-md sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCerrar}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mapa-titulo"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-full w-full max-w-7xl flex-col overflow-y-auto border-paper/10 bg-gradient-to-b from-[#17172a] to-ink sm:rounded-3xl sm:border lg:overflow-hidden"
          >
            {/* encabezado */}
            <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5 sm:px-8 sm:pt-7">
              <div>
                <p className="eyebrow mb-2 text-[11px] uppercase tracking-[0.3em] text-gold">Alumni USB Cali en el mundo</p>
                <h2 id="mapa-titulo" className="font-display text-2xl font-light text-paper sm:text-4xl">
                  {exterior.titulo}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-paper-dim">
                  {exterior.texto} Toca un punto del mapa para conocerlos.
                </p>
              </div>
              <button
                ref={cerrarRef}
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar mapa"
                data-cursor-hover
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-paper/20 text-xl text-paper transition-colors hover:border-alumni hover:text-alumni"
              >
                ×
              </button>
            </div>

            {/* chips de países */}
            <div className="flex flex-wrap gap-2 px-5 pb-4 sm:px-8">
              <button
                type="button"
                onClick={() => setSel(null)}
                className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                  !sel ? "border-alumni bg-alumni text-white" : "border-paper/20 text-paper/80 hover:border-alumni/60"
                }`}
              >
                🌎 Todo el mundo · {total}
              </button>
              {paisesExterior.map((p) => {
                const activo = sel?.pais === p.pais;
                return (
                  <button
                    key={p.pais}
                    type="button"
                    onClick={() => setSel(puntosExterior.find((x) => x.pais === p.pais) ?? null)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                      activo ? "border-alumni bg-alumni text-white" : "border-paper/20 text-paper/80 hover:border-alumni/60"
                    }`}
                  >
                    {p.pais} · {p.total}
                  </button>
                );
              })}
            </div>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_22rem]">
              {/* mapa */}
              <div className="relative px-2 pb-4 sm:px-6">
                <motion.svg
                  viewBox={VIEWBOX}
                  animate={{ viewBox }}
                  transition={{ duration: reduce ? 0 : 0.9, ease: [0.65, 0, 0.35, 1] }}
                  className="h-auto w-full select-none"
                  role="img"
                  aria-label={`Mapa con ${total} egresados en ${paisesExterior.length} países`}
                >
                  <defs>
                    <linearGradient id="mm-arco" x1="0" x2="1">
                      <stop offset="0" stopColor="#f57206" />
                      <stop offset="1" stopColor="#ec455f" />
                    </linearGradient>
                    <radialGradient id="mm-pin">
                      <stop offset="0" stopColor="#ffb066" />
                      <stop offset="1" stopColor="#f57206" />
                    </radialGradient>
                    <pattern id="mm-puntos" width="6" height="6" patternUnits="userSpaceOnUse">
                      <circle cx="3" cy="3" r="0.9" fill="rgba(255,255,255,0.10)" />
                    </pattern>
                  </defs>

                  {/* países */}
                  <g strokeLinejoin="round">
                    {PAISES.map((p) => {
                      const destino = PAISES_CON_EGRESADOS.has(p.id);
                      const casa = p.id === ISO_PAIS.Colombia;
                      return (
                        <path
                          key={p.id + p.d.length}
                          d={p.d}
                          fill={casa ? "rgba(245,114,6,0.55)" : destino ? "rgba(107,58,114,0.75)" : "#262635"}
                          stroke={destino || casa ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)"}
                          strokeWidth={0.5 * escala}
                        />
                      );
                    })}
                  </g>
                  <rect x="0" y="0" width="1000" height="500" fill="url(#mm-puntos)" pointerEvents="none" />

                  {/* arcos desde Cali */}
                  <g fill="none" stroke="url(#mm-arco)" strokeLinecap="round">
                    {puntosExterior.map((p, i) => (
                      <motion.path
                        key={p.clave}
                        d={arco(ORIGEN, proyectar(p.lat, p.lng))}
                        strokeWidth={(sel?.clave === p.clave ? 2.2 : 1.2) * escala}
                        strokeOpacity={sel && sel.pais !== p.pais ? 0.2 : 0.85}
                        initial={{ pathLength: reduce ? 1 : 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: reduce ? 0 : 0.35 + i * 0.12, duration: 1.1, ease: "easeInOut" }}
                      />
                    ))}
                  </g>

                  {/* Cali */}
                  <g transform={`translate(${ORIGEN[0]} ${ORIGEN[1]})`}>
                    <circle r={5 * escala} fill="#f57206" stroke="#fff" strokeWidth={1.5 * escala} />
                    <text
                      y={-9 * escala}
                      textAnchor="middle"
                      fontSize={11 * escala}
                      fill="#fff"
                      fontWeight={600}
                      style={{ paintOrder: "stroke" }}
                      stroke="#0d0d14"
                      strokeWidth={3 * escala}
                    >
                      Cali
                    </text>
                  </g>

                  {/* pines */}
                  {puntosExterior.map((p, i) => {
                    const [x, y] = proyectar(p.lat, p.lng);
                    const n = p.personas.length;
                    const r = (5 + n * 1.6) * escala;
                    const activo = sel?.clave === p.clave || hover === p.clave;
                    return (
                      <motion.g
                        key={p.clave}
                        initial={{ opacity: 0, scale: reduce ? 1 : 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: reduce ? 0 : 1.2 + i * 0.12, type: "spring", stiffness: 260, damping: 14 }}
                        style={{ transformOrigin: `${x}px ${y}px`, cursor: "pointer" }}
                        onClick={() => setSel(p)}
                        onMouseEnter={() => setHover(p.clave)}
                        onMouseLeave={() => setHover(null)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${p.lugar}: ${n} ${n === 1 ? "egresado" : "egresados"}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSel(p);
                          }
                        }}
                      >
                        {!reduce && (
                          <circle cx={x} cy={y} r={r} fill="#f57206" className="mm-pulso" style={{ transformOrigin: `${x}px ${y}px` }} />
                        )}
                        <circle cx={x} cy={y} r={r * 2.2} fill="transparent" />
                        <circle
                          cx={x}
                          cy={y}
                          r={activo ? r * 1.25 : r}
                          fill="url(#mm-pin)"
                          stroke="#fff"
                          strokeWidth={1.5 * escala}
                          style={{ transition: "r 0.25s" }}
                        />
                        {n > 1 && (
                          <text x={x} y={y + 3.6 * escala} textAnchor="middle" fontSize={10 * escala} fontWeight={700} fill="#fff" pointerEvents="none">
                            {n}
                          </text>
                        )}
                        {activo && (
                          <text
                            x={x}
                            y={y - r - 6 * escala}
                            textAnchor="middle"
                            fontSize={12 * escala}
                            fontWeight={600}
                            fill="#fff"
                            stroke="#0d0d14"
                            strokeWidth={3 * escala}
                            style={{ paintOrder: "stroke" }}
                            pointerEvents="none"
                          >
                            {p.lugar}
                          </text>
                        )}
                      </motion.g>
                    );
                  })}
                </motion.svg>
              </div>

              {/* panel de egresados */}
              <aside className="border-t border-paper/10 px-5 pb-6 pt-5 sm:px-8 lg:max-h-[60vh] lg:overflow-y-auto lg:border-l lg:border-t-0 lg:px-5">
                <AnimatePresence mode="wait">
                  {sel ? (
                    <motion.div key={sel.pais} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="font-display text-xl text-paper">{sel.pais}</p>
                        <button
                          type="button"
                          onClick={() => setSel(null)}
                          className="text-xs uppercase tracking-[0.15em] text-paper-dim hover:text-alumni"
                        >
                          ← Ver todo
                        </button>
                      </div>
                      {puntosExterior
                        .filter((p) => p.pais === sel.pais)
                        .map((p) => (
                          <div key={p.clave} className="mb-5">
                            <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-gold">📍 {p.lugar}</p>
                            <ul className="space-y-2.5">
                              {p.personas.map((e, i) => (
                                <Ficha key={e.id} e={e} i={i} />
                              ))}
                            </ul>
                          </div>
                        ))}
                    </motion.div>
                  ) : (
                    <motion.div key="todo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="font-display alumni-text text-6xl font-semibold">{total}</p>
                      <p className="mt-1 text-sm text-paper-dim">
                        egresados en {paisesExterior.length} países, conectados con la red Alumni desde Cali.
                      </p>
                      <ul className="mt-6 space-y-2">
                        {paisesExterior.map((p) => (
                          <li key={p.pais}>
                            <button
                              type="button"
                              onClick={() => setSel(puntosExterior.find((x) => x.pais === p.pais) ?? null)}
                              className="group flex w-full items-center justify-between rounded-xl border border-paper/10 px-4 py-3 text-left transition-colors hover:border-alumni/60 hover:bg-paper/[0.04]"
                            >
                              <span className="text-paper">{p.pais}</span>
                              <span className="flex items-center gap-3 text-sm text-paper-dim">
                                {p.total} {p.total === 1 ? "egresado" : "egresados"}
                                <span className="text-alumni transition-transform group-hover:translate-x-1">→</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </aside>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
