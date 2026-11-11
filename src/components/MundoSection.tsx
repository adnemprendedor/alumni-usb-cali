import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CATEGORIAS,
  categoriaDe,
  ciudadesExterior,
  exterior,
  paisesExterior,
  puntosExterior,
  type Categoria,
  type PuntoMapa,
} from "../data/exterior";

// three.js pesa: se descarga solo cuando la sección se acerca a la pantalla.
const Globo3D = lazy(() => import("./Globo3D"));
const MapaMundi = lazy(() => import("./MapaMundi"));

/** Código de bandera (ISO 3166-1 alfa-2) por país, para la franja de países. */
const ISO2: Record<string, string> = {
  "Estados Unidos": "US",
  Brasil: "BR",
  España: "ES",
  Francia: "FR",
  Alemania: "DE",
  Canadá: "CA",
  México: "MX",
  Chile: "CL",
  Argentina: "AR",
  Perú: "PE",
  Ecuador: "EC",
  Panamá: "PA",
  Italia: "IT",
  "Reino Unido": "GB",
  Portugal: "PT",
  "Países Bajos": "NL",
  Suiza: "CH",
  Australia: "AU",
  Japón: "JP",
};

const ruta = (p: string | null) => (p ? `${import.meta.env.BASE_URL}${p}` : null);
const iniciales = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function Persona({ e, i }: { e: PuntoMapa["personas"][number]; i: number }) {
  const cat = CATEGORIAS[categoriaDe(e)];
  const foto = ruta(e.foto);
  const contenido = (
    <>
      <span
        className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full ring-2"
        style={{ ["--tw-ring-color" as string]: cat.color }}
      >
        {foto ? (
          <img src={foto} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-ink-3 font-display text-lg text-paper/70">
            {iniciales(e.nombre)}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-base leading-tight text-paper">{e.nombre}</span>
        {e.ocupacion && <span className="mt-0.5 block text-[13px] leading-snug text-paper/80">{e.ocupacion}</span>}
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] uppercase tracking-[0.12em] text-paper-dim">
          <span style={{ color: cat.color }}>● {cat.nombre}</span>
          {e.empresa && e.empresa !== e.ocupacion && <span className="normal-case tracking-normal">{e.empresa}</span>}
        </span>
        {e.programa && <span className="mt-0.5 block text-[11px] text-paper-dim">Egresado(a) de {e.programa}</span>}
      </span>
    </>
  );
  const clase =
    "flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-colors hover:border-white/25 hover:bg-white/[0.07]";
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06, duration: 0.4 }}
    >
      {e.perfil ? (
        <Link to={`/egresado/${e.perfil}`} className={clase} data-cursor-hover>
          {contenido}
        </Link>
      ) : (
        <div className={clase}>{contenido}</div>
      )}
    </motion.li>
  );
}

