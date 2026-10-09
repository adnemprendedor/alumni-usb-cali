import { useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { egresados } from "../data/egresados";
import { fotos } from "../data/fotos";
import { logos } from "../data/logos";
import { sectorPorSlug } from "../data/derived";
import { hueSeed } from "../lib/color";
import { whatsappLink } from "../lib/whatsapp";
import Portrait from "../components/Portrait";
import Footer from "../components/Footer";

export default function ProfilePage() {
  const { slug } = useParams();
  const persona = egresados.find((e) => e.slug === slug);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const heroRadius = useTransform(scrollYProgress, [0, 1], [0, 36]);
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "4%"]);
  const overlayFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  if (!persona) return <Navigate to="/" replace />;

  const sector = sectorPorSlug[persona.slug];
  const wa = whatsappLink(persona.telefonoNegocio);

  const campos = [
    { label: "Categoría / Sector", valor: sector },
    { label: "Enfoque del emprendimiento", valor: persona.enfoque },
    { label: "Tipo de emprendimiento", valor: persona.tipo },
    { label: "Asociado a", valor: persona.emprendimientoAsociadoA },
    { label: "País de residencia", valor: persona.paisResidencia },
    { label: "Programa académico", valor: persona.programa },
    { label: "Facultad", valor: persona.facultad },
  ].filter((c) => c.valor);

  const hue = hueSeed(persona.id);
  const foto = fotos[persona.slug];
  const logo = logos[persona.slug];

  return (
    <div className="bg-ink">
      {/* immersive hero */}
      <div ref={heroRef} className="relative h-[130vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{ scale: heroScale, y: heroY, borderRadius: heroRadius }}
          >
            {foto ? (
              <div className="relative h-full w-full">
                <img src={foto} alt={persona.nombre} className="h-full w-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              </div>
            ) : (
              <Portrait hue={hue} sector={sector} className="h-full w-full" />
            )}
          </motion.div>

          <motion.div style={{ opacity: overlayFade }} className="absolute inset-0 flex flex-col justify-end p-6 sm:p-14">
            <Link
              to="/"
              data-cursor-hover
              className="absolute left-6 top-28 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-paper/80 hover:text-gold sm:left-14 sm:top-32"
            >
              ← Volver al directorio
            </Link>

            {logo && (
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-paper p-2.5 sm:h-20 sm:w-20"
              >
                <img
                  src={logo}
                  alt={`Logo de ${persona.nombreEmprendimiento}`}
                  className="h-full w-full object-contain"
                />
              </motion.span>
            )}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-4 text-xs uppercase tracking-[0.3em] text-gold"
            >
              {persona.enfoque ?? "Egresado emprendedor"}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="font-display max-w-3xl text-balance text-5xl font-light leading-[1.05] text-paper sm:text-7xl"
            >
              {persona.nombreEmprendimiento}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-4 max-w-xl text-balance text-lg text-paper-dim"
            >
              {persona.telefonoNegocio ? `${persona.telefonoNegocio} · ` : ""}
              {persona.nombre}
              {persona.programa ? ` · ${persona.programa}` : ""}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* ficha factual — solo datos verificados del registro de egresados */}
      <section className="relative bg-ink px-4 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7 }}
            className="mb-3 text-xs uppercase tracking-[0.3em] text-gold"
          >
            Ficha del emprendimiento
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="mb-12 flex flex-wrap items-center gap-5"
          >
            {logo && (
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-paper p-3 sm:h-28 sm:w-28">
                <img
                  src={logo}
                  alt={`Logo de ${persona.nombreEmprendimiento}`}
                  className="h-full w-full object-contain"
                />
              </span>
            )}
            <h2 className="font-display text-balance text-3xl font-light text-paper sm:text-4xl">
              {persona.nombreEmprendimiento}
            </h2>
          </motion.div>

          {persona.descripcion && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7 }}
              className="mb-10 max-w-2xl text-lg text-paper-dim"
            >
              {persona.descripcion}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10 flex flex-wrap gap-3"
          >
            {persona.telefonoNegocio && (
              <span className="inline-flex items-center gap-3 rounded-full border border-gold/40 bg-ink-2/50 px-6 py-3 text-sm text-paper">
                <span className="text-gold">✆</span>
                {persona.telefonoNegocio}
              </span>
            )}
            {persona.correo && (
              <a
                href={`mailto:${persona.correo}`}
                data-cursor-hover
                className="group inline-flex items-center gap-3 rounded-full border border-gold/40 bg-ink-2/50 px-6 py-3 text-sm text-paper transition-colors hover:border-gold hover:bg-gold hover:text-ink"
              >
                <span className="text-gold transition-colors group-hover:text-ink">✉</span>
                {persona.correo}
              </a>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                data-cursor-hover
                className="group inline-flex items-center gap-3 rounded-full border border-gold/40 bg-ink-2/50 px-6 py-3 text-sm text-paper transition-colors hover:border-gold hover:bg-gold hover:text-ink"
              >
                <span className="text-gold transition-colors group-hover:text-ink">✆</span>
                WhatsApp
              </a>
            )}
            {persona.sitioWeb && (
              <a
                href={persona.sitioWeb}
                target="_blank"
                rel="noreferrer"
                data-cursor-hover
                className="group inline-flex items-center gap-3 rounded-full border border-gold/40 bg-ink-2/50 px-6 py-3 text-sm text-paper transition-colors hover:border-gold hover:bg-gold hover:text-ink"
              >
                <span className="text-gold transition-colors group-hover:text-ink">⚭</span>
                {persona.sitioWeb.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            )}
            {persona.instagram && (
              <a
                href={`https://instagram.com/${persona.instagram.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                data-cursor-hover
                className="group inline-flex items-center gap-3 rounded-full border border-gold/40 bg-ink-2/50 px-6 py-3 text-sm text-paper transition-colors hover:border-gold hover:bg-gold hover:text-ink"
              >
                <span className="text-gold transition-colors group-hover:text-ink">◎</span>
                {persona.instagram}
              </a>
            )}
          </motion.div>

          <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {campos.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="border-b border-paper/10 pb-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-paper-dim">{c.label}</p>
                <p className="font-display mt-2 text-xl text-paper">{c.valor}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 max-w-xl text-sm text-paper-dim"
          >
            Esta información proviene del registro de egresados de la Universidad de San Buenaventura Cali
            {foto || persona.instagram || persona.sitioWeb || logo
              ? ", y del material oficial \"ADN Emprendedor de Egresados USB\" de Alumni USB Cali (foto, logo del emprendimiento, Instagram, sitio web y teléfono de contacto del negocio)"
              : ""}
            . El correo se publica con autorización de Alumni USB Cali para facilitar el contacto directo entre
            egresados; no se publican otros datos personales (documento, celular personal, cargo o información
            laboral).
          </motion.p>
        </div>
      </section>

      {/* connect */}
      <section className="relative border-t border-paper/10 bg-ink px-4 py-28 sm:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7 }}
            className="mb-4 text-xs uppercase tracking-[0.3em] text-gold"
          >
            Participa
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="font-display text-balance text-3xl font-light text-paper sm:text-5xl"
          >
            ¿Eres tú? Actualiza tus datos o inscríbete en Alumni
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a
              href="#conecta"
              data-cursor-hover
              className="rounded-full bg-gold px-7 py-3 text-sm uppercase tracking-[0.15em] text-ink transition-opacity hover:opacity-90"
            >
              Ir a la sección Conecta
            </a>
            <Link
              to="/"
              data-cursor-hover
              className="rounded-full border border-gold/50 px-7 py-3 text-sm uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              Seguir explorando
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
