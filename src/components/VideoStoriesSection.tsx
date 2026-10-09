import { useEffect } from "react";
import { motion } from "framer-motion";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

/** Carga el script oficial de embeds de Instagram una sola vez y le pide
 * procesar los <blockquote class="instagram-media"> de la página cada vez
 * que cambian — es la forma soportada de incrustar reels públicos. */
function useInstagramEmbed() {
  useEffect(() => {
    const existing = document.getElementById("instagram-embed-script") as HTMLScriptElement | null;
    const process = () => window.instgrm?.Embeds.process();
    if (existing) {
      process();
      return;
    }
    const script = document.createElement("script");
    script.id = "instagram-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = process;
    document.body.appendChild(script);
  }, []);
}

/**
 * Historias en video: un apartado dentro de "Egresados que Inspiran" para
 * mostrar en el sitio los videos que ya existen en el Instagram de Alumni
 * USB Cali (@alumniusbcali). Primero el video principal (subido
 * directamente), luego el de la última feria de emprendimiento, y por
 * último una vitrina de historias individuales por egresado.
 */

const FERIA_REEL = "https://www.instagram.com/reel/DZVR56WR86H/";

const HISTORIAS: { titulo: string; subtitulo: string; reel: string }[] = [
  {
    titulo: "Francisco Ceballos",
    subtitulo: "Workfix Consulting",
    reel: "https://www.instagram.com/reel/DXraig7D91J/",
  },
  {
    titulo: "Historia de un egresado",
    subtitulo: "Alumni USB Cali",
    reel: "https://www.instagram.com/reel/DMdYPtQAdRh/",
  },
  {
    titulo: "Historia de un egresado",
    subtitulo: "Alumni USB Cali",
    reel: "https://www.instagram.com/reel/Cy4TOf2skPO/",
  },
  {
    titulo: "Historia de un egresado",
    subtitulo: "Alumni USB Cali",
    reel: "https://www.instagram.com/reel/CyBmo8OgGP4/",
  },
];

function ReelEmbed({ url }: { url: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-paper/10 bg-ink-2">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ width: "100%", margin: 0, background: "#1d1d1b" }}
      >
        <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 text-sm text-gold">
          Ver en Instagram →
        </a>
      </blockquote>
    </div>
  );
}

export default function VideoStoriesSection() {
  useInstagramEmbed();

  return (
    <section className="relative border-t border-paper/10 bg-ink px-4 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
          className="mb-14"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Egresados que Inspiran</p>
          <h2 className="font-display text-balance text-4xl font-light text-paper sm:text-5xl lg:text-6xl">
            Historias en video
          </h2>
          <p className="mt-4 max-w-xl text-sm text-paper-dim">
            Conoce de primera mano a los egresados que están emprendiendo — los mismos videos que compartimos en{" "}
            <a
              href="https://www.instagram.com/alumniusbcali/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              @alumniusbcali
            </a>
            .
          </p>
        </motion.div>

        {/* video principal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="mb-10 overflow-hidden rounded-3xl border border-gold/30 bg-ink-2/60"
        >
          <video
            src={`${import.meta.env.BASE_URL}videos/historia-destacada.mp4`}
            controls
            playsInline
            preload="metadata"
            className="h-auto max-h-[70vh] w-full bg-black"
          />
        </motion.div>

        {/* feria de emprendimiento */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.08 }}
          className="mb-14"
        >
          <h3 className="font-display mb-4 text-2xl font-light text-paper">Última feria de emprendimiento</h3>
          <div className="mx-auto max-w-sm">
            <ReelEmbed url={FERIA_REEL} title="Última feria de emprendimiento" />
          </div>
        </motion.div>

        {/* historias individuales */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.12 }}
        >
          <h3 className="font-display mb-6 text-2xl font-light text-paper">Historias individuales</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HISTORIAS.map((h, i) => (
              <motion.div
                key={h.reel}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
              >
                <ReelEmbed url={h.reel} title={`${h.titulo} — ${h.subtitulo}`} />
                <p className="mt-3 text-sm text-paper">{h.titulo}</p>
                <p className="text-xs uppercase tracking-[0.15em] text-paper-dim">{h.subtitulo}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
