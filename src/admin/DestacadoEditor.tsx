import { useEffect, useMemo, useState } from "react";
import { getFile, type GithubConfig } from "./github";
import type { SitioConfig } from "../data/sitio";
import type { Egresado } from "../data/egresados";
import { Card, ErrorBox, Loading, PageHeader, SaveBar, useRepoJson, vistaPrevia } from "./ui";

const SITIO_PATH = "src/data/sitio.json";
type MediaMap = Record<string, { foto?: string; logo?: string }>;

export default function DestacadoEditor({ config }: { config: GithubConfig }) {
  const { data, setData, loading, error, saving, dirty, message, save } = useRepoJson<SitioConfig>(config, SITIO_PATH);
  const [egresados, setEgresados] = useState<Egresado[]>([]);
  const [media, setMedia] = useState<MediaMap>({});
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    Promise.all([getFile(config, "src/data/egresados.json"), getFile(config, "src/data/media.json")])
      .then(([e, m]) => {
        setEgresados(JSON.parse(e.content));
        setMedia(JSON.parse(m.content));
      })
      .catch(() => {});
  }, [config]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const lista = q
      ? egresados.filter((e) => `${e.nombre} ${e.nombreEmprendimiento}`.toLowerCase().includes(q))
      : egresados.filter((e) => media[e.slug]?.logo || media[e.slug]?.foto);
    return lista.slice(0, 60);
  }, [egresados, media, busqueda]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox text={error ?? "No se pudo cargar."} />;

  const d = data.destacadoSemana ?? { modo: "auto", slug: null };
  const elegido = egresados.find((e) => e.slug === d.slug);
  const set = (next: Partial<SitioConfig["destacadoSemana"]>) => setData({ ...data, destacadoSemana: { ...d, ...next } });

  return (
    <>
      <PageHeader
        title="Emprendedor de la semana"
        description="Elige si el sitio rota solo cada semana o si quieres mostrar a un emprendedor en particular."
      />

      <Card title="¿Cómo se elige?">
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="radio" checked={d.modo === "auto"} onChange={() => set({ modo: "auto" })} className="mt-1 accent-[#ef7d00]" />
            <span>
              <span className="block text-sm font-medium text-[#1d2327]">Automático</span>
              <span className="block text-xs text-[#646970]">Cambia solo cada semana, entre los emprendimientos que tienen logo o foto y descripción.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="radio" checked={d.modo === "manual"} onChange={() => set({ modo: "manual" })} className="mt-1 accent-[#ef7d00]" />
            <span>
              <span className="block text-sm font-medium text-[#1d2327]">Elegido a mano</span>
              <span className="block text-xs text-[#646970]">Se queda fijo el emprendedor que elijas, hasta que lo cambies.</span>
            </span>
          </label>
        </div>
      </Card>

      {d.modo === "manual" && (
        <Card
          title="Elige al emprendedor"
          description={elegido ? `Elegido: ${elegido.nombreEmprendimiento} — ${elegido.nombre}` : "Todavía no has elegido a nadie."}
        >
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Busca por nombre o emprendimiento… (sin buscar se muestran los que tienen logo o foto)"
            className="mb-4 w-full rounded border border-[#8c8f94] px-3 py-2 text-sm text-[#1d2327] focus:border-[#ef7d00] focus:outline-none"
          />
          <div className="grid max-h-[55vh] gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((e) => {
              const img = vistaPrevia(config, media[e.slug]?.logo ?? media[e.slug]?.foto);
              const activo = e.slug === d.slug;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => set({ slug: e.slug })}
                  className={`flex items-center gap-3 rounded border p-2 text-left transition-colors ${
                    activo ? "border-[#ef7d00] bg-[#fff4e8] ring-1 ring-[#ef7d00]" : "border-[#dcdcde] hover:bg-[#f6f7f7]"
                  }`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-[#f0f0f1]">
                    {img ? <img src={img} alt="" className="h-full w-full object-contain" /> : <span className="text-lg text-[#8c8f94]">{e.nombreEmprendimiento.charAt(0)}</span>}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[#1d2327]">{e.nombreEmprendimiento}</span>
                    <span className="block truncate text-xs text-[#646970]">{e.nombre}</span>
                  </span>
                  {activo && <span className="ml-auto text-[#ef7d00]">★</span>}
                </button>
              );
            })}
            {filtrados.length === 0 && <p className="text-sm text-[#646970]">No hay resultados.</p>}
          </div>
        </Card>
      )}

      <SaveBar
        dirty={dirty}
        saving={saving}
        message={message}
        onSave={() => {
          if (d.modo === "manual" && !d.slug) return;
          save("Panel admin: emprendedor de la semana");
        }}
      />
    </>
  );
}
