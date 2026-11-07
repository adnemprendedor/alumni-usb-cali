import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { juego, type JuegoEgresado } from "../data/juego";
import Portrait from "./Portrait";
import { hueSeed } from "../lib/color";
import { usePrefersReducedMotion } from "../hooks/useReducedMotion";

/**
 * Juego "¿Cómo estás de percepción?": intro en slides y luego rondas donde se
 * ve la foto de un egresado (borrosa al principio, se aclara con el tiempo) y
 * hay que adivinar a qué se dedica. Responder rápido da más puntos.
 */

const RONDAS = 8;
const SEGUNDOS = 15;
const DIFUMINADO = 3; // segundos que tarda la foto en verse nítida
const BLUR_INICIAL = 10; // px
const OPCIONES = 4;

const url = (p?: string | null) => (p ? `${import.meta.env.BASE_URL}${p}` : null);

function mezclar<T>(lista: T[]): T[] {
  const c = [...lista];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

interface Ronda {
  persona: JuegoEgresado;
  opciones: string[];
}

const jugables = juego.filter((p) => p.foto && p.ocupacion);

/** Palabras con peso de una ocupación (sin tildes, de 5 letras o más, sin "fundador/a"). */
const palabras = (t: string) =>
  new Set(
    t
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(/[^a-z]+/)
      .filter((w) => w.length >= 5 && !w.startsWith("fundador"))
  );
/** Dos ocupaciones se parecen si comparten alguna palabra importante. */
function separecen(a: string, b: string) {
  const pb = palabras(b);
  return [...palabras(a)].some((w) => pb.has(w));
}

function armarRondas(): Ronda[] {
  const elegidos = mezclar(jugables).slice(0, Math.min(RONDAS, jugables.length));
  return elegidos.map((persona) => {
    const todas = mezclar(
      [...new Set(jugables.filter((p) => p.id !== persona.id).map((p) => p.ocupacion as string))].filter(
        (o) => o !== persona.ocupacion
      )
    );
    // Primero las opciones que no se parecen a la correcta (p. ej. dos de
    // "cosmética natural" confunden); si no alcanzan, se completa con las demás.
    const distintas = todas.filter((o) => !separecen(o, persona.ocupacion as string));
    const otras = [...distintas, ...todas.filter((o) => !distintas.includes(o))].slice(0, OPCIONES - 1);
    return { persona, opciones: mezclar([persona.ocupacion as string, ...otras]) };
  });
}

function rango(pct: number) {
  if (pct >= 0.85) return { emoji: "🦅", titulo: "Percepción de águila", texto: "Ves más allá de una foto. ¡Impresionante!" };
  if (pct >= 0.6) return { emoji: "👀", titulo: "Muy buen ojo", texto: "Tienes intuición para leer a las personas." };
  if (pct >= 0.35) return { emoji: "🔍", titulo: "Vas por buen camino", texto: "Algunas fotos engañan… ¡intenta otra vez!" };
  return { emoji: "🤝", titulo: "¡A conocer más egresados!", texto: "Las apariencias engañan: cada egresado tiene una historia por descubrir." };
}

/* ───────────────────────────── Intro en slides ───────────────────────────── */

const FOTOS_INTRO = jugables.slice(0, 5);

function FotoCirculo({ p, className = "", style }: { p: JuegoEgresado; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`overflow-hidden rounded-full border-2 border-white/70 shadow-2xl ${className}`} style={style}>
      <Portrait hue={hueSeed(p.id)} className="h-full w-full">
        <img src={url(p.fotoJuego ?? p.foto) ?? ""} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      </Portrait>
    </div>
  );
}

