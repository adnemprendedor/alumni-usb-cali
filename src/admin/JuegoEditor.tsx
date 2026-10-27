import { useState } from "react";
import type { GithubConfig } from "./github";
import type { JuegoEgresado } from "../data/juego";
import { uniqueSlug } from "./slug";
import { Button, Card, ErrorBox, Field, Loading, MediaPicker, PageHeader, SaveBar, subirArchivo, useRepoJson, vistaPrevia } from "./ui";

const JUEGO_PATH = "src/data/juego.json";

function nueva(): JuegoEgresado {
  return { id: "", slug: "", nombre: "", tipo: "Emprendedor", foto: null, logo: null, pais: "Colombia", programa: "", empresa: "", ocupacion: "" };
}

export default function JuegoEditor({ config }: { config: GithubConfig }) {
  const { data, setData, loading, error, saving, dirty, message, setMessage, save } = useRepoJson<JuegoEgresado[]>(config, JUEGO_PATH);
  const [editando, setEditando] = useState<number | null>(null); // índice en la lista, o -1 para una carta nueva
  const [borrador, setBorrador] = useState<JuegoEgresado | null>(null);
  const [subiendo, setSubiendo] = useState<"foto" | "logo" | null>(null);

  if (loading) return <Loading text="Cargando cartas…" />;
  if (error || !data) return <ErrorBox text={error ?? "No se pudo cargar."} />;

  const lista = data;

  function abrir(i: number) {
    setEditando(i);
    setBorrador(i === -1 ? nueva() : { ...lista[i] });
    setMessage(null);
  }

  function cerrar() {
    setEditando(null);
    setBorrador(null);
  }

  function aplicar() {
    if (!borrador) return;
    if (!borrador.nombre.trim()) {
      setMessage({ ok: false, text: "La carta necesita al menos el nombre." });
      return;
    }
    let carta = borrador;
    if (editando === -1) {
      const slug = uniqueSlug(borrador.nombre, new Set(lista.map((c) => c.slug)));
      const max = lista.reduce((m, c) => Math.max(m, Number(c.id.replace(/\D/g, "")) || 0), 0);
      carta = { ...borrador, slug, id: `juego-${String(max + 1).padStart(2, "0")}` };
      setData([...lista, carta]);
    } else if (editando !== null) {
      setData(lista.map((c, j) => (j === editando ? carta : c)));
    }
    cerrar();
  }

  function eliminar(i: number) {
    if (!confirm(`¿Quitar la carta de "${lista[i].nombre}" del juego?`)) return;
    setData(lista.filter((_, j) => j !== i));
    cerrar();
  }

  async function subir(tipo: "foto" | "logo", file: File) {
    if (!borrador) return;
    const base = borrador.slug || uniqueSlug(borrador.nombre || "carta", new Set(lista.map((c) => c.slug)));
    setSubiendo(tipo);
    try {
      const ruta = await subirArchivo(config, file, tipo === "foto" ? "juego" : "juego/logos", `${base}${tipo === "logo" ? "-logo" : ""}`);
      setBorrador({ ...borrador, [tipo]: ruta });
      setMessage({ ok: true, text: `${tipo === "foto" ? "Foto" : "Logo"} subido. Recuerda pulsar "Aplicar" y luego "Guardar cambios".` });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "No se pudo subir el archivo." });
    } finally {
      setSubiendo(null);
    }
  }

  const b = borrador;
  const upd = (k: keyof JuegoEgresado, v: string | null) => b && setBorrador({ ...b, [k]: v });

  return (
    <>
      <PageHeader
        title="Juego de cartas"
        description="Las cartas del juego “Conoce a nuestros egresados”. En la página salen en orden al azar, como una baraja."
        actions={<Button variant="primary" onClick={() => abrir(-1)}>+ Agregar carta</Button>}
      />

      {b && (
        <Card
          title={editando === -1 ? "Nueva carta" : `Editar carta: ${b.nombre}`}
          right={<Button variant="ghost" small onClick={cerrar}>✕ Cerrar</Button>}
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre completo" value={b.nombre} onChange={(v) => upd("nombre", v)} />
              <label className="block">
                <span className="mb-1 block text-[13px] font-medium text-[#1d2327]">Tipo</span>
                <select
                  value={b.tipo}
                  onChange={(e) => upd("tipo", e.target.value)}
                  className="w-full rounded border border-[#8c8f94] bg-white px-3 py-2 text-sm text-[#1d2327] focus:border-[#ef7d00] focus:outline-none"
                >
                  <option value="Emprendedor">Emprendedor</option>
                  <option value="Empleado">Empleado</option>
                </select>
              </label>
              <Field label="País o ciudad" value={b.pais} onChange={(v) => upd("pais", v)} placeholder="Ej: Barcelona, España" />
              <Field label="Programa USB" value={b.programa} onChange={(v) => upd("programa", v)} />
              <Field label={b.tipo === "Emprendedor" ? "Empresa o emprendimiento" : "Empresa"} value={b.empresa} onChange={(v) => upd("empresa", v)} />
              <Field label="Ocupación" value={b.ocupacion} onChange={(v) => upd("ocupacion", v)} help="Corto: una o dos líneas, para que quepa en la carta." />
            </div>
            <div className="space-y-5">
              <MediaPicker
                label="Foto"
                round
                value={b.foto}
                previewUrl={vistaPrevia(config, b.foto)}
                uploading={subiendo === "foto"}
                onFile={(f) => subir("foto", f)}
                onClear={() => upd("foto", null)}
                help="Una foto de la cara, cuadrada si es posible."
              />
              <MediaPicker
                label="Logo de la empresa"
                value={b.logo}
                previewUrl={vistaPrevia(config, b.logo)}
                uploading={subiendo === "logo"}
                onFile={(f) => subir("logo", f)}
                onClear={() => upd("logo", null)}
                help="Sale en la parte de atrás de la carta."
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-[#dcdcde] pt-4">
            <Button variant="primary" onClick={aplicar}>Aplicar</Button>
            <Button onClick={cerrar}>Cancelar</Button>
            {editando !== null && editando >= 0 && (
              <span className="ml-auto">
                <Button variant="danger" onClick={() => eliminar(editando)}>Quitar del juego</Button>
              </span>
            )}
          </div>
        </Card>
      )}

      <Card title={`${lista.length} cartas`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lista.map((c, i) => {
            const foto = vistaPrevia(config, c.foto);
            const logo = vistaPrevia(config, c.logo);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => abrir(i)}
                className={`group flex items-center gap-3 rounded border p-3 text-left transition-colors hover:border-[#ef7d00] hover:bg-[#fff4e8] ${
                  editando === i ? "border-[#ef7d00] bg-[#fff4e8]" : "border-[#dcdcde] bg-white"
                }`}
              >
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#f0f0f1]">
                  {foto && <img src={foto} alt="" className="h-full w-full object-cover object-top" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[#1d2327]">{c.nombre}</span>
                  <span className="block truncate text-xs text-[#646970]">{c.empresa || "—"}</span>
                  <span className="mt-1 inline-flex items-center gap-1.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] ${c.tipo === "Emprendedor" ? "bg-[#fff4e8] text-[#b35c00]" : "bg-[#f0f6fc] text-[#2271b1]"}`}>
                      {c.tipo}
                    </span>
                    {!logo && <span className="rounded bg-[#fcf9e8] px-1.5 py-0.5 text-[10px] text-[#996800]">Sin logo</span>}
                  </span>
                </span>
                {logo && <img src={logo} alt="" className="h-8 w-12 shrink-0 object-contain" />}
              </button>
            );
          })}
        </div>
      </Card>

      <SaveBar dirty={dirty} saving={saving} message={message} onSave={() => save("Panel admin: actualizar cartas del juego")} />
    </>
  );
}
