import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/useReducedMotion";
import content from "../data/content.json";

const { eyebrow, titulo: TITLE, subtitulo, ctaLabel, scrollLabel } = content.hero;

const TYPE_SPEED_MS = 32; // ms por carácter
const TYPE_START_DELAY = 550; // ms, después de que aparece el eyebrow

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const reducedMotion = usePrefersReducedMotion();

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.9]);

  // brillo que sigue al cursor — da sensación de profundidad/interactividad
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  // efecto "escrito en computadora": el titular se escribe carácter a carácter
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const typingDurationS = (TITLE.length * TYPE_SPEED_MS) / 1000;
  const afterTypeDelay = TYPE_START_DELAY / 1000 + typingDurationS;

  return (
    <section
      id="inicio"
      ref={ref}
      onMouseMove={handleMove}
      className="relative h-[100svh] overflow-hidden bg-ink"
    >
      {/* cinematic background */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(80% 60% at 15% 10%, hsla(30, 90%, 48%, 0.35), transparent 60%),
              radial-gradient(70% 60% at 85% 90%, hsla(20, 55%, 22%, 0.5), transparent 60%),
              linear-gradient(200deg, #262420 0%, #1d1d1b 55%, #1d1d1b 100%)
            `,
          }}
        />

        {/* malla / circuito sutil, evoca "ADN" y tecnología sin ser ruidosa */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]" preserveAspectRatio="none">
          <defs>
            <pattern id="hero-grid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#ef7d00" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        {/* brillo que sigue el cursor */}
        {!reducedMotion && (
          <motion.div
            className="pointer-events-none absolute h-[32rem] w-[32rem] rounded-full blur-3xl"
            style={{
              left: smx,
              top: smy,
              translateX: "-50%",
              translateY: "-50%",
              backgroundImage: "radial-gradient(circle, hsla(30,90%,55%,0.18), transparent 70%)",
            }}
          />
        )}

        <div className="grain absolute inset-0" />

        {/* barrido de luz, tipo "scanline" cinematográfico */}
        {!reducedMotion && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-1/3"
            style={{
              backgroundImage: "linear-gradient(180deg, transparent, hsla(30,80%,60%,0.06), transparent)",
            }}
            animate={{ top: ["-33%", "100%"] }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          />
        )}

        {/* floating graphic elements */}
        <motion.div
          className="absolute left-[8%] top-[20%] h-40 w-40 rounded-full border border-gold/20 sm:h-56 sm:w-56"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[12%] top-[55%] h-24 w-24 rounded-full bg-gold/10 blur-xl sm:h-36 sm:w-36"
          animate={{ y: [0, 22, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div className="absolute inset-0 bg-ink" style={{ opacity: overlayOpacity }} />

      {/* content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 text-xs uppercase tracking-[0.35em] text-gold"
        >
          {eyebrow}
        </motion.p>

        <h1 className="font-display max-w-4xl text-balance text-[9vw] font-light leading-[1.05] text-paper sm:text-[6.5vw] lg:text-[4.4rem]">
          {TITLE.slice(0, typedLength)}
          <motion.span
            aria-hidden
            className="ml-1 inline-block w-[0.5ch] translate-y-[0.08em] bg-gold align-middle"
            style={{ height: "0.78em" }}
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: typingDone ? 1 : 0, y: typingDone ? 0 : 14 }}
          transition={{ duration: 0.7, delay: typingDone ? 0 : afterTypeDelay }}
          className="mt-6 max-w-xl text-balance text-base text-paper-dim sm:text-lg"
        >
          {subtitulo}
        </motion.p>

        <motion.a
          href="#explora"
          data-cursor-hover
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: typingDone ? 1 : 0, y: typingDone ? 0 : 14 }}
          transition={{ duration: 0.7, delay: typingDone ? 0.15 : afterTypeDelay + 0.15 }}
          whileHover="hover"
          className="group relative mt-12 inline-flex items-center gap-3 overflow-hidden rounded-full border border-paper/25 px-8 py-4 text-sm uppercase tracking-[0.15em] text-paper"
        >
          <motion.span
            className="absolute inset-0 bg-gold"
            initial={{ scaleX: 0 }}
            variants={{ hover: { scaleX: 1 } }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0 }}
          />
          <span className="relative z-10 transition-colors duration-300 group-hover:text-ink">
            {ctaLabel}
          </span>
          <motion.span
            className="relative z-10 transition-colors duration-300 group-hover:text-ink"
            variants={{ hover: { x: 4 } }}
          >
            →
          </motion.span>
        </motion.a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-paper-dim"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {scrollLabel}
        </motion.div>
      </motion.div>
    </section>
  );
}
