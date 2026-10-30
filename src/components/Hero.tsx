import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/useReducedMotion";
import { stats } from "../data/derived";
import Logo3D from "./Logo3D";
import content from "../data/content.json";

const { eyebrow, titulo: TITLE, subtitulo, ctaLabel, scrollLabel } = content.hero;

const TYPE_SPEED_MS = 30; // ms por carácter
const TYPE_START_DELAY = 650; // ms, después de que aparece el eyebrow

/**
 * Portada rediseñada (oscuro + colores Alumni): texto a la izquierda y el logo
 * 3D de ADN Emprendedor a la derecha. En celular el logo va arriba.
 * Los textos se editan desde el panel (/admin → Textos del sitio → hero).
 */
export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const reducedMotion = usePrefersReducedMotion();

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // brillo que sigue al cursor
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  // titular "escrito a máquina"
  const [typedLength, setTypedLength] = useState(reducedMotion ? TITLE.length : 0);
  const [typingDone, setTypingDone] = useState(reducedMotion);
  useEffect(() => {
    if (reducedMotion) {
      setTypedLength(TITLE.length);
      setTypingDone(true);
      return;
    }
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setTypedLength(i);
        if (i >= TITLE.length) {
          clearInterval(interval);
          setTypingDone(true);
        }
      }, TYPE_SPEED_MS);
    }, TYPE_START_DELAY);
    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, [reducedMotion]);

  const aparece = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: typingDone ? 1 : 0, y: typingDone ? 0 : 14 },
    transition: { duration: 0.7, delay: typingDone ? delay : 0 },
  });

  return (
    <section id="inicio" ref={ref} onMouseMove={handleMove} className="relative min-h-[100svh] overflow-hidden bg-ink">
      {/* fondo: resplandores azul marino / rosa / naranja de la marca Alumni */}
      <motion.div className="absolute inset-0" style={{ y: bgY }} aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(60% 55% at 78% 38%, rgba(49, 52, 103, 0.75), transparent 70%),
              radial-gradient(45% 45% at 92% 75%, rgba(236, 69, 95, 0.28), transparent 70%),
              radial-gradient(40% 40% at 8% 18%, rgba(245, 114, 6, 0.22), transparent 70%),
              radial-gradient(50% 50% at 30% 100%, rgba(107, 58, 114, 0.35), transparent 70%),
              linear-gradient(180deg, #17171f 0%, #1d1d1b 100%)
            `,
          }}
        />
        {/* puntos finos */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1.2px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(70% 70% at 50% 45%, #000 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(70% 70% at 50% 45%, #000 30%, transparent 80%)",
          }}
        />
        {!reducedMotion && (
          <motion.div
            className="pointer-events-none absolute h-[30rem] w-[30rem] rounded-full blur-3xl"
            style={{
              left: smx,
              top: smy,
              translateX: "-50%",
              translateY: "-50%",
              backgroundImage: "radial-gradient(circle, rgba(236,69,95,0.16), rgba(245,114,6,0.08) 45%, transparent 70%)",
            }}
          />
        )}
        <div className="grain absolute inset-0" />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto grid min-h-[100svh] max-w-7xl items-center gap-6 px-5 pb-24 pt-28 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pb-28 lg:pt-36"
      >
        {/* logo 3D (arriba en celular, derecha en escritorio) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="order-1 mx-auto w-full max-w-[26rem] sm:max-w-[32rem] lg:order-2 lg:max-w-none"
        >
          <Logo3D />
        </motion.div>

        <div className="order-2 text-center lg:order-1 lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="eyebrow mb-5 text-[10px] uppercase tracking-[0.2em] text-gold sm:text-xs sm:tracking-[0.3em]"
          >
            {eyebrow}
          </motion.p>

          <h1 className="font-display text-balance text-[2.1rem] font-light leading-[1.08] text-paper sm:text-5xl lg:text-[3.1rem] xl:text-[3.5rem]">
            {/* reserva el alto del titular completo para que nada salte al escribir */}
            <span className="grid">
              <span className="invisible col-start-1 row-start-1" aria-hidden>
                {TITLE}
              </span>
              <span className="col-start-1 row-start-1">
                <span className="sr-only">{TITLE}</span>
                <span aria-hidden>
                  {TITLE.slice(0, typedLength)}
                  {!typingDone && (
                    <span
                      className="ml-1 inline-block w-[0.45ch] translate-y-[0.08em] bg-gradient-to-b from-alumni to-pink align-middle"
                      style={{ height: "0.78em" }}
                    />
                  )}
                </span>
              </span>
            </span>
          </h1>

          <motion.p {...aparece(0)} className="mx-auto mt-6 max-w-xl text-balance text-base text-paper-dim sm:text-lg lg:mx-0">
            {subtitulo}
          </motion.p>

          <motion.div {...aparece(0.12)} className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a
              href="#explora"
              data-cursor-hover
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-alumni to-pink whitespace-nowrap px-6 py-3.5 text-xs font-medium uppercase tracking-[0.12em] text-white sm:px-7 sm:text-sm lg:px-6 lg:tracking-[0.08em] shadow-[0_10px_40px_-10px_rgba(236,69,95,0.7)] transition-transform hover:-translate-y-0.5"
            >
              {ctaLabel}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#/juego"
              data-cursor-hover
              className="inline-flex items-center gap-2 rounded-full border border-paper/20 bg-paper/5 whitespace-nowrap px-6 py-3.5 text-xs uppercase tracking-[0.12em] text-paper backdrop-blur-sm sm:text-sm lg:px-5 lg:tracking-[0.08em] transition-colors hover:border-gold/60 hover:text-gold-soft"
            >
              <span aria-hidden>♠</span> Jugar con las cartas
            </a>
          </motion.div>

          <motion.dl
            {...aparece(0.24)}
            className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-paper/10 pt-6 lg:mx-0"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center lg:text-left">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display alumni-text text-3xl font-semibold sm:text-4xl">{s.numero}</dd>
                <dd className="mt-1 text-[10px] uppercase leading-snug tracking-[0.14em] text-paper-dim sm:text-[11px]">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>

      <motion.a
        href="#explora"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-paper-dim sm:flex"
      >
        {scrollLabel}
        <span className="relative h-9 w-[1px] overflow-hidden bg-paper/15">
          {!reducedMotion && (
            <motion.span
              className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent to-alumni"
              animate={{ top: ["-50%", "100%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </span>
      </motion.a>
    </section>
  );
}
