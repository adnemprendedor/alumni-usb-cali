import { useState } from "react";
import type { GithubConfig } from "./github";
import type { Contacto, Enlace, SitioConfig } from "../data/sitio";
import { slugify } from "./slug";
import { Button, Card, ErrorBox, Field, Loading, MediaPicker, MoveButtons, PageHeader, SaveBar, moveItem, subirArchivo, useRepoJson, vistaPrevia } from "./ui";

const SITIO_PATH = "src/data/sitio.json";

const DESTINOS = [
  { label: "Portada", href: "#inicio" },
  { label: "Explora la red", href: "#explora" },
  { label: "Emprendedor de la semana", href: "#destacado-semana" },
  { label: "Categorías", href: "#categorias" },
  { label: "Directorio / buscador", href: "#buscador" },
  { label: "Emprendimientos", href: "#emprendimientos" },
  { label: "Egresados que inspiran", href: "#destacados" },
  { label: "Historias en video", href: "#videos" },
  { label: "Participa", href: "#conecta" },
  { label: "Juego de cartas", href: "#/juego" },
];

/** Editor de una lista de enlaces (texto + destino) con agregar, quitar y reordenar. */
function EnlacesEditor({ enlaces, onChange }: { enlaces: Enlace[]; onChange: (e: Enlace[]) => void }) {
  return (
    <div className="space-y-2">
      {enlaces.map((l, i) => (
        <div key={i} className="grid items-end gap-2 rounded border border-[#dcdcde] p-2 sm:grid-cols-[1fr_1.4fr_auto]">
          <Field label="Texto" value={l.label} onChange={(v) => onChange(enlaces.map((x, j) => (j === i ? { ...x, label: v } : x)))} />
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-[#1d2327]">Lleva a…</span>
            <div className="flex gap-2">
              <select
                value={DESTINOS.some((d) => d.href === l.href) ? l.href : "otro"}
                onChange={(e) => e.target.value !== "otro" && onChange(enlaces.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))}
                className="w-40 shrink-0 rounded border border-[#8c8f94] bg-white px-2 py-2 text-sm text-[#1d2327]"
              >
                {DESTINOS.map((d) => (
                  <option key={d.href} value={d.href}>
                    {d.label}
                  </option>
                ))}
                <option value="otro">Otra página (URL)…</option>
              </select>
              <input
                value={l.href}
                onChange={(e) => onChange(enlaces.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))}
                className="w-full rounded border border-[#8c8f94] px-3 py-2 text-sm text-[#1d2327] focus:border-[#ef7d00] focus:outline-none"
                placeholder="https://…"
              />
            </div>
          </label>
          <span className="flex items-center gap-1 pb-1">
            <MoveButtons index={i} length={enlaces.length} onMove={(f, t) => onChange(moveItem(enlaces, f, t))} />
            <Button small variant="danger" onClick={() => onChange(enlaces.filter((_, j) => j !== i))}>
              Quitar
            </Button>
          </span>
        </div>
      ))}
      <Button small onClick={() => onChange([...enlaces, { label: "Nuevo enlace", href: "#inicio" }])}>
        + Agregar enlace
      </Button>
    </div>
  );
}

