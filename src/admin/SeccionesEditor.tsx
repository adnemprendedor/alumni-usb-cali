import { useState } from "react";
import type { GithubConfig } from "./github";
import type { PaginaId, SeccionConfig, SitioConfig } from "../data/sitio";
import { Card, ErrorBox, Loading, MoveButtons, Notice, PageHeader, SaveBar, Toggle, moveItem, useRepoJson } from "./ui";

const SITIO_PATH = "src/data/sitio.json";

const PAGINAS: { id: PaginaId; titulo: string; descripcion: string }[] = [
  { id: "inicio", titulo: "Inicio · Red Alumni", descripcion: "La página principal de la Red de Graduados." },
  { id: "adn", titulo: "Línea ADN Emprendedor", descripcion: "Página /adn-emprendedor: directorio de emprendimientos." },
  { id: "mundo", titulo: "Línea Egresados por el mundo", descripcion: "Página /egresados-por-el-mundo: globo 3D." },
  { id: "inspiran", titulo: "Línea Egresados que inspiran", descripcion: "Página /egresados-que-inspiran: historias y videos." },
];

const paginaDe = (s: SeccionConfig): PaginaId => s.pagina ?? "inicio";

export default function SeccionesEditor({ config }: { config: GithubConfig }) {
  const { data, setData, loading, error, saving, dirty, message, save } = useRepoJson<SitioConfig>(config, SITIO_PATH);
  const [arrastrando, setArrastrando] = useState<{ pagina: PaginaId; i: number } | null>(null);

  if (loading) return <Loading text="Cargando secciones…" />;
  if (error || !data) return <ErrorBox text={error ?? "No se pudo cargar."} />;

  const grupo = (p: PaginaId) => data.secciones.filter((s) => paginaDe(s) === p);
  /** Reemplaza las secciones de una página manteniendo las demás. */
  const conGrupo = (p: PaginaId, nuevas: SeccionConfig[]) => ({
    ...data,
    secciones: PAGINAS.flatMap((pg) => (pg.id === p ? nuevas : grupo(pg.id))),
  });
  const mover = (p: PaginaId, from: number, to: number) => setData(conGrupo(p, moveItem(grupo(p), from, to)));

  return (
    <>
      <PageHeader
        title="Secciones de cada página"
        description="El sitio tiene una página principal (la Red Alumni) y una página por cada línea. Arrastra las secciones para cambiar el orden, o usa las flechas. Apaga el interruptor para ocultar una sección sin borrarla."
      />
      <Notice>
        El menú de arriba y el pie de página tienen enlaces a algunas secciones. Si ocultas una sección, revisa también el
        menú en <strong>Menú, pie y redes</strong>.
      </Notice>

      {PAGINAS.map((pg) => {
        const lista = grupo(pg.id);
        if (!lista.length) return null;
        return (
          <Card key={pg.id} title={pg.titulo} description={pg.descripcion}>
            <ol className="space-y-2">
              {lista.map((s, i) => (
                <li
                  key={s.id}
                  draggable
                  onDragStart={() => setArrastrando({ pagina: pg.id, i })}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (arrastrando && arrastrando.pagina === pg.id && arrastrando.i !== i) {
                      mover(pg.id, arrastrando.i, i);
                      setArrastrando({ pagina: pg.id, i });
                    }
                  }}
                  onDragEnd={() => setArrastrando(null)}
                  className={`flex cursor-grab items-center gap-3 rounded border px-3 py-2.5 transition-colors active:cursor-grabbing ${
                    arrastrando?.pagina === pg.id && arrastrando.i === i
                      ? "border-[#ef7d00] bg-[#fff4e8]"
                      : "border-[#dcdcde] bg-white hover:bg-[#f6f7f7]"
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
                  <MoveButtons index={i} length={lista.length} onMove={(f, t) => mover(pg.id, f, t)} />
                  <Toggle
                    checked={s.visible}
                    label={s.visible ? "Visible" : "Oculta"}
                    onChange={(v) => setData(conGrupo(pg.id, lista.map((x, j) => (j === i ? { ...x, visible: v } : x))))}
                  />
                </li>
              ))}
            </ol>
          </Card>
        );
      })}

      <SaveBar dirty={dirty} saving={saving} message={message} onSave={() => save("Panel admin: orden y visibilidad de secciones")} />
    </>
  );
}
