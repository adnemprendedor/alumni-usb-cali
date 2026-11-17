/**
 * Página principal de la Red de Graduados Alumni USB Cali.
 *
 * Concepto: "Una red, miles de historias, un mismo origen."
 * ADN Emprendedor, Egresados por el mundo y Egresados que inspiran no son
 * proyectos aislados: son líneas de visibilización de la Red. Todos los
 * textos, enlaces, oportunidades y novedades se editan desde el panel
 * (/admin → Red Alumni), en src/data/sitio.json → red.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { esExterno, rutaPublica, sitio, type Novedad } from "../data/sitio";
import { juego } from "../data/juego";
import { exterior, paisesExterior } from "../data/exterior";
import { stats } from "../data/derived";
import { usePrefersReducedMotion } from "../hooks/useReducedMotion";
import { ReelEmbed, useInstagramEmbed } from "./VideoStoriesSection";
import alumniLogo from "../assets/brand/alumni-logo.png";

const red = sitio.red;

/** Atributos de un enlace: los externos abren en otra pestaña. */
function enlace(href: string) {
  return esExterno(href) && !href.startsWith("mailto:") && !href.startsWith("tel:")
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };
}

function Encabezado({ eyebrow, titulo, subtitulo, centro }: { eyebrow: string; titulo: string; subtitulo?: string; centro?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8 }}
      className={`mb-12 lg:mb-16 ${centro ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}
    >
      <p className={`eyebrow mb-3 text-xs uppercase tracking-[0.3em] text-gold ${centro ? "justify-center" : ""}`}>{eyebrow}</p>
      <h2 className="font-display text-balance text-4xl font-light leading-[1.05] text-paper sm:text-5xl lg:text-6xl">{titulo}</h2>
      {subtitulo && <p className={`mt-4 text-balance text-paper-dim ${centro ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>{subtitulo}</p>}
    </motion.div>
  );
}

const Flecha = () => <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>;

/* ─────────────────────────── 2. Banner principal ─────────────────────────── */

