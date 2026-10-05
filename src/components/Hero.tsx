import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import content from "../data/content.json";

const { eyebrow, titulo: TITLE, subtitulo, ctaLabel, scrollLabel } = content.hero;

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.9]);

  const words = TITLE.split(" ");

  return (
    <section id="inicio" ref={ref} className="relative h-[100svh] overflow-hidden bg-ink">
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
        <div className="grain absolute inset-0" />
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
          {words.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden pb-2 pr-[0.22em] align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "110%", opacity: 0, filter: "blur(14px)", letterSpacing: "-0.02em" }}
                animate={{ y: "0%", opacity: 1, filter: "blur(0px)", letterSpacing: "0em" }}
                transition={{
                  duration: 1.1,
                  delay: 0.35 + i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-xl text-balance text-base text-paper-dim sm:text-lg"
        >
          {subtitulo}
        </motion.p>

        <motion.a
          href="#explora"
          data-cursor-hover
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
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
