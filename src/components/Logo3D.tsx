import { useEffect, useMemo, useRef, useState } from "react";
import "./logo3d.css";

/**
 * Logo 3D de ADN Emprendedor con la forma del logo Alumni USB Cali (placa
 * azul marino → rosa, marcapáginas naranja y pastilla). Extrusión por capas en
 * CSS 3D, sin librerías: balanceo, inclinación con el mouse o el giroscopio,
 * brillo que sigue la luz, sombra proyectada, entrada que se "despliega",
 * letras en onda y salto al hacer clic. Se pausa fuera de pantalla y queda
 * estático con "reducir movimiento". Versión independiente: /logo-3d/.
 */

const WORD1 = "ADN";
const WORD2 = "Emprendedor";
const PILL = "ALUMNI · USB CALI";
const MAX_MOUSE = 32;
const MAX_GYRO = 15;

type Rgb = [number, number, number];
const mix = (a: Rgb, b: Rgb, t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",");

function Letters({ text, start }: { text: string; start: number }) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <span key={i} className="l3d-c" style={{ ["--k" as string]: start + i }}>
          {ch}
        </span>
      ))}
    </>
  );
}

interface GroupProps {
  cls: string;
  z: number;
  n: number;
  delay: number;
  layerStyle?: (t: number, top: boolean) => Record<string, string>;
  render: (top: boolean) => React.ReactNode;
}

function Group({ cls, z, n, delay, layerStyle, render }: GroupProps) {
  const layers = [];
  for (let L = n; L >= 0; L--) {
    const top = L === 0;
    const t = L / n;
    layers.push(
      <div
        key={L}
        className={`l3d-layer${top ? " l3d-top" : ""}`}
        aria-hidden={top ? undefined : true}
        style={{ ["--i" as string]: L, ["--t" as string]: t.toFixed(3), ["--d" as string]: `${delay}ms`, ...(layerStyle?.(t, top) ?? {}) }}
      >
        {render(top)}
      </div>
    );
  }
  return (
    <div className={`l3d-grp ${cls}`} style={{ ["--z" as string]: `${z}px` }}>
      {layers}
    </div>
  );
}