export function RedHero() {
  const reduce = usePrefersReducedMotion();
  const c = red.concepto;
  const banner = rutaPublica(c.banner);
  // mosaico con fotos reales de graduados (si no hay banner)
  const fotos = useMemo(() => juego.map((p) => rutaPublica(p.foto)).filter((f): f is string => !!f), []);
  const columnas = useMemo(() => {
    const cols: string[][] = [[], [], [], [], [], []];
    fotos.forEach((f, i) => cols[i % cols.length].push(f));
    return cols.map((col) => [...col, ...col]);
  }, [fotos]);

  const cifras = [
    { n: stats[0]?.numero ?? 0, l: "emprendimientos en ADN Emprendedor" },
    { n: exterior.egresados.length, l: `graduados en ${paisesExterior.length} países` },
    { n: juego.length, l: "historias en el juego Alumni" },
  ];

  return (
    <section id="inicio" className="relative isolate min-h-[100svh] overflow-hidden bg-ink">
      {/* fondo: banner o mosaico de graduados */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        {banner ? (
          <img src={banner} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="red-mosaico absolute inset-[-10%] flex rotate-[-8deg] gap-3 sm:gap-4">
            {columnas.map((col, i) => (
              <div
                key={i}
                className={`flex w-1/6 min-w-[7rem] flex-col gap-3 sm:gap-4 ${reduce ? "" : i % 2 ? "red-col-baja" : "red-col-sube"}`}
                style={{ animationDuration: `${60 + i * 7}s` }}
              >
                {col.map((f, j) => (
                  <img key={j} src={f} alt="" loading={j < 4 ? "eager" : "lazy"} className="aspect-[4/5] w-full rounded-2xl object-cover" />
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,rgba(18,18,30,0.6),rgba(18,18,30,0.9)_78%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#16162a]/70 via-transparent to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(45%_45%_at_20%_20%,rgba(49,52,103,0.55),transparent_70%),radial-gradient(40%_40%_at_85%_80%,rgba(236,69,95,0.22),transparent_70%)]" />
      </div>

      <div className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-5 pb-20 pt-36 text-center sm:px-8">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 inline-flex h-20 items-center rounded-2xl bg-paper px-5 py-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] sm:h-24"
        >
          <img src={alumniLogo} alt={c.nombre} className="h-full w-auto object-contain" />
        </motion.span>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="eyebrow mb-5 justify-center text-[11px] uppercase tracking-[0.3em] text-gold sm:text-xs"
        >
          {c.nombre}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-balance text-[2.5rem] font-light leading-[1.04] text-paper sm:text-6xl lg:text-7xl"
        >
          {c.lema.split(",").map((parte, i, arr) => (
            <span key={i} className={i === arr.length - 1 ? "alumni-text" : undefined}>
              {parte}
              {i < arr.length - 1 ? "," : ""}{" "}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="mt-6 max-w-2xl text-balance text-lg text-paper sm:text-xl"
        >
          {c.texto}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="mt-4 max-w-2xl text-balance text-sm text-paper-dim sm:text-base"
        >
          {c.bienvenida}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <a
            {...enlace(c.ctaHref)}
            data-cursor-hover
            className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-alumni to-pink px-7 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-white shadow-[0_10px_40px_-10px_rgba(236,69,95,0.7)] transition-transform hover:-translate-y-0.5"
          >
            {c.ctaLabel} <Flecha />
          </a>
          {red.servicios[0] && (
            <a
              {...enlace(red.servicios[0].href)}
              data-cursor-hover
              className="inline-flex items-center gap-2 rounded-full border border-paper/25 bg-paper/5 px-6 py-3.5 text-sm uppercase tracking-[0.12em] text-paper backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-gold-soft"
            >
              {red.servicios[0].titulo}
            </a>
          )}
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-14 grid w-full max-w-3xl grid-cols-3 gap-3 border-t border-paper/10 pt-7"
        >
          {cifras.map((x) => (
            <div key={x.l}>
              <dd className="font-display alumni-text text-3xl font-semibold sm:text-4xl">{x.n}</dd>
              <dt className="mt-1 text-[10px] uppercase leading-snug tracking-[0.14em] text-paper-dim sm:text-[11px]">{x.l}</dt>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}

/* ─────────────────────────── 3. Explora Alumni ─────────────────────────── */

const ICONOS = ["✦", "◎", "▶", "♠", "✚"];

export function LineasSection() {
  const e = red.explora;
  return (
    <section id="explora" className="relative bg-ink px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <Encabezado eyebrow={e.eyebrow} titulo={e.titulo} subtitulo={e.subtitulo} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {red.lineas.map((l, i) => {
            const img = rutaPublica(l.imagen);
            const grande = i < 2;
            const color = l.color || "#f57206";
            return (
              <motion.a
                key={l.titulo}
                {...enlace(l.href)}
                data-cursor-hover
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative flex min-h-[19rem] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 p-7 transition-colors hover:border-white/30 ${
                  grande ? "lg:col-span-3 lg:min-h-[22rem]" : "lg:col-span-2"
                }`}
                style={{
                  background: `radial-gradient(90% 80% at 100% 0%, ${color}38, transparent 60%), linear-gradient(160deg, #1b1b26, #141420)`,
                }}
              >
                {img && (
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full object-cover opacity-70 shadow-[0_0_80px_rgba(111,141,255,0.45)] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6"
                  />
                )}
                <div className="relative">
                  <span
                    className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl text-white"
                    style={{ background: color, boxShadow: `0 10px 30px -8px ${color}` }}
                    aria-hidden
                  >
                    {ICONOS[i % ICONOS.length]}
                  </span>
                  <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-paper-dim">Línea {String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-display text-3xl leading-tight text-paper sm:text-[2rem]">{l.titulo}</h3>
                  <p className="mt-3 max-w-md text-sm text-paper-dim">{l.texto}</p>
                </div>
                <span className="relative mt-8 inline-flex items-center gap-2 text-sm font-medium" style={{ color }}>
                  {l.cta} <Flecha />
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── 4. Actualízate y participa ─────────────────────────── */

export function ParticipaSection() {
  const p = red.participa;
  return (
    <section id="participa" className="relative overflow-hidden bg-[#141420] px-4 py-24 sm:px-8 lg:py-32">
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-navy/50 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-pink/15 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-7xl">
        <Encabezado eyebrow={p.eyebrow} titulo={p.titulo} subtitulo={p.subtitulo} />
        <div className="grid gap-4 md:grid-cols-2">
          {red.servicios.map((s, i) => (
            <motion.a
              key={s.titulo}
              {...enlace(s.href)}
              data-cursor-hover
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={`group flex flex-col justify-between gap-6 rounded-3xl p-7 transition-transform hover:-translate-y-1 sm:p-9 ${
                s.destacado
                  ? "bg-gradient-to-br from-alumni via-[#f0583a] to-pink text-white shadow-[0_20px_60px_-25px_rgba(236,69,95,0.8)]"
                  : "border border-white/12 bg-white/[0.04] text-paper hover:border-gold/50"
              }`}
            >
              <div>
                <h3 className="font-display text-2xl leading-tight sm:text-3xl">{s.titulo}</h3>
                <p className={`mt-3 max-w-md text-sm ${s.destacado ? "text-white/85" : "text-paper-dim"}`}>{s.texto}</p>
              </div>
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                  s.destacado ? "bg-white text-ink" : "border border-gold/50 text-gold"
                }`}
              >
                {s.cta} <Flecha />
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── 5. Historias que conectan ─────────────────────────── */

export function HistoriasSection() {
  useInstagramEmbed();
  const h = red.historias;
  const reels = sitio.videos.historias.slice(0, Math.max(1, h.cantidad || 3));
  return (
    <section id="historias" className="relative bg-ink px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Encabezado eyebrow={h.eyebrow} titulo={h.titulo} subtitulo={h.subtitulo} />
          <a
            href="#/egresados-que-inspiran"
            data-cursor-hover
            className="group mb-12 inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-sm text-gold transition-colors hover:bg-gold hover:text-ink lg:mb-16"
          >
            Ver todas las historias <Flecha />
          </a>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reels.map((r, i) => (
            <motion.div
              key={r.reel}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <ReelEmbed url={r.reel} title={r.titulo} />
              <p className="mt-3 font-display text-lg text-paper">{r.titulo}</p>
              <p className="text-xs uppercase tracking-[0.15em] text-paper-dim">{r.subtitulo}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── 6. Oportunidades para ti ─────────────────────────── */

export function OportunidadesSection() {
  const o = red.oportunidades;
  return (
    <section id="oportunidades" className="relative bg-[#141420] px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <Encabezado eyebrow={o.eyebrow} titulo={o.titulo} subtitulo={o.subtitulo} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {o.items.map((x, i) => (
            <motion.a
              key={x.titulo}
              {...enlace(x.href)}
              data-cursor-hover
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
              className="group flex flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 transition-colors hover:border-gold/50"
            >
              {x.etiqueta && (
                <span className="mb-5 w-fit rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold">
                  {x.etiqueta}
                </span>
              )}
              <h3 className="font-display text-2xl leading-tight text-paper">{x.titulo}</h3>
              <p className="mt-3 flex-1 text-sm text-paper-dim">{x.texto}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold">
                {x.cta} <Flecha />
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Novedades Alumni ─────────────────────────── */

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function fechaBonita(f: string) {
  const [a, m, d] = f.split("-");
  if (!m) return a;
  const mes = MESES[Number(m) - 1] ?? m;
  return d ? `${Number(d)} ${mes} ${a}` : `${mes} ${a}`;
}

function TarjetaNovedad({ n, i, principal }: { n: Novedad; i: number; principal?: boolean }) {
  const img = rutaPublica(n.imagen);
  const Comp = n.href ? motion.a : motion.div;
  return (
    <Comp
      {...(n.href ? enlace(n.href) : {})}
      data-cursor-hover={n.href ? true : undefined}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: i * 0.08 }}
      className={`group relative flex overflow-hidden rounded-3xl border border-white/10 bg-ink-2/60 transition-colors hover:border-white/25 ${
        principal ? "flex-col" : "flex-col sm:flex-row"
      }`}
    >
      <div className={`relative shrink-0 overflow-hidden ${principal ? "aspect-[16/10]" : "aspect-[16/7] sm:aspect-auto sm:w-44"}`}>
        {img ? (
          <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(80%_100%_at_0%_0%,#313467,transparent_70%),radial-gradient(70%_90%_at_100%_100%,#ec455f66,transparent_70%),#16162a]" />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-gold backdrop-blur-sm">
          {n.etiqueta || "Novedad"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <time className="text-xs uppercase tracking-[0.15em] text-paper-dim">{fechaBonita(n.fecha)}</time>
        <h3 className={`mt-2 font-display leading-tight text-paper ${principal ? "text-3xl" : "text-xl"}`}>{n.titulo}</h3>
        <p className="mt-2 text-sm text-paper-dim">{n.texto}</p>
        {n.href && (
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-gold">
            Ver más <Flecha />
          </span>
        )}
      </div>
    </Comp>
  );
}

export function NovedadesSection() {
  const nv = red.novedades;
  const items = [...nv.items].sort((a, b) => b.fecha.localeCompare(a.fecha));
  if (!items.length) return null;
  return (
    <section id="novedades" className="relative bg-ink px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <Encabezado eyebrow={nv.eyebrow} titulo={nv.titulo} subtitulo={nv.subtitulo} />
        <div className="grid gap-5 lg:grid-cols-2">
          <TarjetaNovedad n={items[0]} i={0} principal />
          {items.length > 1 && (
            <div className="flex flex-col gap-5">
              {items.slice(1, 4).map((n, i) => (
                <TarjetaNovedad key={`${n.titulo}-${i}`} n={n} i={i + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── 7. Conéctate con la Universidad ─────────────────────────── */

export function ConectaRedSection() {
  const c = red.conecta;
  const [asunto, setAsunto] = useState(c.asuntos[0] ?? "Consulta");
  const [mensaje, setMensaje] = useState("");
  const [nombre, setNombre] = useState("");
  const wa = c.whatsapp?.replace(/\D/g, "");
  const cuerpo = `${mensaje}\n\n— ${nombre || "Graduado(a) USB Cali"}`;
  const mailto = `mailto:${c.correo}?subject=${encodeURIComponent(`${asunto} · Red Alumni USB Cali`)}&body=${encodeURIComponent(cuerpo)}`;

  return (
    <section id="conecta-red" className="relative overflow-hidden bg-[#141420] px-4 py-24 sm:px-8 lg:py-32">
      <div className="pointer-events-none absolute right-0 top-0 h-[30rem] w-[30rem] rounded-full bg-navy/50 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <Encabezado eyebrow={c.eyebrow} titulo={c.titulo} subtitulo={c.subtitulo} />
          <div className="flex flex-col gap-3">
            <a
              {...enlace(c.portalHref)}
              data-cursor-hover
              className="group flex items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/[0.04] p-5 transition-colors hover:border-gold/50"
            >
              <span>
                <span className="block text-[11px] uppercase tracking-[0.18em] text-paper-dim">Universidad de San Buenaventura Cali</span>
                <span className="font-display text-xl text-paper">{c.portalLabel}</span>
              </span>
              <span className="text-gold">
                <Flecha />
              </span>
            </a>
            <a
              href={`mailto:${c.correo}`}
              data-cursor-hover
              className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] p-5 text-paper transition-colors hover:border-gold/50"
            >
              <span className="text-xl text-gold" aria-hidden>
                ✉
              </span>
              <span className="break-all">{c.correo}</span>
            </a>
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-hover
                className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] p-5 text-paper transition-colors hover:border-gold/50"
              >
                <span className="text-xl text-[#25d366]" aria-hidden>
                  ●
                </span>
                Escríbenos por WhatsApp
              </a>
            )}
            {sitio.pie.horario && <p className="mt-2 text-xs uppercase tracking-[0.15em] text-paper-dim">{sitio.pie.horario}</p>}
          </div>
        </div>

        {/* formulario: arma el correo con el asunto elegido (sin servidor) */}
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = mailto;
          }}
          className="self-start rounded-3xl border border-white/10 bg-ink/70 p-6 backdrop-blur-md sm:p-8"
        >
          <p className="mb-5 font-display text-2xl text-paper">Envíanos un mensaje</p>
          <fieldset className="mb-5">
            <legend className="mb-2 text-xs uppercase tracking-[0.15em] text-paper-dim">Quiero enviar</legend>
            <div className="flex flex-wrap gap-2">
              {c.asuntos.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAsunto(a)}
                  aria-pressed={asunto === a}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    asunto === a ? "border-gold bg-gold text-ink" : "border-white/15 text-paper hover:border-gold/60"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-paper-dim">Tu nombre y programa</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-paper placeholder:text-paper-dim/60 focus:border-gold focus:outline-none"
              placeholder="Ej.: Ana Gómez · Psicología 2018"
            />
          </label>
          <label className="mb-6 block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-paper-dim">Mensaje</span>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              required
              rows={5}
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-paper placeholder:text-paper-dim/60 focus:border-gold focus:outline-none"
              placeholder="Cuéntanos tu consulta, propuesta o cómo te gustaría participar."
            />
          </label>
          <button
            type="submit"
            data-cursor-hover
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-alumni to-pink px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white"
          >
            Enviar por correo <Flecha />
          </button>
          <p className="mt-3 text-center text-[11px] text-paper-dim">
            Se abrirá tu correo con el mensaje listo para enviar a {c.correo}.{" "}
            <a {...enlace(red.privacidadHref)} className="underline hover:text-gold">
              {red.privacidadLabel}
            </a>
          </p>
        </motion.form>
      </div>
    </section>
  );
}
