import { useState } from "react";
import type { GithubConfig } from "./github";
import type { SitioConfig } from "../data/sitio";
import { Button, Card, ErrorBox, Field, Loading, MediaPicker, MoveButtons, PageHeader, SaveBar, moveItem, subirArchivo, useRepoJson, vistaPrevia } from "./ui";

const SITIO_PATH = "src/data/sitio.json";
const LIMITE_MB = 40;

export default function VideosEditor({ config }: { config: GithubConfig }) {
  const { data, setData, loading, error, saving, dirty, message, setMessage, save } = useRepoJson<SitioConfig>(config, SITIO_PATH);
  const [subiendo, setSubiendo] = useState(false);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox text={error ?? "No se pudo cargar."} />;

  const v = data.videos;
  const setV = (next: Partial<SitioConfig["videos"]>) => setData({ ...data, videos: { ...v, ...next } });

  async function subirVideo(file: File) {
    if (file.size > LIMITE_MB * 1024 * 1024) {
      setMessage({ ok: false, text: `El video pesa más de ${LIMITE_MB} MB. Compártelo mejor como reel de Instagram.` });
      return;
    }
    setSubiendo(true);
    try {
      const ruta = await subirArchivo(config, file, "videos", `video-principal-${Date.now()}`);
      setV({ videoPrincipal: ruta });
      setMessage({ ok: true, text: "Video subido. Pulsa “Guardar cambios” para publicarlo." });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "No se pudo subir el video." });
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <>
      <PageHeader title="Historias en video" description="El video principal, el reel de la feria y los reels de historias de egresados que salen en la página." />

      <Card title="Encabezado de la sección">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Texto pequeño superior" value={v.eyebrow} onChange={(x) => setV({ eyebrow: x })} />
          <Field label="Título" value={v.titulo} onChange={(x) => setV({ titulo: x })} />
          <div className="sm:col-span-2">
            <Field label="Subtítulo" value={v.subtitulo} multiline onChange={(x) => setV({ subtitulo: x })} />
          </div>
        </div>
      </Card>

      <Card title="Video principal" description={`Un archivo de video (.mp4) de máximo ${LIMITE_MB} MB.`}>
        <MediaPicker
          label="Video"
          accept="video/mp4,video/webm"
          value={v.videoPrincipal}
          previewUrl={vistaPrevia(config, v.videoPrincipal)}
          uploading={subiendo}
          onFile={subirVideo}
          onClear={() => setV({ videoPrincipal: null })}
        />
      </Card>

      <Card title="Reel de la feria de emprendimiento" description="Pega el enlace del reel de Instagram. Déjalo vacío para ocultar este bloque.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título" value={v.feriaTitulo} onChange={(x) => setV({ feriaTitulo: x })} />
          <Field label="Enlace del reel" value={v.feriaReel} placeholder="https://www.instagram.com/reel/…" onChange={(x) => setV({ feriaReel: x || null })} />
        </div>
      </Card>

      <Card
        title="Historias individuales"
        description="Reels de Instagram de egresados."
        right={<Button small onClick={() => setV({ historias: [...v.historias, { titulo: "", subtitulo: "", reel: "" }] })}>+ Agregar historia</Button>}
      >
        <div className="mb-4 max-w-sm">
          <Field label="Título del bloque" value={v.historiasTitulo} onChange={(x) => setV({ historiasTitulo: x })} />
        </div>
        <div className="space-y-2">
          {v.historias.map((h, i) => (
            <div key={i} className="grid items-end gap-2 rounded border border-[#dcdcde] p-2 lg:grid-cols-[1fr_1fr_1.5fr_auto]">
              <Field label="Nombre" value={h.titulo} onChange={(x) => setV({ historias: v.historias.map((y, j) => (j === i ? { ...y, titulo: x } : y)) })} />
              <Field label="Emprendimiento / detalle" value={h.subtitulo} onChange={(x) => setV({ historias: v.historias.map((y, j) => (j === i ? { ...y, subtitulo: x } : y)) })} />
              <Field label="Enlace del reel" value={h.reel} placeholder="https://www.instagram.com/reel/…" onChange={(x) => setV({ historias: v.historias.map((y, j) => (j === i ? { ...y, reel: x } : y)) })} />
              <span className="flex gap-1 pb-1">
                <MoveButtons index={i} length={v.historias.length} onMove={(f, t) => setV({ historias: moveItem(v.historias, f, t) })} />
                <Button small variant="danger" onClick={() => setV({ historias: v.historias.filter((_, j) => j !== i) })}>
                  Quitar
                </Button>
              </span>
            </div>
          ))}
        </div>
      </Card>

      <SaveBar dirty={dirty} saving={saving} message={message} onSave={() => save("Panel admin: historias en video")} />
    </>
  );
}
