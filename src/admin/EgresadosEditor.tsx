import { useEffect, useMemo, useState } from "react";
import type { Egresado } from "../data/egresados";
import { getFile, putBinaryFile, putTextFile, type GithubConfig } from "./github";
import { uniqueSlug } from "./slug";

type MediaEntry = { foto?: string; logo?: string };
type MediaMap = Record<string, MediaEntry>;

const EGRESADOS_PATH = "src/data/egresados.json";
const MEDIA_PATH = "src/data/media.json";

const CAMPOS_TEXTO: Array<{ key: keyof Egresado; label: string; datalist?: boolean }> = [
  { key: "nombre", label: "Nombre completo" },
  { key: "correo", label: "Correo" },
  { key: "instagram", label: "Instagram" },
  { key: "telefonoNegocio", label: "Teléfono del negocio" },
  { key: "nombreEmprendimiento", label: "Nombre del emprendimiento" },
  { key: "programa", label: "Programa académico", datalist: true },
  { key: "facultad", label: "Facultad", datalist: true },
  { key: "facultadAcronimo", label: "Sigla de la facultad", datalist: true },
  { key: "gradoAcademico", label: "Grado académico", datalist: true },
  { key: "anioEgreso", label: "Año de egreso", datalist: true },
  { key: "paisResidencia", label: "País de residencia", datalist: true },
  { key: "emprendimientoAsociadoA", label: "Emprendimiento asociado a", datalist: true },
  { key: "enfoque", label: "Enfoque", datalist: true },
  { key: "tipo", label: "Tipo de negocio", datalist: true },
  { key: "antiguedad", label: "Antigüedad", datalist: true },
];

function blankEgresado(): Egresado {
  return {
    id: "",
    slug: "",
    nombre: "",
    correo: null,
    instagram: null,
    telefonoNegocio: null,
    descripcion: null,
    programa: null,
    facultad: null,
    facultadAcronimo: null,
    gradoAcademico: null,
    anioEgreso: null,
    paisResidencia: null,
    nombreEmprendimiento: "",
    emprendimientoAsociadoA: null,
    enfoque: null,
    tipo: null,
    antiguedad: null,
  };
}

function fileToBase64(file: File): Promise<{ base64: string; ext: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "jpg";
      resolve({ base64, ext });
    };
    reader.readAsDataURL(file);
  });
}

