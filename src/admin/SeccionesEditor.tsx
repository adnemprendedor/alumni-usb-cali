import { useState } from "react";
import type { GithubConfig } from "./github";
import type { SitioConfig } from "../data/sitio";
import { Card, ErrorBox, Loading, MoveButtons, Notice, PageHeader, SaveBar, Toggle, moveItem, useRepoJson } from "./ui";

const SITIO_PATH = "src/data/sitio.json";

export default function SeccionesEditor({ config }: { config: GithubConfig }) {
  const { data, setData, loading, error, saving, dirty, message, save } = useRepoJson<SitioConfig>(config, SITIO_PATH);
  const [arrastrando, setArrastrando] = useState<number | null>(null);

  if (loading) return <Loading text="Cargando secciones…" />;
  if (error || !data) return <ErrorBox text={error ?? "No se pudo cargar."} />;

  const secciones = data.secciones;
  const mover = (from: number, to: number) => setData({ ...data, secciones: moveItem(secciones, from, to) });

  return (
    <>
      <PageHeader
        title="Secciones de la página de inicio"
        description="Arrastra las secciones para cambiar el orden en que aparecen, o usa las flechas. Apaga el interruptor para ocultar una sección sin borrarla."
      />
      <Notice>
        El menú de arriba y el pie de página tienen enlaces a algunas secciones. Si ocultas una sección, revisa también el
        menú en <strong>Menú, pie y redes</strong>.
      </Notice>

      <Card title="Orden de las secciones" description="De arriba hacia abajo, tal como se verán en la página.">
        <ol className="space-y-2">
          {secciones.map((s, i) => (
            <li
              key={s.id}
              draggable
              onDragStart={() => setArrastrando(i)}
              onDragOver={(e) => {
                e.preventDefault();
                if (arrastrando !== null && arrastrando !== i) {
                  mover(arrastrando, i);
                  setArrastrando(i);
                }
              }}
              onDragEnd={() => setArrastrando(null)}
              className={`flex cursor-grab items-center gap-3 rounded border px-3 py-2.5 transition-colors active:cursor-grabbing ${
                arrastrando === i ? "border-[#ef7d00] bg-[#fff4e8]" : "border-[#dcdcde] bg-white hover:bg-[#f6f7f7]"
              } ${s.visible ? "" : "opacity-60"}`}
            >
              <span className="select-none text-lg leading-none text-[#8c8f94]" aria-hidden>
                ⋮⋮
              </span>
              <span className="w-6 text-right text-xs text-[#646970]">{i + 1}.</span>
              <span className="flex-1 text-sm font-medium text-[#1d2327]">
                {s.nombre}
                {!s.visible && <span className="ml-2 rounded bg-[#f0f0f1] px-1.5 py-0.5 text-[11px] text-[#646970]">Oculta</span>}
              </span>
              <MoveButtons index={i} length={secciones.length} onMove={mover} />
              <Toggle
                checked={s.visible}
                label={s.visible ? "Visible" : "Oculta"}
                onChange={(v) =>
                  setData({ ...data, secciones: secciones.map((x, j) => (j === i ? { ...x, visible: v } : x)) })
                }
              />
            </li>
          ))}
        </ol>
      </Card>

      <SaveBar dirty={dirty} saving={saving} message={message} onSave={() => save("Panel admin: orden y visibilidad de secciones")} />
    </>
  );
}
