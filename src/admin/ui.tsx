// Piezas compartidas del panel de administración (estilo WordPress):
// campos de formulario, tarjetas, interruptores, subida de imágenes, la barra
// fija de "Guardar cambios" y un hook para leer/guardar un JSON del repositorio.
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { getFile, putBinaryFile, putTextFile, type GithubConfig } from "./github";

/* ---------- datos ---------- */

export function useRepoJson<T>(config: GithubConfig, path: string) {
  const [data, setDataState] = useState<T | null>(null);
  const [sha, setSha] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getFile(config, path)
      .then((f) => {
        if (cancelled) return;
        setDataState(JSON.parse(f.content) as T);
        setSha(f.sha);
        setDirty(false);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "No se pudo cargar."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [config, path]);

  const setData = useCallback((next: T | ((prev: T) => T)) => {
    setDataState((prev) => (prev === null ? prev : typeof next === "function" ? (next as (p: T) => T)(prev) : next));
    setDirty(true);
    setMessage(null);
  }, []);

  const save = useCallback(
    async (commitMessage: string, override?: T) => {
      const toSave = override ?? data;
      if (toSave === null) return false;
      setSaving(true);
      setMessage(null);
      try {
        const r = await putTextFile(config, path, JSON.stringify(toSave, null, 2) + "\n", commitMessage, sha);
        setSha(r.sha);
        if (override) setDataState(override);
        setDirty(false);
        setMessage({ ok: true, text: "¡Listo! Cambios guardados. El sitio se actualiza solo en 1 o 2 minutos." });
        return true;
      } catch (e) {
        setMessage({ ok: false, text: e instanceof Error ? e.message : "No se pudo guardar." });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [config, path, data, sha]
  );

  return { data, setData, loading, error, saving, dirty, message, setMessage, save };
}

export function fileToBase64(file: File): Promise<{ base64: string; ext: string }> {
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

/** Sube un archivo a /public/<carpeta>/<nombre>.<ext> y devuelve la ruta relativa a /public. */
export async function subirArchivo(config: GithubConfig, file: File, carpeta: string, nombre: string) {
  const { base64, ext } = await fileToBase64(file);
  const ruta = `${carpeta}/${nombre}.${ext}`;
  await putBinaryFile(config, `public/${ruta}`, base64, `Panel admin: subir ${ruta}`);
  return ruta;
}

/** URL para previsualizar en el panel un archivo de /public (desde el sitio o, si es nuevo, desde GitHub). */
export function vistaPrevia(config: GithubConfig, ruta?: string | null): string | null {
  if (!ruta) return null;
  if (/^(https?:)?\/\//.test(ruta) || ruta.startsWith("data:") || ruta.startsWith("blob:")) return ruta;
  return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/public/${ruta.replace(/^\//, "")}`;
}

/* ---------- maquetación ---------- */

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-[#1d2327]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-[#50575e]">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Card({ title, description, children, right }: { title?: string; description?: ReactNode; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="mb-5 rounded-md border border-[#dcdcde] bg-white shadow-sm">
      {(title || right) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dcdcde] px-5 py-3">
          <div>
            {title && <h2 className="text-sm font-semibold text-[#1d2327]">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-[#646970]">{description}</p>}
          </div>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  help,
  type = "text",
  rows = 3,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  help?: string;
  type?: string;
  rows?: number;
}) {
  const cls =
    "w-full rounded border border-[#8c8f94] bg-white px-3 py-2 text-sm text-[#1d2327] shadow-inner focus:border-[#ef7d00] focus:outline-none focus:ring-1 focus:ring-[#ef7d00]";
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-medium text-[#1d2327]">{label}</span>
      {multiline ? (
        <textarea value={value ?? ""} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cls} />
      ) : (
        <input type={type} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
      {help && <span className="mt-1 block text-xs text-[#646970]">{help}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm text-[#1d2327]"
    >
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-[#ef7d00]" : "bg-[#c3c4c7]"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

export function Button({
  children,
  onClick,
  variant = "secondary",
  disabled,
  type = "button",
  small,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  small?: boolean;
  title?: string;
}) {
  const v = {
    primary: "border-[#ef7d00] bg-[#ef7d00] text-white hover:bg-[#d96f00]",
    secondary: "border-[#ef7d00] bg-white text-[#b35c00] hover:bg-[#fff4e8]",
    danger: "border-[#d63638] bg-white text-[#d63638] hover:bg-[#fcf0f1]",
    ghost: "border-transparent bg-transparent text-[#50575e] hover:bg-[#f0f0f1]",
  }[variant];
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        small ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"
      } ${v}`}
    >
      {children}
    </button>
  );
}

/** Flechas para subir/bajar un elemento en una lista. */
export function MoveButtons({ index, length, onMove }: { index: number; length: number; onMove: (from: number, to: number) => void }) {
  return (
    <span className="inline-flex gap-1">
      <Button small variant="ghost" title="Subir" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        ▲
      </Button>
      <Button small variant="ghost" title="Bajar" disabled={index === length - 1} onClick={() => onMove(index, index + 1)}>
        ▼
      </Button>
    </span>
  );
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/** Barra fija inferior con el botón de guardar, como "Actualizar" en WordPress. */
export function SaveBar({
  dirty,
  saving,
  message,
  onSave,
  label = "Guardar cambios",
}: {
  dirty: boolean;
  saving: boolean;
  message: { ok: boolean; text: string } | null;
  onSave: () => void;
  label?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center gap-4 border-t border-[#dcdcde] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <Button variant="primary" onClick={onSave} disabled={saving || !dirty}>
        {saving ? "Guardando…" : label}
      </Button>
      {message ? (
        <span className={`text-sm ${message.ok ? "text-[#008a20]" : "text-[#d63638]"}`}>{message.text}</span>
      ) : dirty ? (
        <span className="text-sm text-[#996800]">Tienes cambios sin guardar.</span>
      ) : (
        <span className="text-sm text-[#646970]">Todo está guardado.</span>
      )}
    </div>
  );
}

/** Caja para subir una imagen (o video) con vista previa. */
export function MediaPicker({
  label,
  value,
  previewUrl,
  onFile,
  onClear,
  uploading,
  accept = "image/*",
  round,
  help,
}: {
  label: string;
  value?: string | null;
  previewUrl?: string | null;
  onFile: (file: File) => void;
  onClear?: () => void;
  uploading?: boolean;
  accept?: string;
  round?: boolean;
  help?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const esVideo = accept.startsWith("video");
  return (
    <div>
      <span className="mb-1 block text-[13px] font-medium text-[#1d2327]">{label}</span>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-dashed border-[#8c8f94] bg-[#f6f7f7] ${
            round ? "rounded-full" : "rounded"
          }`}
        >
          {previewUrl ? (
            esVideo ? (
              <span className="px-2 text-center text-[11px] text-[#50575e]">🎬 Video cargado</span>
            ) : (
              <img src={previewUrl} alt="" className={`h-full w-full ${round ? "object-cover object-top" : "object-contain p-1"}`} />
            )
          ) : (
            <span className="text-[11px] text-[#8c8f94]">Sin {esVideo ? "video" : "imagen"}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={input}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
          <Button small onClick={() => input.current?.click()} disabled={uploading}>
            {uploading ? "Subiendo…" : value ? "Cambiar" : "Subir archivo"}
          </Button>
          {value && onClear && (
            <Button small variant="danger" onClick={onClear} disabled={uploading}>
              Quitar
            </Button>
          )}
        </div>
      </div>
      {help && <span className="mt-1 block text-xs text-[#646970]">{help}</span>}
    </div>
  );
}

export function Loading({ text = "Cargando…" }: { text?: string }) {
  return <p className="py-10 text-sm text-[#50575e]">{text}</p>;
}

export function ErrorBox({ text }: { text: string }) {
  return <div className="rounded border-l-4 border-[#d63638] bg-white p-4 text-sm text-[#1d2327] shadow-sm">{text}</div>;
}

export function Notice({ children }: { children: ReactNode }) {
  return <div className="mb-5 rounded border-l-4 border-[#ef7d00] bg-white p-4 text-sm text-[#1d2327] shadow-sm">{children}</div>;
}