export default function Logo3D({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLDivElement>(null);
  const [folded, setFolded] = useState(true);
  const [boom, setBoom] = useState(false);
  const [paused, setPaused] = useState(false);
  const [needsGyroPermission, setNeedsGyroPermission] = useState(false);

  // menos capas en pantallas pequeñas
  const small = useMemo(() => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches, []);
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const N_TXT = small ? 10 : 16;
  const N_CARD = small ? 7 : 11;
  const N_RIB = small ? 6 : 9;
  const N_PILL = small ? 5 : 7;

  // inclinación: mouse / giroscopio
  const tilt = (x: number, y: number, maxDeg: number) => {
    const s = sceneRef.current;
    if (!s) return;
    s.style.setProperty("--ry", `${(x * maxDeg).toFixed(2)}deg`);
    s.style.setProperty("--rx", `${(-y * maxDeg).toFixed(2)}deg`);
    s.style.setProperty("--sx", `${(50 + x * 100).toFixed(1)}%`);
    s.style.setProperty("--sy", `${(40 + y * 100).toFixed(1)}%`);
    s.style.setProperty("--shx", `${(-x * 70).toFixed(1)}px`);
    s.style.setProperty("--shy", `${(-y * 26).toFixed(1)}px`);
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;

    // brillo especular: cada letra frontal recorta su parte de un mismo degradado
    const frontTxt = stage.querySelector<HTMLElement>(".l3d-letters .l3d-top .l3d-txt");
    const mapGradient = () => {
      if (!frontTxt) return;
      frontTxt.style.setProperty("--lw", `${frontTxt.offsetWidth}px`);
      frontTxt.style.setProperty("--lh", `${frontTxt.offsetHeight}px`);
      frontTxt.querySelectorAll<HTMLElement>(".l3d-c").forEach((el) => {
        let x = 0;
        let y = 0;
        let n: HTMLElement | null = el;
        while (n && n !== frontTxt) {
          x += n.offsetLeft;
          y += n.offsetTop;
          n = n.offsetParent as HTMLElement | null;
        }
        el.style.setProperty("--ox", `${x}px`);
        el.style.setProperty("--oy", `${y}px`);
      });
    };
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    let raf = 0;
    fontsReady.then(() => {
      mapGradient();
      // entrada: las capas se despliegan a su profundidad
      raf = requestAnimationFrame(() => requestAnimationFrame(() => setFolded(false)));
    });
    window.addEventListener("resize", mapGradient);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = wrap.getBoundingClientRect();
      tilt((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5, MAX_MOUSE);
    };
    const onLeave = () => {
      tilt(0, 0, 0);
      sceneRef.current?.style.removeProperty("--sx");
      sceneRef.current?.style.removeProperty("--sy");
    };
    if (!reduce) {
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
    }

    // giroscopio (solo https); sin él queda el balanceo automático
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      const gx = Math.max(-MAX_GYRO, Math.min(MAX_GYRO, e.gamma));
      const gy = Math.max(-MAX_GYRO, Math.min(MAX_GYRO, e.beta - 45));
      tilt(gx / (MAX_GYRO * 2), gy / (MAX_GYRO * 2), MAX_GYRO * 2);
    };
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let listening = false;
    if (!reduce && coarse && "DeviceOrientationEvent" in window) {
      const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      if (typeof DOE.requestPermission === "function") setNeedsGyroPermission(true);
      else {
        window.addEventListener("deviceorientation", onOrient);
        listening = true;
      }
    }
    (wrap as HTMLDivElement & { __onOrient?: typeof onOrient }).__onOrient = onOrient;

    // pausar cuando no se ve
    const io = "IntersectionObserver" in window ? new IntersectionObserver(([en]) => setPaused(!en.isIntersecting), { threshold: 0.01 }) : null;
    io?.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", mapGradient);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      if (listening) window.removeEventListener("deviceorientation", onOrient);
      io?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const jump = () => {
    if (reduce) return;
    setBoom(false);
    requestAnimationFrame(() => {
      setBoom(true);
      window.setTimeout(() => setBoom(false), 1300);
    });
  };

  const askGyro = () => {
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    const wrap = wrapRef.current as (HTMLDivElement & { __onOrient?: (e: DeviceOrientationEvent) => void }) | null;
    DOE.requestPermission?.()
      .then((state) => {
        if (state === "granted" && wrap?.__onOrient) window.addEventListener("deviceorientation", wrap.__onOrient);
      })
      .finally(() => setNeedsGyroPermission(false));
  };

  return (
    <div className={className}>
      <div
        ref={wrapRef}
        className={`l3d${paused ? " l3d-paused" : ""}`}
        tabIndex={0}
        data-cursor-hover
        onClick={jump}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            jump();
          }
        }}
      >
        <div ref={sceneRef} className="l3d-scene" role="img" aria-label="ADN Emprendedor · Alumni USB Cali">
          <div className="l3d-sway">
            <div ref={stageRef} className={`l3d-stage${folded && !reduce ? " l3d-folded" : ""}`}>
              <div className="l3d-shadow" aria-hidden />
              <div className="l3d-blobs" aria-hidden>
                <i className="b1" />
                <i className="b2" />
                <i className="b3" />
              </div>
              <Group
                cls="l3d-slab"
                z={0}
                n={N_CARD}
                delay={0}
                render={(top) => <div className="l3d-card">{top && <div className="l3d-sheen" />}</div>}
              />
              <Group
                cls="l3d-rib"
                z={8}
                n={N_RIB}
                delay={120}
                layerStyle={(t) => ({ ["--rc" as string]: mix([236, 104, 6], [128, 46, 0], t) })}
                render={() => <div className="l3d-ribbon" />}
              />
              <Group
                cls="l3d-pil"
                z={14}
                n={N_PILL}
                delay={200}
                layerStyle={(t) => ({ ["--rc" as string]: mix([228, 98, 4], [120, 44, 0], t) })}
                render={(top) => <div className="l3d-pill">{top && <span className="l3d-pill-txt">{PILL}</span>}</div>}
              />
              <div ref={lettersRef} className={`l3d-grp-wrap${boom ? " l3d-boom" : ""}`} style={{ transformStyle: "preserve-3d", position: "absolute", inset: 0 }}>
                <Group
                  cls="l3d-letters"
                  z={N_TXT * 2.2 + 4}
                  n={N_TXT}
                  delay={260}
                  layerStyle={(t, top): Record<string, string> => (top ? {} : { color: `rgb(${mix([214, 178, 206], [36, 30, 72], t)})` })}
                  render={() => (
                    <div className="l3d-txt">
                      <span className="l3d-word l3d-w1">
                        <Letters text={WORD1} start={0} />
                      </span>
                      <span className="l3d-word l3d-w2">
                        <Letters text={WORD2} start={WORD1.length} />
                      </span>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {needsGyroPermission && (
        <button
          type="button"
          onClick={askGyro}
          className="mx-auto mt-2 block rounded-full border border-gold/50 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-gold-soft"
        >
          Activar movimiento del celular
        </button>
      )}
    </div>
  );
}
