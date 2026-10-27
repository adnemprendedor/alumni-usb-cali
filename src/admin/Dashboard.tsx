import { useEffect, useState } from "react";
import { getFile, type GithubConfig } from "./github";
import type { SitioConfig } from "../data/sitio";
import { Card, PageHeader } from "./ui";
import type { Seccion } from "./AdminApp";

interface Resumen {
  egresados: number;
  conLogo: number;
  cartas: number;
  seccionesVisibles: number;
  seccionesTotal: number;
  destacado: string;
}

export default function Dashboard({ config, ir }: { config: GithubConfig; ir: (s: Seccion) => void }) {
  const [r, setR] = useState<Resumen | null>(null);

  useEffect(() => {
    Promise.all([
      getFile(config, "src/data/egresados.json"),
      getFile(config, "src/data/media.json"),
      getFile(config, "src/data/juego.json"),
      getFile(config, "src/data/sitio.json"),
    ])
      .then(([e, m, j, s]) => {
        const egresados = JSON.parse(e.content) as { slug: string; nombreEmprendimiento: string }[];
        const media = JSON.parse(m.content) as Record<string, { logo?: string }>;
        const sitio = JSON.parse(s.content) as SitioConfig;
        const elegido = egresados.find((x) => x.slug === sitio.destacadoSemana?.slug);
        setR({
          egresados: egresados.length,
          conLogo: egresados.filter((x) => media[x.slug]?.logo).length,
          cartas: (JSON.parse(j.content) as unknown[]).length,
          seccionesVisibles: sitio.secciones.filter((x) => x.visible).length,
          seccionesTotal: sitio.secciones.length,
          destacado: sitio.destacadoSemana?.modo === "manual" && elegido ? elegido.nombreEmprendimiento : "Automático (rota cada semana)",
        });
      })
      .catch(() => {});
  }, [config]);

  const accesos: { s: Seccion; icono: string; titulo: string; texto: string; dato?: string }[] = [
    { s: "egresados", icono: "👥", titulo: "Egresados del directorio", texto: "Agregar, editar o quitar egresados, con su foto y logo.", dato: r ? `${r.egresados} egresados · ${r.conLogo} con logo` : undefined },
    { s: "juego", icono: "🃏", titulo: "Juego de cartas", texto: "Las cartas del juego “Conoce a nuestros egresados”.", dato: r ? `${r.cartas} cartas` : undefined },
    { s: "secciones", icono: "🧩", titulo: "Secciones de la página", texto: "Ordenar, mostrar u ocultar las partes de la página de inicio.", dato: r ? `${r.seccionesVisibles} de ${r.seccionesTotal} visibles` : undefined },
    { s: "destacado", icono: "⭐", titulo: "Emprendedor de la semana", texto: "Elegirlo a mano o dejar que rote solo.", dato: r?.destacado },
    { s: "textos", icono: "✏️", titulo: "Textos de la página", texto: "Títulos, subtítulos, portada y la sección Participa." },
    { s: "videos", icono: "🎬", titulo: "Historias en video", texto: "Video principal y reels de Instagram." },
    { s: "menu", icono: "🧭", titulo: "Menú, pie y redes", texto: "Enlaces del menú, pie de página, contactos y redes sociales." },
  ];

  return (
    <>
      <PageHeader title="Escritorio" description="Bienvenida al panel de ADN Emprendedor. Elige qué quieres cambiar." />

      <Card>
        <ol className="grid gap-4 text-sm text-[#1d2327] sm:grid-cols-3">
          <li>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#ef7d00]">1 · Edita</span>
            Entra a cualquier sección del menú de la izquierda y cambia lo que necesites.
          </li>
          <li>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#ef7d00]">2 · Guarda</span>
            Pulsa el botón naranja <strong>“Guardar cambios”</strong> que está abajo en cada pantalla.
          </li>
          <li>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#ef7d00]">3 · Listo</span>
            La página se actualiza sola en 1 o 2 minutos. Recarga la página para verlo.
          </li>
        </ol>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {accesos.map((a) => (
          <button
            key={a.s}
            type="button"
            onClick={() => ir(a.s)}
            className="group rounded-md border border-[#dcdcde] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#ef7d00] hover:shadow-md"
          >
            <span className="text-2xl" aria-hidden>
              {a.icono}
            </span>
            <span className="mt-2 block text-base font-semibold text-[#1d2327] group-hover:text-[#b35c00]">{a.titulo}</span>
            <span className="mt-1 block text-sm text-[#50575e]">{a.texto}</span>
            {a.dato && <span className="mt-3 inline-block rounded bg-[#f0f0f1] px-2 py-0.5 text-xs text-[#50575e]">{a.dato}</span>}
          </button>
        ))}
      </div>
    </>
  );
}
