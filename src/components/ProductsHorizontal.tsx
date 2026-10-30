import { useLayoutEffect, useRef } from "react";
import { useColorBorde } from "../hooks/useColorBorde";
import { Link } from "react-router-dom";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { emprendimientosDestacados, sectorPorSlug } from "../data/derived";
import { logos } from "../data/logos";
import { hueSeed } from "../lib/color";
import Portrait from "./Portrait";
import { usePrefersReducedMotion } from "../hooks/useReducedMotion";
import content from "../data/content.json";

const { eyebrow, titulo: SECTION_TITLE } = content.secciones.emprendimientos;

const CARD_SIZE = "h-[52vh] w-[78vw] sm:w-[46vw] lg:w-[30vw]";

function LogoCard({
  slug,
  logo,
  numero,
  etiqueta,
  titulo,
  texto,
}: {
  slug: string;
  logo: string;
  numero: number;
  etiqueta: string;
  titulo: string;
  texto: string;
}) {
  const fondo = useColorBorde(logo);
  return (
    <Link
      to={`/egresado/${slug}`}
      data-cursor-hover
      className={`group relative flex ${CARD_SIZE} flex-shrink-0 flex-col overflow-hidden rounded-3xl border border-paper/10 bg-ink-2`}
    >
      {/* logo a pantalla completa */}
      <div className="relative flex-1 overflow-hidden" style={{ backgroundColor: fondo }}>
        <img
          src={logo}
          alt={`Logo de ${titulo}`}
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
          <span className="inline-flex items-center rounded-full bg-ink/75 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
            {etiqueta}
          </span>
          <span className="font-display rounded-full bg-ink/75 px-3 py-0.5 text-lg text-paper/80 backdrop-blur-sm">
            {String(numero).padStart(2, "0")}
          </span>
        </div>
      </div>
      <div className="border-t border-paper/10 px-6 py-5">
        <h3 className="font-display truncate text-2xl text-paper sm:text-[1.7rem]">{titulo}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-paper-dim">{texto}</p>
      </div>
    </Link>
  );
}

function iniciales(nombre: string): string {
  const palabras = nombre.split(/\s+/).filter((p) => /^[\p{L}\d]/u.test(p) && p.length > 2);
  return (palabras.slice(0, 2).map((p) => p[0]).join("") || nombre.charAt(0)).toUpperCase();
}

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

    // El buscador (justo encima) cambia de alto al cargar más resultados,
    // filtrar o terminar de cargar imágenes/fuentes. Si el punto donde se
    // "fija" esta sección no se recalcula, se fija antes de tiempo y tapa la
    // lista de egresados. Se recalcula cada vez que cambia el alto de la página.
    let timer: number | undefined;
    let lastHeight = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastHeight) < 2) return;
      lastHeight = h;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    const anterior = section.parentElement?.previousElementSibling ?? section.previousElementSibling;
    if (anterior) ro.observe(anterior);
    ro.observe(document.body);
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
      ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <section id="emprendimientos" ref={sectionRef} className="relative overflow-hidden bg-ink">
      <div className="flex h-[100svh] flex-col justify-center">
        <div className="mx-auto mb-8 w-full max-w-6xl px-4 sm:px-8">
          <p className="eyebrow mb-3 text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
          <h2 className="font-display text-balance text-4xl font-light text-paper sm:text-5xl lg:text-6xl">
            {SECTION_TITLE}
          </h2>
        </div>

        <div
          ref={trackRef}
          className={`flex ${reducedMotion ? "flex-wrap gap-6 overflow-x-auto px-4 sm:px-8" : "gap-6 pl-4 sm:pl-8"}`}
          style={reducedMotion ? undefined : { width: "max-content" }}
        >
          {emprendimientosDestacados.map((e, i) => {
            const sector = sectorPorSlug[e.slug];
            const logo = logos[e.slug];
            return (
              logo ? (
                <LogoCard
                  key={e.id}
                  slug={e.slug}
                  logo={logo}
                  numero={i + 1}
                  etiqueta={sector ?? e.emprendimientoAsociadoA ?? "Emprendimiento"}
                  titulo={e.nombreEmprendimiento}
                  texto={e.descripcion || `${e.nombre}${e.programa ? ` · ${e.programa}` : ""}`}
                />
              ) : (
              <Link
                to={`/egresado/${e.slug}`}
                data-cursor-hover
                key={e.id}
                className={`group relative ${CARD_SIZE} flex-shrink-0 overflow-hidden rounded-3xl border border-paper/10`}
              >
                <Portrait hue={hueSeed(e.id)} variant="wide" sector={sector} className="h-full w-full">
                  <div className="absolute inset-0 flex flex-col justify-between p-7">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full border border-paper/20 bg-ink/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gold">
                        {sector ?? e.emprendimientoAsociadoA ?? "Emprendimiento"}
                      </span>
                      <span className="font-display text-2xl text-paper/50">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="flex flex-1 items-center justify-center py-4">
                      <span
                        className="font-display flex aspect-square h-full max-h-44 items-center justify-center rounded-3xl border border-gold/30 bg-ink/50 text-6xl font-light text-gold shadow-2xl"
                        aria-hidden
                      >
                        {iniciales(e.nombreEmprendimiento)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-paper sm:text-3xl">{e.nombreEmprendimiento}</h3>
                      {e.descripcion ? (
                        <p className="mt-2 line-clamp-2 max-w-sm text-sm text-paper-dim">{e.descripcion}</p>
                      ) : (
                        <p className="mt-1 text-sm text-paper-dim">
                          {e.nombre}
                          {e.programa ? ` · ${e.programa}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </Portrait>
              </Link>
              )
            );
          })}
          <div className="w-[4vw] flex-shrink-0" />
        </div>
      </div>
    </section>
  );
}
