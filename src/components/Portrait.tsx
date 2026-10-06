import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/useReducedMotion";

interface PortraitProps {
  hue: number;
  className?: string;
  children?: ReactNode;
  variant?: "portrait" | "wide";
  /** Categoría/sector (ver src/lib/sector.ts) — ajusta el motivo visual. */
  sector?: string | null;
}

export type Motivo = "grid" | "circles" | "chevron" | "waves" | "dots" | "blob";

export const MOTIVO_POR_SECTOR: Record<string, Motivo> = {
  "Tecnología": "grid",
  "Educación": "grid",
  "Salud y bienestar": "circles",
  "Arte y cultura": "blob",
  "Moda y belleza": "dots",
  "Servicios profesionales": "chevron",
  "Comercio": "chevron",
  "Turismo": "waves",
  "Gastronomía": "waves",
};

/**
 * Abstract editorial "photograph" placeholder — a layered gradient + grain +
 * motif composition standing in for real photography, generada por
 * emprendedor (sin IA, sin inventar un logo real para un negocio real). Cada
 * categoría/sector tiene un motivo distinto (líneas, círculos, olas…) para
 * que el directorio se sienta vivo y diferenciado aunque no haya foto real,
 * manteniendo siempre la paleta de marca (ámbar/naranja sobre ink).
 */
export default function Portrait({ hue, className = "", children, variant = "portrait", sector }: PortraitProps) {
  const reducedMotion = usePrefersReducedMotion();

  // Clamp any incoming seed into a narrow warm amber→orange band and use
  // saturation/lightness (not hue) to create variety, so every generated
  // portrait reads as "USB orange" rather than a rainbow of categories.
  const base = 18 + (((hue % 34) + 34) % 34); // 18–52: deep amber → USB orange
  const sat = 55 + (((hue * 7) % 25) + 25) % 25; // 55–80%
  const lift = ((hue * 3) % 10) - 5; // -5..+5 lightness jitter for texture

  const motivo: Motivo = (sector && MOTIVO_POR_SECTOR[sector]) || "blob";
  const stroke = `hsla(${base + 14}, 70%, 70%, 0.35)`;

  const style: CSSProperties = {
    backgroundImage: `
      radial-gradient(120% 90% at 20% 0%, hsla(${base}, ${sat}%, ${55 + lift}%, 0.5) 0%, transparent 55%),
      radial-gradient(100% 80% at 85% 100%, hsla(${base + 10}, ${sat - 10}%, 30%, 0.6) 0%, transparent 60%),
      linear-gradient(160deg, hsla(${base}, 30%, 12%, 1) 0%, hsla(${base}, 25%, 7%, 1) 100%)
    `,
  };

  return (
    <div className={`relative overflow-hidden grain ${className}`} style={style} aria-hidden={!children}>
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 50% ${variant === "portrait" ? "30%" : "50%"}, hsla(${base + 6}, 75%, 65%, 0.22), transparent 60%)`,
        }}
      />

      <Motif motivo={motivo} stroke={stroke} reducedMotion={reducedMotion} seed={hue} />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.13]"
        preserveAspectRatio="none"
        viewBox="0 0 400 500"
      >
        <path
          d={
            variant === "portrait"
              ? "M0 500 C 60 300, 120 250, 200 220 C 280 250, 340 300, 400 500 Z"
              : "M0 500 C 100 350, 300 350, 400 500 Z"
          }
          fill={`hsla(${base + 12}, 55%, 78%, 0.45)`}
        />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
      {children}
    </div>
  );
}

export function Motif({
  motivo,
  stroke,
  reducedMotion,
  seed,
}: {
  motivo: Motivo;
  stroke: string;
  reducedMotion: boolean;
  seed: number;
}) {
  const patId = `motif-${motivo}-${seed}`;

  if (motivo === "grid") {
    return (
      <motion.svg
        className="absolute inset-0 h-full w-full opacity-[0.22]"
        preserveAspectRatio="none"
        animate={reducedMotion ? undefined : { x: [0, 10, 0], y: [0, 6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <pattern id={patId} width="42" height="42" patternUnits="userSpaceOnUse">
            <path d="M 42 0 L 0 0 0 42" fill="none" stroke={stroke} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patId})`} />
      </motion.svg>
    );
  }

  if (motivo === "circles") {
    return (
      <motion.svg
        className="absolute inset-0 h-full w-full opacity-[0.3]"
        viewBox="0 0 400 500"
        preserveAspectRatio="none"
        animate={reducedMotion ? undefined : { scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "60% 40%" }}
      >
        {[60, 110, 160].map((r) => (
          <circle key={r} cx="240" cy="200" r={r} fill="none" stroke={stroke} strokeWidth="1.5" />
        ))}
      </motion.svg>
    );
  }

  if (motivo === "chevron") {
    return (
      <motion.svg
        className="absolute inset-0 h-full w-full opacity-[0.22]"
        preserveAspectRatio="none"
        animate={reducedMotion ? undefined : { x: [-8, 8, -8] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <pattern id={patId} width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
            <path d="M0 24 L 24 0 L 48 24" fill="none" stroke={stroke} strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patId})`} />
      </motion.svg>
    );
  }

  if (motivo === "waves") {
    return (
      <motion.svg
        className="absolute inset-0 h-full w-full opacity-[0.26]"
        viewBox="0 0 400 500"
        preserveAspectRatio="none"
        animate={reducedMotion ? undefined : { y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {[260, 320, 380].map((y, i) => (
          <path
            key={y}
            d={`M0 ${y} C 100 ${y - 40}, 300 ${y + 40}, 400 ${y}`}
            fill="none"
            stroke={stroke}
            strokeWidth={1.4 - i * 0.2}
          />
        ))}
      </motion.svg>
    );
  }

  if (motivo === "dots") {
    const dots = Array.from({ length: 24 }, (_, i) => ({
      x: (i * 53) % 400,
      y: ((i * 97) % 500),
      r: 2 + ((i * 7) % 4),
    }));
    return (
      <motion.svg
        className="absolute inset-0 h-full w-full opacity-[0.3]"
        viewBox="0 0 400 500"
        preserveAspectRatio="none"
        animate={reducedMotion ? undefined : { opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={stroke} />
        ))}
      </motion.svg>
    );
  }

  // blob (por defecto / "Arte y cultura" / "Otros")
  return (
    <motion.svg
      className="absolute inset-0 h-full w-full opacity-[0.22]"
      viewBox="0 0 400 500"
      preserveAspectRatio="none"
      animate={reducedMotion ? undefined : { rotate: [0, 3, 0], scale: [1, 1.03, 1] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "50% 50%" }}
    >
      <path
        d="M40 60 C 120 10, 260 20, 340 90 C 400 150, 380 260, 320 320 C 250 390, 120 420, 60 350 C 10 290, 0 150, 40 60 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
      />
    </motion.svg>
  );
}
