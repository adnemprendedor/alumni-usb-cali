import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "../lib/gsap";
import { emprendimientosDestacados } from "../data/derived";
import { hueSeed } from "../lib/color";
import Portrait from "./Portrait";
import { usePrefersReducedMotion } from "../hooks/useReducedMotion";
import content from "../data/content.json";

const { eyebrow, titulo: SECTION_TITLE } = content.secciones.emprendimientos;

export default function ProductsHorizontal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - section.clientWidth;

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.6,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      return () => tween.scrollTrigger?.kill();
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="emprendimientos" ref={sectionRef} className="relative overflow-hidden bg-ink">
      <div className="flex h-[100svh] flex-col justify-center">
        <div className="mx-auto mb-8 w-full max-w-6xl px-4 sm:px-8">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
          <h2 className="font-display text-balance text-4xl font-light text-paper sm:text-5xl lg:text-6xl">
            {SECTION_TITLE}
          </h2>
        </div>

        <div
          ref={trackRef}
          className={`flex ${reducedMotion ? "flex-wrap gap-6 overflow-x-auto px-4 sm:px-8" : "gap-6 pl-4 sm:pl-8"}`}
          style={reducedMotion ? undefined : { width: "max-content" }}
        >
          {emprendimientosDestacados.map((e, i) => (
            <Link
              to={`/egresado/${e.slug}`}
              data-cursor-hover
              key={e.id}
              className="relative h-[52vh] w-[78vw] flex-shrink-0 overflow-hidden rounded-3xl border border-paper/10 sm:w-[46vw] lg:w-[30vw]"
            >
              <Portrait hue={hueSeed(e.id)} variant="wide" className="h-full w-full">
                <div className="absolute inset-0 flex flex-col justify-between p-7">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.25em] text-gold">{e.emprendimientoAsociadoA}</span>
                    <span className="font-display text-2xl text-paper/50">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-paper sm:text-3xl">{e.nombreEmprendimiento}</h3>
                    <p className="mt-1 text-sm text-paper-dim">{e.nombre}</p>
                  </div>
                </div>
              </Portrait>
            </Link>
          ))}
          <div className="w-[4vw] flex-shrink-0" />
        </div>
      </div>
    </section>
  );
}
