import { useState, type ReactNode } from "react";
import type { GithubConfig } from "./github";
import type { Novedad, Oportunidad, RedConfig, Servicio, SitioConfig, TarjetaLinea } from "../data/sitio";
import { slugify } from "./slug";
import {
  Button,
  Card,
  ErrorBox,
  Field,
  Loading,
  MediaPicker,
  MoveButtons,
  Notice,
  PageHeader,
  SaveBar,
  Toggle,
  moveItem,
  subirArchivo,
  useRepoJson,
  vistaPrevia,
} from "./ui";

const SITIO_PATH = "src/data/sitio.json";

/** Lista editable genérica: agregar, quitar y reordenar elementos. */
function Lista<T>({
  items,
  onChange,
  nuevo,
  textoNuevo,
  render,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  nuevo: () => T;
  textoNuevo: string;
  render: (item: T, set: (p: Partial<T>) => void, i: number) => ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded border border-[#dcdcde] bg-[#fbfbfc] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#646970]">#{i + 1}</span>
            <span className="flex items-center gap-1">
              <MoveButtons index={i} length={items.length} onMove={(f, t) => onChange(moveItem(items, f, t))} />
              <Button small variant="danger" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                Quitar
              </Button>
            </span>
          </div>
          {render(it, (p) => onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x))), i)}
        </div>
      ))}
      <Button onClick={() => onChange([...items, nuevo()])}>+ {textoNuevo}</Button>
    </div>
  );
}

const AYUDA_ENLACE =
  "Puede ser una dirección web (https://…), un correo (mailto:correo@usbcali.edu.co), una sección de la página (#oportunidades) o una página del sitio (#/adn-emprendedor).";