function Panel({ punto, onCerrar }: { punto: PuntoMapa | null; onCerrar: () => void }) {
  return (
    <AnimatePresence mode="wait">
      {punto ? (
        <motion.div
          key={punto.clave}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-white/10 bg-ink-2/70 p-5 backdrop-blur-md"
          aria-live="polite"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                {ISO2[punto.pais] ?? ""} · {punto.pais}
              </p>
              <h3 className="font-display text-2xl leading-tight text-paper">{punto.lugar.split(",")[0]}</h3>
              <p className="text-xs text-paper-dim">
                {punto.personas.length} {punto.personas.length === 1 ? "egresado" : "egresados"} desde Cali
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              data-cursor-hover
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/15 text-paper-dim transition-colors hover:border-gold/60 hover:text-gold"
            >
              ✕
            </button>
          </div>
          <ul className="flex flex-col gap-2.5">
            {punto.personas.map((e, i) => (
              <Persona key={e.id} e={e} i={i} />
            ))}
          </ul>
        </motion.div>
      ) : (
        <motion.p
          key="ayuda"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="rounded-3xl border border-dashed border-white/15 p-5 text-sm text-paper-dim"
        >
          <span className="text-paper">Toca un punto del globo</span> o un país para conocer a los egresados que viven allí.
          Arrastra para girar el planeta.
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/**
 * Sección "Egresados por el mundo": globo terráqueo 3D con los egresados que
 * viven fuera de Colombia (datos en src/data/exterior.json).
 */
export default function MundoSection() {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [montar, setMontar] = useState(false);
  const [sinWebGL, setSinWebGL] = useState(false);
  const [mapaPlano, setMapaPlano] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // carga el globo cuando la sección está por aparecer
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          setMontar(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const punto = useMemo(() => puntosExterior.find((p) => p.clave === seleccion) ?? null, [seleccion]);
  const conteo = useMemo(() => {
    const c: Record<Categoria, number> = { empresa: 0, investigacion: 0, emprendimiento: 0 };
    exterior.egresados.forEach((e) => (c[categoriaDe(e)] += 1));
    return c;
  }, []);

  const elegirPais = (pais: string) => {
    const p = puntosExterior.filter((q) => q.pais === pais).sort((a, b) => b.personas.length - a.personas.length)[0];
    if (p) setSeleccion(p.clave === seleccion ? null : p.clave);
  };

  const franja = [...paisesExterior, ...paisesExterior, ...paisesExterior];

  return (
    <section id="mundo" ref={ref} className="mundo-seccion relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6 lg:pb-20 lg:pt-32">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8 }}
          >
            <p className="eyebrow mb-3 text-xs uppercase tracking-[0.3em] text-gold">Diáspora bonaventuriana</p>
            <h2 className="font-display text-balance text-4xl font-light leading-[1.05] text-paper sm:text-5xl lg:text-6xl">
              {exterior.titulo} <em className="alumni-text not-italic">desde Cali</em>
            </h2>
            <p className="mt-5 max-w-xl text-balance text-paper-dim">{exterior.texto}</p>
          </motion.div>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-3">
            {[
              { n: exterior.egresados.length, l: "Egresados" },
              { n: paisesExterior.length, l: "Países" },
              { n: ciudadesExterior, l: "Ciudades" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <dd className="font-display alumni-text text-3xl font-semibold">{s.n}</dd>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-paper-dim">{s.l}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {paisesExterior.map((p) => {
              const activo = punto?.pais === p.pais;
              return (
                <button
                  key={p.pais}
                  type="button"
                  onClick={() => elegirPais(p.pais)}
                  aria-pressed={activo}
                  data-cursor-hover
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                    activo
                      ? "border-gold bg-gold text-ink"
                      : "border-white/15 bg-white/[0.04] text-paper hover:border-gold/60"
                  }`}
                >
                  <span className={`text-[10px] font-semibold ${activo ? "text-ink/70" : "text-paper-dim"}`}>
                    {ISO2[p.pais] ?? ""}
                  </span>
                  {p.pais}
                  <span className={`text-xs ${activo ? "text-ink/70" : "text-paper-dim"}`}>{p.total}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 hidden lg:block">
            <Panel punto={punto} onCerrar={() => setSeleccion(null)} />
          </div>
        </div>

        <div className="relative">
          <div className="relative mx-auto aspect-square w-full max-w-[44rem]">
            {sinWebGL ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-full border border-white/10 bg-white/[0.03] p-10 text-center">
                <p className="text-paper-dim">Tu navegador no puede mostrar el globo 3D.</p>
                <button
                  type="button"
                  onClick={() => setMapaPlano(true)}
                  className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-ink"
                >
                  Ver mapa plano
                </button>
              </div>
            ) : (
              montar && (
                <Suspense fallback={null}>
                  <Globo3D
                    puntos={puntosExterior}
                    seleccion={seleccion}
                    onSeleccion={setSeleccion}
                    onSinWebGL={() => setSinWebGL(true)}
                    className="h-full w-full"
                  />
                </Suspense>
              )
            )}
          </div>
          {/* leyenda */}
          <div className="mx-auto -mt-2 flex w-fit flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full border border-white/10 bg-ink/60 px-5 py-2.5 text-sm text-paper backdrop-blur-md">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff8a1f] shadow-[0_0_10px_#ff8a1f]" /> Cali
            </span>
            {(Object.keys(CATEGORIAS) as Categoria[]).map((k) => (
              <span key={k} className="inline-flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: CATEGORIAS[k].color, boxShadow: `0 0 10px ${CATEGORIAS[k].color}` }}
                />
                {CATEGORIAS[k].nombre} <span className="text-paper-dim">{conteo[k]}</span>
              </span>
            ))}
          </div>
          <div className="mt-6 lg:hidden">
            <Panel punto={punto} onCerrar={() => setSeleccion(null)} />
          </div>
        </div>
      </div>

      {/* franja de países */}
      <div className="mundo-franja relative overflow-hidden bg-gradient-to-r from-alumni via-[#ff8a1f] to-alumni py-3 text-ink">
        <div className="mundo-franja-pista flex w-max gap-10 whitespace-nowrap">
          {franja.map((p, i) => (
            <button
              key={`${p.pais}-${i}`}
              type="button"
              tabIndex={i < paisesExterior.length ? 0 : -1}
              onClick={() => {
                elegirPais(p.pais);
                ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-2 font-display text-lg font-semibold"
            >
              <span className="text-xs font-bold opacity-70">{ISO2[p.pais] ?? ""}</span>
              {p.pais}
              <span className="ml-6 h-1.5 w-1.5 rounded-full bg-ink/40" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      {mapaPlano && (
        <Suspense fallback={null}>
          <MapaMundi abierto={mapaPlano} onCerrar={() => setMapaPlano(false)} />
        </Suspense>
      )}
    </section>
  );
}