function SlideVisual({ n }: { n: number }) {
  const reduce = usePrefersReducedMotion();
  if (n === 0)
    return (
      <div className="relative mx-auto h-56 w-full max-w-sm sm:h-72">
        {FOTOS_INTRO.map((p, i) => {
          const a = (i - 2) * 16;
          return (
            <motion.div
              key={p.id}
              className="absolute left-1/2 top-1/2"
              initial={{ x: "-50%", y: "-50%", rotate: 0, opacity: 0 }}
              animate={{ x: `calc(-50% + ${(i - 2) * 58}px)`, y: `calc(-50% + ${Math.abs(i - 2) * 14}px)`, rotate: a, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 120, damping: 14 }}
              style={{ zIndex: 5 - Math.abs(i - 2) }}
            >
              <FotoCirculo p={p} className="h-28 w-28 sm:h-36 sm:w-36" style={{ filter: i === 2 ? "none" : "blur(3px) saturate(0.7)" }} />
            </motion.div>
          );
        })}
      </div>
    );
  if (n === 1)
    return (
      <div className="relative mx-auto flex h-56 items-center justify-center sm:h-72">
        <div className="relative">
          <FotoCirculo p={FOTOS_INTRO[1] ?? jugables[0]} className="h-48 w-48 sm:h-60 sm:w-60" style={{ filter: "blur(12px)" }} />
          {!reduce && (
            <motion.span
              className="absolute inset-x-0 h-1 rounded-full bg-gradient-to-r from-transparent via-alumni to-transparent"
              animate={{ top: ["8%", "90%", "8%"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <motion.span
            className="font-display absolute inset-0 flex items-center justify-center text-8xl font-bold text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
            animate={reduce ? undefined : { scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            ?
          </motion.span>
        </div>
      </div>
    );
  if (n === 2)
    return (
      <ol className="mx-auto grid max-w-2xl gap-3 text-left sm:grid-cols-3">
        {[
          ["👁️", "Mira la foto", "Empieza borrosa y en segundos se aclara."],
          ["🤔", "Adivina qué hace", "Elige entre 4 opciones."],
          ["⚡", "Sé rápido", "Mientras antes aciertes, más puntos."],
        ].map(([ico, t, d], i) => (
          <motion.li
            key={t}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.12 }}
            className="rounded-2xl border border-paper/10 bg-paper/[0.05] p-5"
          >
            <span className="text-3xl">{ico}</span>
            <p className="font-display mt-3 text-lg text-paper">
              <span className="mr-1 text-alumni">{i + 1}.</span> {t}
            </p>
            <p className="mt-1 text-sm text-paper-dim">{d}</p>
          </motion.li>
        ))}
      </ol>
    );
  return (
    <motion.div
      className="mx-auto flex h-40 items-center justify-center text-8xl sm:h-52"
      animate={reduce ? undefined : { y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
      transition={{ duration: 2.4, repeat: Infinity }}
    >
      🎯
    </motion.div>
  );
}

const SLIDES = [
  { eyebrow: "Juego · Alumni USB Cali", titulo: "¿Cómo estás de percepción?", texto: "Pon a prueba tu intuición con egresados reales de la USB Cali." },
  { eyebrow: "El reto", titulo: "¿Qué tan bueno eres adivinando con solo una imagen?", texto: "Solo verás su foto. Lo demás… tendrás que percibirlo." },
  { eyebrow: "Cómo se juega", titulo: "Mira, adivina y descubre", texto: `${RONDAS} rondas · ${SEGUNDOS} segundos por foto` },
  { eyebrow: "¿Listo?", titulo: "Que empiece el juego", texto: "Al final sabrás qué tan buena es tu percepción." },
];

function Intro({ onEmpezar, onCartas }: { onEmpezar: () => void; onCartas: () => void }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const ir = useCallback(
    (n: number) => {
      if (n < 0 || n >= SLIDES.length) return;
      setDir(n > i ? 1 : -1);
      setI(n);
    },
    [i]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") ir(i + 1);
      if (e.key === "ArrowLeft") ir(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, ir]);

  const s = SLIDES[i];
  const ultima = i === SLIDES.length - 1;

  return (
    <div className="relative">
      <div className="relative min-h-[34rem] overflow-hidden sm:min-h-[32rem]">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={i}
            custom={dir}
            initial={{ opacity: 0, x: dir * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -80 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) ir(i + 1);
              else if (info.offset.x > 60) ir(i - 1);
            }}
            className="flex cursor-grab flex-col items-center px-2 text-center active:cursor-grabbing"
          >
            <p className="eyebrow mb-4 text-xs uppercase tracking-[0.3em] text-gold">{s.eyebrow}</p>
            <h1 className="font-display mx-auto max-w-3xl text-balance text-4xl font-light leading-[1.08] text-paper sm:text-5xl lg:text-6xl">
              {i === 0 ? (
                <>
                  ¿Cómo estás de <span className="alumni-text font-semibold">percepción</span>?
                </>
              ) : (
                s.titulo
              )}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-balance text-paper-dim">{s.texto}</p>
            <div className="mt-8 w-full">
              <SlideVisual n={i} />
            </div>
            {ultima && (
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={onEmpezar}
                  data-cursor-hover
                  className="rounded-full bg-gradient-to-r from-alumni to-pink px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_40px_-10px_rgba(236,69,95,0.8)] transition-transform hover:-translate-y-0.5"
                >
                  ▶ Empezar a jugar
                </button>
                <button
                  type="button"
                  onClick={onCartas}
                  data-cursor-hover
                  className="rounded-full border border-paper/20 px-6 py-4 text-sm uppercase tracking-[0.14em] text-paper transition-colors hover:border-gold/60 hover:text-gold-soft"
                >
                  Ver todas las cartas
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* controles */}
      <div className="mt-6 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => ir(i - 1)}
          disabled={i === 0}
          aria-label="Slide anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/20 text-paper transition-colors hover:border-alumni disabled:opacity-30"
        >
          ←
        </button>
        <div className="flex gap-2">
          {SLIDES.map((_, n) => (
            <button
              key={n}
              type="button"
              onClick={() => ir(n)}
              aria-label={`Ir a la slide ${n + 1}`}
              aria-current={n === i}
              className={`h-2.5 rounded-full transition-all ${n === i ? "w-8 bg-gradient-to-r from-alumni to-pink" : "w-2.5 bg-paper/25 hover:bg-paper/50"}`}
            />
          ))}
        </div>
        {ultima ? (
          <span className="h-11 w-11" />
        ) : (
          <button
            type="button"
            onClick={() => ir(i + 1)}
            aria-label="Siguiente slide"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-alumni text-white transition-transform hover:scale-105"
          >
            →
          </button>
        )}
      </div>
      {!ultima && (
        <p className="mt-3 text-center">
          <button type="button" onClick={onEmpezar} className="text-xs uppercase tracking-[0.18em] text-paper-dim hover:text-alumni">
            Saltar intro y jugar
          </button>
        </p>
      )}
    </div>
  );
}

/* ───────────────────────────── Partida ───────────────────────────── */

function Chispas() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: 18 }).map((_, k) => {
        const ang = (k / 18) * Math.PI * 2;
        const d = 110 + (k % 3) * 30;
        return (
          <motion.span
            key={k}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
            style={{ background: ["#f57206", "#ec455f", "#a3a7f0"][k % 3] }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(ang) * d, y: Math.sin(ang) * d, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

function Partida({ onFin }: { onFin: (r: { puntos: number; aciertos: number; total: number }) => void }) {
  const reduce = usePrefersReducedMotion();
  const rondas = useMemo(armarRondas, []);
  const [n, setN] = useState(0);
  const [elegida, setElegida] = useState<string | null>(null);
  const [agotado, setAgotado] = useState(false);
  const [restante, setRestante] = useState(SEGUNDOS);
  const [puntos, setPuntos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [ganados, setGanados] = useState(0);
  const inicio = useRef(performance.now());

  const ronda = rondas[n];
  const respondida = elegida !== null || agotado;
  const correcta = elegida === ronda.persona.ocupacion;

  // reloj
  useEffect(() => {
    if (respondida) return;
    inicio.current = performance.now();
    setRestante(SEGUNDOS);
    let raf = 0;
    const tick = () => {
      const r = Math.max(0, SEGUNDOS - (performance.now() - inicio.current) / 1000);
      setRestante(r);
      if (r <= 0) setAgotado(true);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n, respondida]);

  const responder = useCallback(
    (op: string) => {
      if (respondida) return;
      setElegida(op);
      if (op === ronda.persona.ocupacion) {
        const g = 100 + Math.round((restante / SEGUNDOS) * 100);
        setGanados(g);
        setPuntos((p) => p + g);
        setAciertos((a) => a + 1);
      } else setGanados(0);
    },
    [respondida, ronda, restante]
  );

  const siguiente = useCallback(() => {
    if (n + 1 >= rondas.length) {
      onFin({ puntos, aciertos, total: rondas.length });
      return;
    }
    setN(n + 1);
    setElegida(null);
    setAgotado(false);
    setGanados(0);
  }, [n, rondas.length, onFin, puntos, aciertos]);

  // teclado: 1-4 para responder, Enter para seguir
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = Number(e.key);
      if (!respondida && k >= 1 && k <= ronda.opciones.length) responder(ronda.opciones[k - 1]);
      if (respondida && (e.key === "Enter" || e.key === "ArrowRight")) siguiente();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [respondida, ronda, responder, siguiente]);

  const progreso = restante / SEGUNDOS;
  // El difuminado dura poco: arranca suave y en DIFUMINADO segundos la foto ya
  // está nítida, así queda tiempo de sobra para mirarla y adivinar.
  const transcurrido = SEGUNDOS - restante;
  const blur = respondida ? 0 : Math.round(Math.max(0, 1 - transcurrido / DIFUMINADO) * BLUR_INICIAL * 10) / 10;
  const R = 46;
  const C = 2 * Math.PI * R;
  const p = ronda.persona;

  return (
    <div className="mx-auto max-w-5xl">
      {/* marcador */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {rondas.map((_, k) => (
            <span
              key={k}
              className={`h-2 rounded-full transition-all ${k < n ? "w-5 bg-alumni" : k === n ? "w-8 bg-gradient-to-r from-alumni to-pink" : "w-3 bg-paper/20"}`}
            />
          ))}
        </div>
        <p className="text-sm text-paper-dim">
          Ronda <strong className="text-paper">{n + 1}</strong>/{rondas.length} ·{" "}
          <motion.strong key={puntos} initial={{ scale: 1.5, color: "#f57206" }} animate={{ scale: 1, color: "#ffffff" }} className="inline-block">
            {puntos}
          </motion.strong>{" "}
          pts
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={n}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.4 }}
          className="grid items-center gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-14"
        >
          {/* foto con reloj circular */}
          <div className="relative mx-auto w-full max-w-[17rem] sm:max-w-[20rem]">
            <svg viewBox="0 0 100 100" className="absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={progreso < 0.3 && !respondida ? "#ec455f" : "#f57206"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - (respondida ? (elegida ? progreso : 0) : progreso))}
              />
            </svg>
            <motion.div
              className="relative aspect-square overflow-hidden rounded-full border-2 border-white/70 shadow-2xl"
              animate={respondida ? (correcta ? { scale: [1, 1.06, 1] } : { x: [0, -10, 10, -6, 6, 0] }) : {}}
              transition={{ duration: 0.5 }}
            >
              <Portrait hue={hueSeed(p.id)} className="h-full w-full">
                <img
                  src={url(p.fotoJuego ?? p.foto) ?? ""}
                  alt={respondida ? p.nombre : "Egresado por adivinar"}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ filter: `blur(${reduce ? 0 : blur}px)`, transition: respondida ? "filter 0.6s" : undefined, transform: "scale(1.08)" }}
                />
              </Portrait>
            </motion.div>
            {!respondida && (
              <span className="font-display absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-sm tabular-nums text-paper ring-1 ring-paper/15">
                {Math.ceil(restante)} s
              </span>
            )}
            {respondida && correcta && !reduce && <Chispas />}
          </div>

          {/* pregunta y opciones */}
          <div>
            <p className="eyebrow mb-3 text-xs uppercase tracking-[0.3em] text-gold">Adivina</p>
            <h2 className="font-display text-balance text-3xl font-light text-paper sm:text-4xl">
              ¿A qué se dedica {respondida ? <span className="alumni-text font-semibold">{p.nombre}</span> : "este egresado"}?
            </h2>

            <ul className="mt-6 grid gap-3">
              {ronda.opciones.map((op, k) => {
                const esCorrecta = op === p.ocupacion;
                const estado = !respondida ? "normal" : esCorrecta ? "bien" : op === elegida ? "mal" : "apagada";
                return (
                  <li key={op}>
                    <motion.button
                      type="button"
                      onClick={() => responder(op)}
                      disabled={respondida}
                      data-cursor-hover
                      whileHover={respondida ? undefined : { x: 6 }}
                      whileTap={respondida ? undefined : { scale: 0.98 }}
                      className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left text-[15px] leading-snug transition-colors ${
                        estado === "normal"
                          ? "border-paper/15 bg-paper/[0.04] text-paper hover:border-alumni/70 hover:bg-paper/[0.08]"
                          : estado === "bien"
                            ? "border-emerald-400/80 bg-emerald-500/15 text-paper"
                            : estado === "mal"
                              ? "border-pink/80 bg-pink/15 text-paper"
                              : "border-paper/10 text-paper/40"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                          estado === "bien" ? "bg-emerald-400 text-ink" : estado === "mal" ? "bg-pink text-white" : "bg-paper/10 text-paper/80"
                        }`}
                      >
                        {estado === "bien" ? "✓" : estado === "mal" ? "✕" : k + 1}
                      </span>
                      {op}
                    </motion.button>
                  </li>
                );
              })}
            </ul>

            <AnimatePresence>
              {respondida && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-2xl border border-paper/10 bg-gradient-to-br from-navy/40 to-plum/30 p-5"
                >
                  <p className="font-display text-xl text-paper">
                    {correcta ? `¡Correcto! +${ganados} pts` : agotado && !elegida ? "⏱ ¡Se acabó el tiempo!" : "¡Casi! No era esa."}
                  </p>
                  <p className="mt-2 text-sm text-paper/85">
                    <strong>{p.nombre}</strong>{p.programa ? <> estudió <strong>{p.programa}</strong> en la USB</> : " es egresado(a) de la USB"}
                    {p.empresa ? (
                      <>
                        {" "}
                        y hoy {p.tipo === "Emprendedor" ? "lidera" : "trabaja en"} <strong>{p.empresa}</strong>
                      </>
                    ) : null}{" "}
                    · {p.pais}
                  </p>
                  <button
                    type="button"
                    onClick={siguiente}
                    autoFocus
                    data-cursor-hover
                    className="mt-4 rounded-full bg-gradient-to-r from-alumni to-pink px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white"
                  >
                    {n + 1 >= rondas.length ? "Ver mi resultado →" : "Siguiente foto →"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────────── Resultado ───────────────────────────── */

function Resultado({
  puntos,
  aciertos,
  total,
  onOtra,
  onCartas,
}: {
  puntos: number;
  aciertos: number;
  total: number;
  onOtra: () => void;
  onCartas: () => void;
}) {
  const r = rango(aciertos / total);
  const [cont, setCont] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const k = Math.min(1, (performance.now() - t0) / 1200);
      setCont(Math.round(puntos * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [puntos]);

  const compartir = async () => {
    const texto = `Saqué ${puntos} puntos (${aciertos}/${total}) en "¿Cómo estás de percepción?" de Alumni USB Cali ${r.emoji}`;
    try {
      if (navigator.share) await navigator.share({ text: texto, url: location.href });
      else await navigator.clipboard.writeText(`${texto} ${location.href}`);
    } catch {
      /* el usuario canceló */
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-xl text-center">
      <motion.p
        className="text-7xl"
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 10, delay: 0.2 }}
      >
        {r.emoji}
      </motion.p>
      <p className="eyebrow mt-4 inline-flex text-xs uppercase tracking-[0.3em] text-gold">Tu percepción</p>
      <h2 className="font-display mt-2 text-4xl font-light text-paper sm:text-5xl">{r.titulo}</h2>
      <p className="mt-3 text-paper-dim">{r.texto}</p>
      <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3">
        <div className="rounded-2xl border border-paper/10 bg-paper/[0.04] p-4">
          <p className="font-display alumni-text text-4xl font-semibold tabular-nums">{cont}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-paper-dim">puntos</p>
        </div>
        <div className="rounded-2xl border border-paper/10 bg-paper/[0.04] p-4">
          <p className="font-display text-4xl font-semibold text-paper">
            {aciertos}
            <span className="text-paper-dim">/{total}</span>
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-paper-dim">aciertos</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onOtra}
          data-cursor-hover
          className="rounded-full bg-gradient-to-r from-alumni to-pink px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white"
        >
          ↻ Jugar otra vez
        </button>
        <button
          type="button"
          onClick={compartir}
          data-cursor-hover
          className="rounded-full border border-paper/20 px-6 py-3.5 text-sm uppercase tracking-[0.12em] text-paper hover:border-alumni/60"
        >
          Compartir
        </button>
        <button
          type="button"
          onClick={onCartas}
          data-cursor-hover
          className="rounded-full border border-paper/20 px-6 py-3.5 text-sm uppercase tracking-[0.12em] text-paper hover:border-gold/60 hover:text-gold-soft"
        >
          Conocer a todos
        </button>
      </div>
    </motion.div>
  );
}

/* ───────────────────────────── Contenedor ───────────────────────────── */

type Fase = "intro" | "jugando" | "resultado";

export default function JuegoPercepcion({ onVerCartas }: { onVerCartas: () => void }) {
  const [fase, setFase] = useState<Fase>("intro");
  const [partida, setPartida] = useState(0);
  const [res, setRes] = useState({ puntos: 0, aciertos: 0, total: RONDAS });
  const ref = useRef<HTMLDivElement>(null);

  const subir = () => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div ref={ref} className="scroll-mt-28">
      <AnimatePresence mode="wait">
        <motion.div key={fase + partida} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {fase === "intro" && (
            <Intro
              onEmpezar={() => {
                setFase("jugando");
                subir();
              }}
              onCartas={onVerCartas}
            />
          )}
          {fase === "jugando" && (
            <Partida
              key={partida}
              onFin={(r) => {
                setRes(r);
                setFase("resultado");
                subir();
              }}
            />
          )}
          {fase === "resultado" && (
            <Resultado
              {...res}
              onOtra={() => {
                setPartida((p) => p + 1);
                setFase("jugando");
                subir();
              }}
              onCartas={onVerCartas}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
