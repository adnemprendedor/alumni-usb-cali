import { type CSSProperties, type ReactNode } from "react";

interface PortraitProps {
  hue: number;
  className?: string;
  children?: ReactNode;
  variant?: "portrait" | "wide";
}

/**
 * Abstract editorial "photograph" placeholder — a layered gradient + grain
 * composition standing in for real photography, generated per-entrepreneur
 * from a seed so every profile reads as visually distinct while staying
 * inside the USB Cali brand palette (warm orange/amber over near-black —
 * no off-brand hues like blue, green or purple).
 */
export default function Portrait({ hue, className = "", children, variant = "portrait" }: PortraitProps) {
  // Clamp any incoming seed into a narrow warm amber→orange band and use
  // saturation/lightness (not hue) to create variety, so every generated
  // portrait reads as "USB orange" rather than a rainbow of categories.
  const base = 18 + (((hue % 34) + 34) % 34); // 18–52: deep amber → USB orange
  const sat = 55 + (((hue * 7) % 25) + 25) % 25; // 55–80%
  const lift = ((hue * 3) % 10) - 5; // -5..+5 lightness jitter for texture

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
