import { useEffect, useState } from "react";
import AdminLogin from "./AdminLogin";
import AdminGithubSetup from "./AdminGithubSetup";
import EgresadosEditor from "./EgresadosEditor";
import ContentEditor from "./ContentEditor";
import Dashboard from "./Dashboard";
import JuegoEditor from "./JuegoEditor";
import SeccionesEditor from "./SeccionesEditor";
import DestacadoEditor from "./DestacadoEditor";
import MenuPieEditor from "./MenuPieEditor";
import VideosEditor from "./VideosEditor";
import { isLoggedIn, logout, markLoggedIn } from "./auth";
import { clearGithubConfig, loadGithubConfig, type GithubConfig } from "./github";
import usbLogo from "../assets/brand/usb-logo.png";

export type Seccion = "inicio" | "egresados" | "juego" | "secciones" | "destacado" | "textos" | "videos" | "menu";

const MENU: { id: Seccion; icono: string; label: string; grupo?: string }[] = [
  { id: "inicio", icono: "🏠", label: "Escritorio" },
  { id: "egresados", icono: "👥", label: "Egresados", grupo: "Contenido" },
  { id: "juego", icono: "🃏", label: "Juego de cartas" },
  { id: "destacado", icono: "⭐", label: "Emprendedor de la semana" },
  { id: "videos", icono: "🎬", label: "Historias en video" },
  { id: "secciones", icono: "🧩", label: "Secciones de la página", grupo: "Apariencia" },
  { id: "textos", icono: "✏️", label: "Textos de la página" },
  { id: "menu", icono: "🧭", label: "Menú, pie y redes" },
];

const SECCION_KEY = "alumni-admin-seccion";

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [config, setConfig] = useState<GithubConfig | null>(loadGithubConfig());
  const [seccion, setSeccion] = useState<Seccion>(() => {
    try {
      return (sessionStorage.getItem(SECCION_KEY) as Seccion) || "inicio";
    } catch {
      return "inicio";
    }
  });
  const [showTechnical, setShowTechnical] = useState(false);
  const [menuMovil, setMenuMovil] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(SECCION_KEY, seccion);
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
    window.scrollTo({ top: 0 });
    setMenuMovil(false);
  }, [seccion]);

  if (!loggedIn) {
    return (
      <AdminLogin
        onSuccess={() => {
          markLoggedIn();
          setLoggedIn(true);
        }}
      />
    );
  }

  if (!config || showTechnical) {
    return (
      <AdminGithubSetup
        onSaved={() => {
          setConfig(loadGithubConfig());
          setShowTechnical(false);
        }}
      />
    );
  }

  function handleLogout() {
    logout();
    setLoggedIn(false);
  }

  function handleDisconnect() {
    if (!confirm("¿Olvidar la configuración técnica de GitHub en este navegador?")) return;
    clearGithubConfig();
    setConfig(null);
  }

  return (
    <div className="admin-claro min-h-screen bg-[#f0f0f1] text-[#1d2327]">
      {/* barra superior, como la de WordPress */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-12 items-center justify-between bg-[#1d1d1b] px-3 text-[13px] text-[#f0f0f1]">
        <div className="flex items-center gap-3">
          <button className="rounded px-2 py-1 text-lg lg:hidden" aria-label="Abrir menú" onClick={() => setMenuMovil((v) => !v)}>
            ☰
          </button>
          <span className="hidden h-8 items-center rounded bg-white px-2 sm:flex">
            <img src={usbLogo} alt="" className="h-6 w-auto" />
          </span>
          <span className="font-semibold">ADN Emprendedor<span className="hidden sm:inline"> · Panel</span></span>
          <a href="#/" target="_blank" rel="noopener noreferrer" className="rounded px-2 py-1 text-[#c3c4c7] hover:bg-white/10 hover:text-white">
            ↗<span className="hidden sm:inline"> Ver sitio</span>
          </a>
        </div>
        <button onClick={handleLogout} className="rounded px-2 py-1 text-[#c3c4c7] hover:bg-white/10 hover:text-white">
          Cerrar sesión
        </button>
      </header>

      {/* menú lateral */}
      <aside
        className={`fixed bottom-0 left-0 top-12 z-30 w-60 overflow-y-auto bg-[#262624] pb-6 pt-2 transition-transform lg:translate-x-0 ${
          menuMovil ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav>
          {MENU.map((m) => (
            <div key={m.id}>
              {m.grupo && <p className="mt-4 px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#8c8f94]">{m.grupo}</p>}
              <button
                type="button"
                onClick={() => setSeccion(m.id)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  seccion === m.id ? "bg-[#ef7d00] font-medium text-white" : "text-[#f0f0f1] hover:bg-[#313130] hover:text-[#ffab1b]"
                }`}
              >
                <span aria-hidden className="w-5 text-center">
                  {m.icono}
                </span>
                {m.label}
              </button>
            </div>
          ))}
          <p className="mt-6 px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#8c8f94]">Ajustes</p>
          <button type="button" onClick={() => setShowTechnical(true)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#c3c4c7] hover:bg-[#313130] hover:text-white">
            <span aria-hidden className="w-5 text-center">⚙️</span>
            Configuración técnica
          </button>
          <button type="button" onClick={handleDisconnect} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#c3c4c7] hover:bg-[#313130] hover:text-[#ff8085]">
            <span aria-hidden className="w-5 text-center">⏏️</span>
            Desconectar GitHub
          </button>
        </nav>
      </aside>
      {menuMovil && <div className="fixed inset-0 top-12 z-20 bg-black/40 lg:hidden" onClick={() => setMenuMovil(false)} />}

      <main className="px-4 pb-10 pt-20 sm:px-8 lg:ml-60">
        <div className="mx-auto max-w-6xl">
          {seccion === "inicio" && <Dashboard config={config} ir={setSeccion} />}
          {seccion === "egresados" && (
            <>
              <h1 className="mb-1 text-2xl font-semibold">Egresados del directorio</h1>
              <p className="mb-2 text-sm text-[#50575e]">Busca un egresado a la izquierda para editarlo, o agrega uno nuevo.</p>
              <div className="admin-legacy -mx-6">
                <EgresadosEditor config={config} />
              </div>
            </>
          )}
          {seccion === "textos" && (
            <>
              <h1 className="mb-1 text-2xl font-semibold">Textos de la página</h1>
              <p className="mb-2 text-sm text-[#50575e]">Los títulos y textos de cada parte de la página de inicio.</p>
              <div className="admin-legacy -mx-6">
                <ContentEditor config={config} />
              </div>
            </>
          )}
          {seccion === "juego" && <JuegoEditor config={config} />}
          {seccion === "secciones" && <SeccionesEditor config={config} />}
          {seccion === "destacado" && <DestacadoEditor config={config} />}
          {seccion === "videos" && <VideosEditor config={config} />}
          {seccion === "menu" && <MenuPieEditor config={config} />}
        </div>
      </main>
    </div>
  );
}
