import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { juego, type JuegoEgresado } from "../data/juego";
import FlipCard from "../components/FlipCard";
import Footer from "../components/Footer";
import { usePrefersReducedMotion } from "../hooks/useReducedMotion";

function mezclar(lista: JuegoEgresado[]): JuegoEgresado[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Pequeña inclinación distinta para cada carta del mazo, como una baraja real. */
const inclinacion = (i: number) => ((i * 37) % 13) - 6;

// mazo: cartas apiladas · repartiendo: vuelan a su lugar · listo: se puede jugar · recogiendo: vuelven al mazo
type Fase = "mazo" | "repartiendo" | "listo" | "recogiendo";

const DEMORA_ENTRE_CARTAS = 0.08; // segundos entre una carta y la siguiente
const DURACION_VUELO = 0.8;

export default function JuegoPage() {
  const reducedMotion = usePrefersReducedMotion();
  // Cada vez que se entra al juego, las cartas salen en orden al azar.
  const [orden, setOrden] = useState(() => mezclar(juego));
  const [fase, setFase] = useState<Fase>("mazo");
  const [ronda, setRonda] = useState(0);
  // Distancia desde cada casilla de la cuadrícula hasta el mazo.
  const [offsets, setOffsets] = useState<{ x: number; y: number }[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const mazoRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const medir = useCallback(() => {
    const grid = gridRef.current;
    const mazo = mazoRef.current;
    if (!grid || !mazo) return;
    const m = mazo.getBoundingClientRect();
    const g = grid.getBoundingClientRect();
    const celdas = Array.from(grid.children) as HTMLElement[];
    // offsetLeft/offsetTop no incluyen la transformación de la carta, así que
    // dan la casilla real aunque la carta esté en el mazo.
    setOffsets(
      celdas.map((c) => ({
        x: m.left + m.width / 2 - (g.left + c.offsetLeft + c.offsetWidth / 2),
        y: m.top + m.height / 2 - (g.top + c.offsetTop + c.offsetHeight / 2),
      }))
    );
  }, []);

  useLayoutEffect(() => {
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [medir]);

  const programar = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const repartir = useCallback(() => {
    setFase("repartiendo");
    programar(() => setFase("listo"), (orden.length * DEMORA_ENTRE_CARTAS + DURACION_VUELO) * 1000);
  }, [orden.length, programar]);

  // Reparto inicial: el mazo aparece y, cuando el juego entra en pantalla, se reparte.
  useEffect(() => {
    if (reducedMotion) {
      setFase("listo");
      return;
    }
    if (offsets.length === 0 || fase !== "mazo" || ronda !== 0) return;
    const grid = gridRef.current;
    if (!grid) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          programar(repartir, 500);
        }
      },
      { threshold: 0.05 }
    );
    io.observe(grid);
    return () => io.disconnect();
  }, [offsets.length, fase, ronda, reducedMotion, repartir, programar]);

  const ocupado = fase === "repartiendo" || fase === "recogiendo";

  function barajar() {
    if (ocupado) return;
    setRonda((r) => r + 1); // todas las cartas vuelven a mostrar el frente
    if (reducedMotion) {
      setOrden((o) => mezclar(o));
      return;
    }
    // 1) se recogen todas las cartas en el mazo
    medir();
    setFase("recogiendo");
    programar(() => {
      // 2) se baraja mientras están apiladas (el cambio de orden no se ve)
      setOrden((o) => {
        let nuevo = mezclar(o);
        if (nuevo.every((p, i) => p.id === o[i].id)) nuevo = mezclar(o);
        return nuevo;
      });
      setFase("mazo");
      // 3) se vuelven a repartir
      programar(repartir, 400);
    }, 900);
  }

  const apiladas = fase === "mazo" || fase === "recogiendo";

  return (
    <div className="bg-ink pt-32 sm:pt-40">
      <section className="relative px-4 pb-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            data-cursor-hover
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-paper-dim hover:text-gold"
          >
            ← Volver al directorio
          </Link>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-3 text-xs uppercase tracking-[0.3em] text-gold"
          >
            Juego · Conoce a nuestros egresados
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="font-display text-balance text-4xl font-light text-paper sm:text-5xl lg:text-6xl"
          >
            Egresados que dejan huella
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 max-w-2xl text-balance text-paper-dim"
          >
            Toca cualquier carta para girarla y descubrir qué estudió cada egresado en la USB, si es empleado o
            emprendedor, en qué empresa está y a qué se dedica. Baraja de nuevo y vuelve a jugar.
          </motion.p>
        </div>
      </section>

      <section className="relative px-4 pb-28 sm:px-8 lg:pb-40">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.2em] text-paper-dim">{orden.length} cartas</p>
            <button
              type="button"
              onClick={barajar}
              disabled={ocupado}
              data-cursor-hover
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-sm text-gold transition-colors hover:bg-gold hover:text-ink disabled:cursor-wait disabled:opacity-60"
            >
              <span aria-hidden>⇄</span> {ocupado ? "Repartiendo…" : "Barajar y repartir"}
            </button>
          </div>

          <div className="relative">
            {/* lugar donde se apila el mazo: centro de la primera fila */}
            <div
              ref={mazoRef}
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 aspect-[3/4] w-full max-w-[16rem] -translate-x-1/2"
            />

            <div
              ref={gridRef}
              className="mx-auto grid max-w-sm grid-cols-1 gap-5 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {orden.map((persona, i) => {
                const off = offsets[i] ?? { x: 0, y: 0 };
                // La primera carta en repartirse es la que está encima del mazo.
                const z = fase === "listo" ? 0 : orden.length - i;
                return (
                  <motion.div
                    key={persona.id}
                    className="relative"
                    style={{ zIndex: z }}
                    initial={false}
                    animate={
                      reducedMotion || !apiladas
                        ? { x: 0, y: 0, rotate: 0, scale: 1 }
                        : { x: off.x, y: off.y, rotate: inclinacion(i), scale: 0.94 }
                    }
                    transition={
                      fase === "mazo"
                        ? { duration: 0 }
                        : fase === "recogiendo"
                          ? { duration: 0.6, ease: [0.65, 0, 0.35, 1], delay: (orden.length - i) * 0.012 }
                          : { type: "spring", stiffness: 140, damping: 20, delay: i * DEMORA_ENTRE_CARTAS }
                    }
                  >
                    <div className={fase === "listo" ? undefined : "pointer-events-none"}>
                      <FlipCard persona={persona} resetSignal={ronda} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