export default function MenuPieEditor({ config }: { config: GithubConfig }) {
  const { data, setData, loading, error, saving, dirty, message, setMessage, save } = useRepoJson<SitioConfig>(config, SITIO_PATH);
  const [subiendo, setSubiendo] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox text={error ?? "No se pudo cargar."} />;

  const pie = data.pie;
  const setPie = (next: Partial<SitioConfig["pie"]>) => setData({ ...data, pie: { ...pie, ...next } });
  const setContacto = (i: number, next: Partial<Contacto>) =>
    setPie({ contactos: pie.contactos.map((c, j) => (j === i ? { ...c, ...next } : c)) });

  async function subirFotoContacto(i: number, campo: "foto" | "logo", file: File) {
    const c = pie.contactos[i];
    setSubiendo(`${i}-${campo}`);
    try {
      const ruta = await subirArchivo(config, file, campo === "foto" ? "equipo" : "logos", `${campo === "foto" ? "equipo" : "contacto"}-${slugify(c.nombre || "contacto")}`);
      setContacto(i, { [campo]: ruta });
      setMessage({ ok: true, text: "Imagen subida. Pulsa “Guardar cambios” para publicarla." });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "No se pudo subir la imagen." });
    } finally {
      setSubiendo(null);
    }
  }

  return (
    <>
      <PageHeader title="Menú, pie de página y redes" description="Los enlaces del menú superior, todo lo que aparece al final de la página y las redes sociales." />

      <Card title="Menú superior" description="Los enlaces que aparecen arriba en la página.">
        <EnlacesEditor enlaces={data.menu} onChange={(menu) => setData({ ...data, menu })} />
        <div className="mt-5 grid gap-4 border-t border-[#dcdcde] pt-4 sm:grid-cols-2">
          <Field label="Botón del menú — texto" value={data.botonMenu.label} onChange={(v) => setData({ ...data, botonMenu: { ...data.botonMenu, label: v } })} help="Déjalo vacío para ocultar el botón." />
          <Field label="Botón del menú — lleva a" value={data.botonMenu.href} onChange={(v) => setData({ ...data, botonMenu: { ...data.botonMenu, href: v } })} />
        </div>
      </Card>

      <Card title="Pie de página — encabezado">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Frase grande" value={pie.titulo} multiline rows={2} onChange={(v) => setPie({ titulo: v })} help="Pulsa Enter para partirla en dos líneas." />
          <div className="grid gap-4">
            <Field label="Texto del botón" value={pie.botonLabel} onChange={(v) => setPie({ botonLabel: v })} />
            <Field label="El botón lleva a" value={pie.botonHref} onChange={(v) => setPie({ botonHref: v })} />
          </div>
          <Field label="Título del bloque “acerca de”" value={pie.acercaTitulo} onChange={(v) => setPie({ acercaTitulo: v })} />
          <Field label="Texto del bloque “acerca de”" value={pie.acercaTexto} multiline onChange={(v) => setPie({ acercaTexto: v })} />
        </div>
      </Card>

      <Card
        title="Pie de página — columnas de enlaces"
        right={<Button small onClick={() => setPie({ columnas: [...pie.columnas, { titulo: "Nueva columna", enlaces: [] }] })}>+ Agregar columna</Button>}
      >
        <div className="space-y-5">
          {pie.columnas.map((col, i) => (
            <div key={i} className="rounded border border-[#dcdcde] bg-[#f6f7f7] p-4">
              <div className="mb-3 flex items-end gap-2">
                <div className="flex-1">
                  <Field label="Título de la columna" value={col.titulo} onChange={(v) => setPie({ columnas: pie.columnas.map((c, j) => (j === i ? { ...c, titulo: v } : c)) })} />
                </div>
                <MoveButtons index={i} length={pie.columnas.length} onMove={(f, t) => setPie({ columnas: moveItem(pie.columnas, f, t) })} />
                <Button small variant="danger" onClick={() => confirm(`¿Quitar la columna "${col.titulo}"?`) && setPie({ columnas: pie.columnas.filter((_, j) => j !== i) })}>
                  Quitar columna
                </Button>
              </div>
              <EnlacesEditor enlaces={col.enlaces} onChange={(enlaces) => setPie({ columnas: pie.columnas.map((c, j) => (j === i ? { ...c, enlaces } : c)) })} />
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Pie de página — personas de contacto"
        right={
          <Button small onClick={() => setPie({ contactos: [...pie.contactos, { nombre: "", cargo: "", correo: "", telefono: "", whatsapp: "", foto: null, logo: null, logoTexto: null }] })}>
            + Agregar persona
          </Button>
        }
      >
        <div className="space-y-4">
          {pie.contactos.map((c, i) => (
            <div key={i} className="grid gap-4 rounded border border-[#dcdcde] p-4 lg:grid-cols-[200px_1fr]">
              <MediaPicker
                label="Foto"
                round
                value={c.foto}
                previewUrl={vistaPrevia(config, c.foto)}
                uploading={subiendo === `${i}-foto`}
                onFile={(f) => subirFotoContacto(i, "foto", f)}
                onClear={() => setContacto(i, { foto: null })}
              />
              <div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nombre" value={c.nombre} onChange={(v) => setContacto(i, { nombre: v })} />
                  <Field label="Cargo" value={c.cargo} onChange={(v) => setContacto(i, { cargo: v })} />
                  <Field label="Correo" value={c.correo} type="email" onChange={(v) => setContacto(i, { correo: v })} />
                  <Field label="Teléfono / extensión" value={c.telefono} onChange={(v) => setContacto(i, { telefono: v })} />
                  <Field label="WhatsApp (con 57 adelante)" value={c.whatsapp} placeholder="573001234567" onChange={(v) => setContacto(i, { whatsapp: v })} help="Déjalo vacío si no tiene." />
                  <Field label="Texto junto al logo (opcional)" value={c.logoTexto} onChange={(v) => setContacto(i, { logoTexto: v })} />
                </div>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                  <MediaPicker
                    label="Logo pequeño (opcional)"
                    value={c.logo}
                    previewUrl={vistaPrevia(config, c.logo)}
                    uploading={subiendo === `${i}-logo`}
                    onFile={(f) => subirFotoContacto(i, "logo", f)}
                    onClear={() => setContacto(i, { logo: null })}
                  />
                  <span className="flex gap-1">
                    <MoveButtons index={i} length={pie.contactos.length} onMove={(f, t) => setPie({ contactos: moveItem(pie.contactos, f, t) })} />
                    <Button small variant="danger" onClick={() => confirm(`¿Quitar a ${c.nombre || "esta persona"}?`) && setPie({ contactos: pie.contactos.filter((_, j) => j !== i) })}>
                      Quitar persona
                    </Button>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-4 border-t border-[#dcdcde] pt-4 sm:grid-cols-2">
          <Field label="Horario de atención" value={pie.horario} onChange={(v) => setPie({ horario: v })} />
          <Field label="Dirección (opcional)" value={pie.direccion} onChange={(v) => setPie({ direccion: v || null })} />
          <Field label="Texto final (derechos reservados)" value={pie.copyright} onChange={(v) => setPie({ copyright: v })} help="El año se pone solo al inicio." />
        </div>
      </Card>

      <Card
        title="Redes sociales"
        description="Aparecen en el pie de página."
        right={<Button small onClick={() => setData({ ...data, redes: [...data.redes, { nombre: "", url: "" }] })}>+ Agregar red</Button>}
      >
        <div className="space-y-2">
          {data.redes.map((r, i) => (
            <div key={i} className="grid items-end gap-2 sm:grid-cols-[200px_1fr_auto]">
              <label className="block">
                <span className="mb-1 block text-[13px] font-medium text-[#1d2327]">Red</span>
                <input
                  list="redes-sugeridas"
                  value={r.nombre}
                  onChange={(e) => setData({ ...data, redes: data.redes.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)) })}
                  className="w-full rounded border border-[#8c8f94] px-3 py-2 text-sm text-[#1d2327] focus:border-[#ef7d00] focus:outline-none"
                />
              </label>
              <Field label="Enlace" value={r.url} placeholder="https://…" onChange={(v) => setData({ ...data, redes: data.redes.map((x, j) => (j === i ? { ...x, url: v } : x)) })} />
              <span className="pb-1">
                <Button small variant="danger" onClick={() => setData({ ...data, redes: data.redes.filter((_, j) => j !== i) })}>
                  Quitar
                </Button>
              </span>
            </div>
          ))}
          <datalist id="redes-sugeridas">
            {["Instagram", "Facebook", "LinkedIn", "TikTok", "YouTube", "X (Twitter)", "WhatsApp", "Sitio web"].map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>
      </Card>

      <SaveBar dirty={dirty} saving={saving} message={message} onSave={() => save("Panel admin: menú, pie de página y redes")} />
    </>
  );
}
