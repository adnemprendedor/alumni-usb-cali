import { useEffect, useState } from "react";
import { getFile, putTextFile, type GithubConfig } from "./github";

const CONTENT_PATH = "src/data/content.json";

interface Seccion {
  eyebrow?: string;
  titulo?: string;
  subtitulo?: string;
}

interface Paso {
  numero: string;
  titulo: string;
  texto: string;
}

interface Enlace {
  titulo: string;
  desc: string;
  href: string;
}

interface ContentData {
  hero: {
    eyebrow: string;
    titulo: string;
    subtitulo: string;
    ctaLabel: string;
    scrollLabel: string;
  };
  secciones: Record<string, Seccion>;
  conecta: {
    eyebrow: string;
    titulo: string;
    subtitulo: string;
    pasos: Paso[];
    requisitos: string[];
    actualizar: { titulo: string; desc: string; href: string };
    enlaces: Enlace[];
  };
}

const SECCION_LABELS: Record<string, string> = {
  explora: "Explora la red (introducción)",
  enfoques: "Enfoques de emprendimiento",
  destacados: "ADN Emprendedor (destacados)",
  buscador: "Buscador / directorio completo",
  carreras: "Programas académicos",
  emprendimientos: "Emprendimientos",
};

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-paper-dim">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-paper/15 bg-ink px-3 py-2 text-sm text-paper focus:border-gold/60 focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-paper/15 bg-ink px-3 py-2 text-sm text-paper focus:border-gold/60 focus:outline-none"
        />
      )}
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-paper/10 bg-ink-2/40 p-5">
      <h3 className="font-display mb-4 text-sm uppercase tracking-[0.15em] text-gold">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function ContentEditor({ config }: { config: GithubConfig }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sha, setSha] = useState<string | undefined>();
  const [data, setData] = useState<ContentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const file = await getFile(config, CONTENT_PATH);
        if (cancelled) return;
        setData(JSON.parse(file.content) as ContentData);
        setSha(file.sha);
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "No se pudo cargar el contenido.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [config]);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setMessage(null);
    try {
      const result = await putTextFile(
        config,
        CONTENT_PATH,
        JSON.stringify(data, null, 2),
        "Panel admin: actualizar textos del sitio",
        sha
      );
      setSha(result.sha);
      setMessage({ ok: true, text: "Cambios guardados. El sitio se actualizará solo en 1-2 minutos." });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "No se pudo guardar." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-8 text-paper-dim">Cargando textos del sitio…</p>;
  if (loadError) return <p className="p-8 text-red-400">{loadError}</p>;
  if (!data) return null;

  return (
    <div className="space-y-6 p-6">
      <Card title="Portada principal (Hero)">
        <Field label="Texto pequeño superior" value={data.hero.eyebrow} onChange={(v) => setData({ ...data, hero: { ...data.hero, eyebrow: v } })} />
        <Field label="Título grande" value={data.hero.titulo} onChange={(v) => setData({ ...data, hero: { ...data.hero, titulo: v } })} />
        <Field label="Subtítulo" value={data.hero.subtitulo} multiline onChange={(v) => setData({ ...data, hero: { ...data.hero, subtitulo: v } })} />
        <Field label="Texto del botón" value={data.hero.ctaLabel} onChange={(v) => setData({ ...data, hero: { ...data.hero, ctaLabel: v } })} />
        <Field label="Texto 'desplázate'" value={data.hero.scrollLabel} onChange={(v) => setData({ ...data, hero: { ...data.hero, scrollLabel: v } })} />
      </Card>

      {Object.entries(data.secciones).map(([key, seccion]) => (
        <Card key={key} title={SECCION_LABELS[key] ?? key}>
          {seccion.eyebrow !== undefined && (
            <Field
              label="Texto pequeño superior"
              value={seccion.eyebrow}
              onChange={(v) =>
                setData({ ...data, secciones: { ...data.secciones, [key]: { ...seccion, eyebrow: v } } })
              }
            />
          )}
          {seccion.titulo !== undefined && (
            <Field
              label="Título"
              value={seccion.titulo}
              onChange={(v) =>
                setData({ ...data, secciones: { ...data.secciones, [key]: { ...seccion, titulo: v } } })
              }
            />
          )}
          {seccion.subtitulo !== undefined && (
            <Field
              label="Subtítulo"
              value={seccion.subtitulo}
              multiline
              onChange={(v) =>
                setData({ ...data, secciones: { ...data.secciones, [key]: { ...seccion, subtitulo: v } } })
              }
            />
          )}
        </Card>
      ))}

      <Card title="Conecta — encabezado">
        <Field label="Texto pequeño superior" value={data.conecta.eyebrow} onChange={(v) => setData({ ...data, conecta: { ...data.conecta, eyebrow: v } })} />
        <Field label="Título" value={data.conecta.titulo} onChange={(v) => setData({ ...data, conecta: { ...data.conecta, titulo: v } })} />
        <Field label="Subtítulo" value={data.conecta.subtitulo} multiline onChange={(v) => setData({ ...data, conecta: { ...data.conecta, subtitulo: v } })} />
      </Card>

      <div className="rounded-2xl border border-paper/10 bg-ink-2/40 p-5">
        <h3 className="font-display mb-4 text-sm uppercase tracking-[0.15em] text-gold">Conecta — los 4 pasos</h3>
        <div className="space-y-4">
          {data.conecta.pasos.map((paso, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-paper/10 p-3 sm:grid-cols-[80px_1fr_2fr]">
              <Field
                label="N.º"
                value={paso.numero}
                onChange={(v) => {
                  const pasos = [...data.conecta.pasos];
                  pasos[i] = { ...paso, numero: v };
                  setData({ ...data, conecta: { ...data.conecta, pasos } });
                }}
              />
              <Field
                label="Título del paso"
                value={paso.titulo}
                onChange={(v) => {
                  const pasos = [...data.conecta.pasos];
                  pasos[i] = { ...paso, titulo: v };
                  setData({ ...data, conecta: { ...data.conecta, pasos } });
                }}
              />
              <Field
                label="Descripción"
                value={paso.texto}
                multiline
                onChange={(v) => {
                  const pasos = [...data.conecta.pasos];
                  pasos[i] = { ...paso, texto: v };
                  setData({ ...data, conecta: { ...data.conecta, pasos } });
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-paper/10 bg-ink-2/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm uppercase tracking-[0.15em] text-gold">Conecta — requisitos</h3>
          <button
            onClick={() => setData({ ...data, conecta: { ...data.conecta, requisitos: [...data.conecta.requisitos, ""] } })}
            className="rounded-full border border-gold/40 px-3 py-1 text-xs uppercase tracking-[0.1em] text-gold hover:bg-gold/10"
          >
            + Agregar requisito
          </button>
        </div>
        <div className="space-y-3">
          {data.conecta.requisitos.map((req, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={req}
                onChange={(e) => {
                  const requisitos = [...data.conecta.requisitos];
                  requisitos[i] = e.target.value;
                  setData({ ...data, conecta: { ...data.conecta, requisitos } });
                }}
                className="flex-1 rounded-lg border border-paper/15 bg-ink px-3 py-2 text-sm text-paper focus:border-gold/60 focus:outline-none"
              />
              <button
                onClick={() => {
                  const requisitos = data.conecta.requisitos.filter((_, idx) => idx !== i);
                  setData({ ...data, conecta: { ...data.conecta, requisitos } });
                }}
                className="rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-400 hover:bg-red-400/10"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>

      <Card title="Conecta — 'Actualiza tus datos'">
        <Field label="Título" value={data.conecta.actualizar.titulo} onChange={(v) => setData({ ...data, conecta: { ...data.conecta, actualizar: { ...data.conecta.actualizar, titulo: v } } })} />
        <Field label="Descripción" value={data.conecta.actualizar.desc} multiline onChange={(v) => setData({ ...data, conecta: { ...data.conecta, actualizar: { ...data.conecta.actualizar, desc: v } } })} />
        <Field label="Enlace (URL)" value={data.conecta.actualizar.href} onChange={(v) => setData({ ...data, conecta: { ...data.conecta, actualizar: { ...data.conecta.actualizar, href: v } } })} />
      </Card>

      <div className="rounded-2xl border border-paper/10 bg-ink-2/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm uppercase tracking-[0.15em] text-gold">Conecta — enlaces adicionales</h3>
          <button
            onClick={() =>
              setData({
                ...data,
                conecta: { ...data.conecta, enlaces: [...data.conecta.enlaces, { titulo: "", desc: "", href: "#" }] },
              })
            }
            className="rounded-full border border-gold/40 px-3 py-1 text-xs uppercase tracking-[0.1em] text-gold hover:bg-gold/10"
          >
            + Agregar enlace
          </button>
        </div>
        <div className="space-y-4">
          {data.conecta.enlaces.map((enlace, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-paper/10 p-3 sm:grid-cols-3">
              <Field
                label="Título"
                value={enlace.titulo}
                onChange={(v) => {
                  const enlaces = [...data.conecta.enlaces];
                  enlaces[i] = { ...enlace, titulo: v };
                  setData({ ...data, conecta: { ...data.conecta, enlaces } });
                }}
              />
              <Field
                label="Descripción"
                value={enlace.desc}
                onChange={(v) => {
                  const enlaces = [...data.conecta.enlaces];
                  enlaces[i] = { ...enlace, desc: v };
                  setData({ ...data, conecta: { ...data.conecta, enlaces } });
                }}
              />
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Field
                    label="Enlace (URL)"
                    value={enlace.href}
                    onChange={(v) => {
                      const enlaces = [...data.conecta.enlaces];
                      enlaces[i] = { ...enlace, href: v };
                      setData({ ...data, conecta: { ...data.conecta, enlaces } });
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    const enlaces = data.conecta.enlaces.filter((_, idx) => idx !== i);
                    setData({ ...data, conecta: { ...data.conecta, enlaces } });
                  }}
                  className="mb-0.5 rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-400 hover:bg-red-400/10"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {message && <p className={`text-sm ${message.ok ? "text-emerald-400" : "text-red-400"}`}>{message.text}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full bg-gold px-6 py-2.5 text-sm uppercase tracking-[0.15em] text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}
