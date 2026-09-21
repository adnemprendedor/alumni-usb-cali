import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { stats } from "../data/derived";

function Counter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, target, motionVal]);

  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toString();
      }),
    [spring]
  );

  return <span ref={ref}>0</span>;
}

export default function StatsSection() {
  return (
    <section className="relative bg-ink px-4 py-28 sm:px-8 lg:py-40">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 sm:grid-cols-3 sm:gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">{String(i + 1).padStart(2, "0")}</p>
            <p className="font-display text-6xl font-light text-paper sm:text-7xl">
              +<Counter target={s.numero} />
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.2em] text-paper-dim">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