export default function RedEditor({ config }: { config: GithubConfig }) {
  const { data, setData, loading, error, saving, dirty, message, save } = useRepoJson<SitioConfig>(config, SITIO_PATH);
  const [subiendo, setSubiendo] = useState<string | null>(null);

  if (loading) return <Loading text="Cargando la Red Alumni…" />;
  if (error || !data) return <ErrorBox text={error ?? "No se pudo cargar."} />;
  if (!data.red) return <ErrorBox text="Este sitio todavía no tiene la configuración de la Red Alumni (sitio.json → red)." />;

  const red = data.red;
  const setRed = (p: Partial<RedConfig>) => setData({ ...data, red: { ...red, ...p } });
  const subir = async (clave: string, file: File, carpeta: string, nombre: string, listo: (ruta: string) => void) => {
    setSubiendo(clave);
    try {
      listo(await subirArchivo(config, file, carpeta, `${slugify(nombre) || "imagen"}-${Date.now().toString(36)}`));
    } catch (e) {
      alert(`No se pudo subir la imagen: ${(e as Error).message}`);
    } finally {
      setSubiendo(null);
    }
  };

  const encabezado = (k: "explora" | "participa" | "historias" | "oportunidades" | "novedades" | "conecta") => (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Texto pequeño (arriba)" value={red[k].eyebrow} onChange={(v) => setRed({ [k]: { ...red[k], eyebrow: v } } as Partial<RedConfig>)} />
      <Field label="Título" value={red[k].titulo} onChange={(v) => setRed({ [k]: { ...red[k], titulo: v } } as Partial<RedConfig>)} />
      <div className="sm:col-span-2">
        <Field label="Descripción" multiline rows={2} value={red[k].subtitulo} onChange={(v) => setRed({ [k]: { ...red[k], subtitulo: v } } as Partial<RedConfig>)} />
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Red Alumni · página principal"
        description="Todo lo de la página de inicio: el concepto de la Red, el banner, las líneas, los servicios, las oportunidades, las novedades y cómo conectarse con la Universidad."
      />
      <Notice>
        Concepto comunicacional: <strong>«{red.concepto.lema}»</strong> — ADN Emprendedor, Egresados por el mundo y
        Egresados que inspiran se presentan como líneas de la Red, no como proyectos aparte.
      </Notice>

      <Card title="1. Banner principal" description="Lo primero que ve el visitante.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre de la Red" value={red.concepto.nombre} onChange={(v) => setRed({ concepto: { ...red.concepto, nombre: v } })} />
          <Field label="Lema (título grande)" value={red.concepto.lema} onChange={(v) => setRed({ concepto: { ...red.concepto, lema: v } })} help="La última parte, después de la última coma, sale con el degradado de colores." />
          <div className="sm:col-span-2">
            <Field label="Frase" value={red.concepto.texto} onChange={(v) => setRed({ concepto: { ...red.concepto, texto: v } })} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Mensaje de bienvenida" multiline value={red.concepto.bienvenida} onChange={(v) => setRed({ concepto: { ...red.concepto, bienvenida: v } })} />
          </div>
          <Field label="Texto del botón" value={red.concepto.ctaLabel} onChange={(v) => setRed({ concepto: { ...red.concepto, ctaLabel: v } })} />
          <Field label="El botón lleva a…" value={red.concepto.ctaHref} onChange={(v) => setRed({ concepto: { ...red.concepto, ctaHref: v } })} help={AYUDA_ENLACE} />
        </div>
        <div className="mt-4">
          <MediaPicker
            label="Fotografía de graduados (opcional)"
            value={red.concepto.banner}
            previewUrl={vistaPrevia(config, red.concepto.banner)}
            uploading={subiendo === "banner"}
            onFile={(f) => subir("banner", f, "red", "banner", (ruta) => setRed({ concepto: { ...red.concepto, banner: ruta } }))}
            onClear={() => setRed({ concepto: { ...red.concepto, banner: null } })}
            help="Una foto horizontal grande (mínimo 1920 px de ancho). Si no hay foto, se muestra un mosaico animado con fotos reales de graduados."
          />
        </div>
      </Card>

      <Card title="2. Explora Alumni · líneas de la Red" description="Tarjetas visuales que llevan a cada línea.">
        {encabezado("explora")}
        <div className="mt-4">
          <Lista<TarjetaLinea>
            items={red.lineas}
            onChange={(lineas) => setRed({ lineas })}
            textoNuevo="Agregar línea"
            nuevo={() => ({ titulo: "Nueva línea", texto: "", href: "#", cta: "Ver más", imagen: null, color: "#f57206" })}
            render={(l, set, i) => (
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem]">
                <Field label="Título" value={l.titulo} onChange={(v) => set({ titulo: v })} />
                <Field label="Texto del enlace" value={l.cta} onChange={(v) => set({ cta: v })} />
                <label className="block">
                  <span className="mb-1 block text-[13px] font-medium text-[#1d2327]">Color</span>
                  <input type="color" value={l.color || "#f57206"} onChange={(e) => set({ color: e.target.value })} className="h-10 w-full rounded border border-[#8c8f94]" />
                </label>
                <div className="sm:col-span-3">
                  <Field label="Descripción" multiline rows={2} value={l.texto} onChange={(v) => set({ texto: v })} />
                </div>
                <div className="sm:col-span-3">
                  <Field label="Lleva a…" value={l.href} onChange={(v) => set({ href: v })} help={AYUDA_ENLACE} />
                </div>
                <div className="sm:col-span-3">
                  <MediaPicker
                    label="Imagen decorativa (opcional)"
                    round
                    value={l.imagen}
                    previewUrl={vistaPrevia(config, l.imagen)}
                    uploading={subiendo === `linea-${i}`}
                    onFile={(f) => subir(`linea-${i}`, f, "red", l.titulo, (ruta) => set({ imagen: ruta }))}
                    onClear={() => set({ imagen: null })}
                  />
                </div>
              </div>
            )}
          />
        </div>
      </Card>

      <Card title="3. Actualízate y participa" description="Botones destacados: actualizar datos, inscribir emprendimientos, contar historias…">
        {encabezado("participa")}
        <div className="mt-4">
          <Lista<Servicio>
            items={red.servicios}
            onChange={(servicios) => setRed({ servicios })}
            textoNuevo="Agregar botón"
            nuevo={() => ({ titulo: "Nuevo servicio", texto: "", href: "https://", cta: "Ir", destacado: false })}
            render={(s, set) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Título" value={s.titulo} onChange={(v) => set({ titulo: v })} />
                <Field label="Texto del botón" value={s.cta} onChange={(v) => set({ cta: v })} />
                <div className="sm:col-span-2">
                  <Field label="Descripción" multiline rows={2} value={s.texto} onChange={(v) => set({ texto: v })} />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Enlace (formulario, página o correo)" value={s.href} onChange={(v) => set({ href: v })} help={AYUDA_ENLACE} />
                </div>
                <Toggle checked={!!s.destacado} onChange={(v) => set({ destacado: v })} label="Destacado (en color)" />
              </div>
            )}
          />
        </div>
      </Card>

      <Card title="4. Historias que conectan" description="Muestra los primeros videos de «Historias en video» (se editan en esa opción del menú).">
        {encabezado("historias")}
        <div className="mt-3 max-w-[12rem]">
          <Field
            label="¿Cuántos videos mostrar?"
            type="number"
            value={String(red.historias.cantidad)}
            onChange={(v) => setRed({ historias: { ...red.historias, cantidad: Math.max(1, Math.min(9, Number(v) || 3)) } })}
          />
        </div>
      </Card>

      <Card title="5. Oportunidades para ti" description="Bolsa de Empleo, formación, eventos…">
        {encabezado("oportunidades")}
        <div className="mt-4">
          <Lista<Oportunidad>
            items={red.oportunidades.items}
            onChange={(items) => setRed({ oportunidades: { ...red.oportunidades, items } })}
            textoNuevo="Agregar oportunidad"
            nuevo={() => ({ titulo: "Nueva oportunidad", texto: "", href: "https://", cta: "Ver más", etiqueta: "" })}
            render={(o, set) => (
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Etiqueta" value={o.etiqueta} onChange={(v) => set({ etiqueta: v })} placeholder="Empleo, Formación…" />
                <Field label="Título" value={o.titulo} onChange={(v) => set({ titulo: v })} />
                <Field label="Texto del enlace" value={o.cta} onChange={(v) => set({ cta: v })} />
                <div className="sm:col-span-3">
                  <Field label="Descripción" multiline rows={2} value={o.texto} onChange={(v) => set({ texto: v })} />
                </div>
                <div className="sm:col-span-3">
                  <Field label="Enlace" value={o.href} onChange={(v) => set({ href: v })} help={AYUDA_ENLACE} />
                </div>
              </div>
            )}
          />
        </div>
      </Card>

      <Card title="6. Novedades Alumni" description="Cartelera de noticias, eventos y encuentros. Se muestran las más recientes primero (las 4 últimas).">
        {encabezado("novedades")}
        <div className="mt-4">
          <Lista<Novedad>
            items={red.novedades.items}
            onChange={(items) => setRed({ novedades: { ...red.novedades, items } })}
            textoNuevo="Agregar novedad"
            nuevo={() => ({ fecha: new Date().toISOString().slice(0, 10), titulo: "Nueva novedad", texto: "", etiqueta: "Evento", href: null, imagen: null })}
            render={(n, set, i) => (
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Fecha" type="date" value={n.fecha.length === 7 ? `${n.fecha}-01` : n.fecha} onChange={(v) => set({ fecha: v })} />
                <Field label="Etiqueta" value={n.etiqueta} onChange={(v) => set({ etiqueta: v })} placeholder="Evento, Noticia…" />
                <Field label="Título" value={n.titulo} onChange={(v) => set({ titulo: v })} />
                <div className="sm:col-span-3">
                  <Field label="Texto" multiline rows={2} value={n.texto} onChange={(v) => set({ texto: v })} />
                </div>
                <div className="sm:col-span-3">
                  <Field label="Enlace (opcional)" value={n.href} onChange={(v) => set({ href: v || null })} help={AYUDA_ENLACE} />
                </div>
                <div className="sm:col-span-3">
                  <MediaPicker
                    label="Imagen (opcional)"
                    value={n.imagen}
                    previewUrl={vistaPrevia(config, n.imagen)}
                    uploading={subiendo === `nov-${i}`}
                    onFile={(f) => subir(`nov-${i}`, f, "novedades", n.titulo, (ruta) => set({ imagen: ruta }))}
                    onClear={() => set({ imagen: null })}
                  />
                </div>
              </div>
            )}
          />
        </div>
      </Card>

      <Card title="7. Conéctate con la Universidad" description="Portal institucional de egresados, correo y WhatsApp de la Oficina.">
        {encabezado("conecta")}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Nombre del enlace al portal" value={red.conecta.portalLabel} onChange={(v) => setRed({ conecta: { ...red.conecta, portalLabel: v } })} />
          <Field label="Dirección del portal de egresados" value={red.conecta.portalHref} onChange={(v) => setRed({ conecta: { ...red.conecta, portalHref: v } })} />
          <Field label="Correo de la Oficina" type="email" value={red.conecta.correo} onChange={(v) => setRed({ conecta: { ...red.conecta, correo: v } })} />
          <Field label="WhatsApp (con indicativo, solo números)" value={red.conecta.whatsapp} onChange={(v) => setRed({ conecta: { ...red.conecta, whatsapp: v || null } })} placeholder="573001234567" />
          <div className="sm:col-span-2">
            <Field
              label="Tipos de mensaje (separados por coma)"
              value={red.conecta.asuntos.join(", ")}
              onChange={(v) => setRed({ conecta: { ...red.conecta, asuntos: v.split(",").map((x) => x.trim()).filter(Boolean) } })}
            />
          </div>
        </div>
      </Card>

      <Card title="8. Aviso de privacidad" description="Enlace que aparece en el pie de página y en el formulario de contacto.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Texto" value={red.privacidadLabel} onChange={(v) => setRed({ privacidadLabel: v })} />
          <Field label="Enlace al documento" value={red.privacidadHref} onChange={(v) => setRed({ privacidadHref: v })} />
        </div>
      </Card>

      <SaveBar dirty={dirty} saving={saving} message={message} onSave={() => save("Panel admin: actualizar la Red Alumni (inicio)")} />
    </>
  );
}