export default function EgresadosEditor({ config }: { config: GithubConfig }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [list, setList] = useState<Egresado[]>([]);
  const [media, setMedia] = useState<MediaMap>({});
  const [egresadosSha, setEgresadosSha] = useState<string | undefined>();
  const [mediaSha, setMediaSha] = useState<string | undefined>();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Egresado | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [savingList, setSavingList] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const [egresadosFile, mediaFile] = await Promise.all([
          getFile(config, EGRESADOS_PATH),
          getFile(config, MEDIA_PATH),
        ]);
        if (cancelled) return;
        setList(JSON.parse(egresadosFile.content) as Egresado[]);
        setEgresadosSha(egresadosFile.sha);
        setMedia(JSON.parse(mediaFile.content) as MediaMap);
        setMediaSha(mediaFile.sha);
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "No se pudo cargar la información.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [config]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.nombreEmprendimiento.toLowerCase().includes(q) ||
        (e.programa ?? "").toLowerCase().includes(q)
    );
  }, [list, search]);

  const datalistOptions = useMemo(() => {
    const map: Partial<Record<keyof Egresado, string[]>> = {};
    for (const campo of CAMPOS_TEXTO) {
      if (!campo.datalist) continue;
      const values = new Set<string>();
      for (const e of list) {
        const v = e[campo.key];
        if (typeof v === "string" && v.trim()) values.add(v);
      }
      map[campo.key] = Array.from(values).sort((a, b) => a.localeCompare(b, "es"));
    }
    return map;
  }, [list]);

  function selectEgresado(e: Egresado) {
    setSelectedId(e.id);
    setDraft({ ...e });
    setIsNew(false);
    setMessage(null);
  }

  function startNew() {
    setSelectedId(null);
    setDraft(blankEgresado());
    setIsNew(true);
    setMessage(null);
  }

  function updateDraft<K extends keyof Egresado>(key: K, value: Egresado[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  async function persist(nextList: Egresado[], nextMedia: MediaMap, successText: string) {
    setSavingList(true);
    setMessage(null);
    try {
      const egresadosResult = await putTextFile(
        config,
        EGRESADOS_PATH,
        JSON.stringify(nextList, null, 2),
        `Panel admin: actualizar egresados.json`,
        egresadosSha
      );
      const mediaResult = await putTextFile(
        config,
        MEDIA_PATH,
        JSON.stringify(nextMedia, null, 2),
        `Panel admin: actualizar media.json`,
        mediaSha
      );
      setList(nextList);
      setMedia(nextMedia);
      setEgresadosSha(egresadosResult.sha);
      setMediaSha(mediaResult.sha);
      setMessage({ ok: true, text: `${successText} El sitio se actualizará solo en 1-2 minutos.` });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "No se pudo guardar." });
    } finally {
      setSavingList(false);
    }
  }

  async function handleSave() {
    if (!draft) return;
    if (!draft.nombre.trim() || !draft.nombreEmprendimiento.trim()) {
      setMessage({ ok: false, text: "El nombre y el nombre del emprendimiento son obligatorios." });
      return;
    }
    let nextList: Egresado[];
    let finalDraft = draft;
    if (isNew) {
      const taken = new Set(list.map((e) => e.slug));
      const slug = uniqueSlug(draft.nombre, taken);
      finalDraft = { ...draft, id: slug, slug };
      nextList = [...list, finalDraft];
    } else {
      nextList = list.map((e) => (e.id === draft.id ? draft : e));
    }
    await persist(nextList, media, isNew ? "Egresado agregado." : "Cambios guardados.");
    setDraft(finalDraft);
    setSelectedId(finalDraft.id);
    setIsNew(false);
  }

  async function handleDelete() {
    if (!draft || isNew) return;
    if (!confirm(`¿Eliminar a "${draft.nombre}" del directorio? Esta acción no se puede deshacer.`)) return;
    const nextList = list.filter((e) => e.id !== draft.id);
    const nextMedia = { ...media };
    delete nextMedia[draft.slug];
    await persist(nextList, nextMedia, "Egresado eliminado.");
    setDraft(null);
    setSelectedId(null);
  }

  async function handleUpload(kind: "foto" | "logo", file: File) {
    if (!draft || isNew) {
      setMessage({ ok: false, text: "Primero guarda el egresado antes de subir foto o logo." });
      return;
    }
    const setUploading = kind === "foto" ? setUploadingFoto : setUploadingLogo;
    setUploading(true);
    setMessage(null);
    try {
      const { base64, ext } = await fileToBase64(file);
      const folder = kind === "foto" ? "egresados" : "logos";
      const path = `public/${folder}/${draft.slug}.${ext}`;
      await putBinaryFile(config, path, base64, `Panel admin: subir ${kind} de ${draft.nombre}`);
      const nextMedia: MediaMap = {
        ...media,
        [draft.slug]: { ...media[draft.slug], [kind]: `${folder}/${draft.slug}.${ext}` },
      };
      const mediaResult = await putTextFile(
        config,
        MEDIA_PATH,
        JSON.stringify(nextMedia, null, 2),
        `Panel admin: actualizar media.json (${kind} de ${draft.nombre})`,
        mediaSha
      );
      setMedia(nextMedia);
      setMediaSha(mediaResult.sha);
      setMessage({ ok: true, text: `${kind === "foto" ? "Foto" : "Logo"} actualizado. El sitio se actualizará en 1-2 minutos.` });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "No se pudo subir la imagen." });
    } finally {
      setUploading(false);
    }
  }

  function rawUrl(path: string) {
    return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/public/${path}`;
  }

  if (loading) {
    return <p className="p-8 text-paper-dim">Cargando egresados…</p>;
  }
  if (loadError) {
    return <p className="p-8 text-red-400">{loadError}</p>;
  }

  const currentMedia = draft ? media[draft.slug] : undefined;

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,320px)_1fr]">
      <div className="rounded-2xl border border-paper/10 bg-ink-2/40 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o emprendimiento…"
            className="w-full rounded-lg border border-paper/15 bg-ink px-3 py-2 text-sm text-paper focus:border-gold/60 focus:outline-none"
          />
        </div>
        <button
          onClick={startNew}
          className="mb-3 w-full rounded-lg border border-gold/40 px-3 py-2 text-xs uppercase tracking-[0.15em] text-gold hover:bg-gold/10"
        >
          + Agregar egresado
        </button>
        <p className="mb-2 text-xs text-paper-dim">{filtered.length} de {list.length} egresados</p>
        <div className="max-h-[65vh] space-y-1 overflow-y-auto pr-1">
          {filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => selectEgresado(e)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedId === e.id ? "bg-gold/15 text-gold" : "text-paper-dim hover:bg-paper/5 hover:text-paper"
              }`}
            >
              <span className="block truncate">{e.nombre}</span>
              <span className="block truncate text-xs opacity-70">{e.nombreEmprendimiento}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-paper/10 bg-ink-2/40 p-6">
        {!draft ? (
          <p className="text-paper-dim">Selecciona un egresado de la lista o agrega uno nuevo.</p>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-light text-paper">
                {isNew ? "Nuevo egresado" : draft.nombre}
              </h2>
              {!isNew && (
                <button
                  onClick={handleDelete}
                  className="rounded-full border border-red-400/40 px-4 py-1.5 text-xs uppercase tracking-[0.1em] text-red-400 hover:bg-red-400/10"
                >
                  Eliminar
                </button>
              )}
            </div>

            {!isNew && (
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.15em] text-paper-dim">Foto</p>
                  {currentMedia?.foto ? (
                    <img src={rawUrl(currentMedia.foto)} alt="Foto actual" className="mb-2 h-24 w-24 rounded-lg object-cover object-top" />
                  ) : (
                    <p className="mb-2 text-xs text-paper-dim">Sin foto</p>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingFoto}
                    onChange={(e) => e.target.files?.[0] && handleUpload("foto", e.target.files[0])}
                    className="block w-full text-xs text-paper-dim file:mr-2 file:rounded-full file:border-0 file:bg-gold/20 file:px-3 file:py-1.5 file:text-gold"
                  />
                  {uploadingFoto && <p className="mt-1 text-xs text-gold">Subiendo…</p>}
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.15em] text-paper-dim">Logo del emprendimiento</p>
                  {currentMedia?.logo ? (
                    <img src={rawUrl(currentMedia.logo)} alt="Logo actual" className="mb-2 h-24 w-24 rounded-lg bg-paper object-contain p-2" />
                  ) : (
                    <p className="mb-2 text-xs text-paper-dim">Sin logo</p>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingLogo}
                    onChange={(e) => e.target.files?.[0] && handleUpload("logo", e.target.files[0])}
                    className="block w-full text-xs text-paper-dim file:mr-2 file:rounded-full file:border-0 file:bg-gold/20 file:px-3 file:py-1.5 file:text-gold"
                  />
                  {uploadingLogo && <p className="mt-1 text-xs text-gold">Subiendo…</p>}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {CAMPOS_TEXTO.map((campo) => (
                <label key={String(campo.key)} className="block">
                  <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-paper-dim">{campo.label}</span>
                  <input
                    type="text"
                    value={(draft[campo.key] as string | null) ?? ""}
                    onChange={(e) => updateDraft(campo.key, (e.target.value || null) as never)}
                    list={campo.datalist ? `dl-${String(campo.key)}` : undefined}
                    className="w-full rounded-lg border border-paper/15 bg-ink px-3 py-2 text-sm text-paper focus:border-gold/60 focus:outline-none"
                  />
                  {campo.datalist && (
                    <datalist id={`dl-${String(campo.key)}`}>
                      {(datalistOptions[campo.key] ?? []).map((v) => (
                        <option key={v} value={v} />
                      ))}
                    </datalist>
                  )}
                </label>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-paper-dim">Descripción del emprendimiento</span>
              <textarea
                value={draft.descripcion ?? ""}
                onChange={(e) => updateDraft("descripcion", (e.target.value || null) as never)}
                rows={3}
                className="w-full rounded-lg border border-paper/15 bg-ink px-3 py-2 text-sm text-paper focus:border-gold/60 focus:outline-none"
              />
            </label>

            {message && (
              <p className={`mt-4 text-sm ${message.ok ? "text-emerald-400" : "text-red-400"}`}>{message.text}</p>
            )}

            <button
              onClick={handleSave}
              disabled={savingList}
              className="mt-6 rounded-full bg-gold px-6 py-2.5 text-sm uppercase tracking-[0.15em] text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {savingList ? "Guardando…" : isNew ? "Agregar egresado" : "Guardar cambios"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
