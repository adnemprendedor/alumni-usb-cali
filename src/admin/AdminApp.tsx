import { useState } from "react";
import AdminLogin from "./AdminLogin";
import AdminGithubSetup from "./AdminGithubSetup";
import EgresadosEditor from "./EgresadosEditor";
import ContentEditor from "./ContentEditor";
import { isLoggedIn, logout, markLoggedIn } from "./auth";
import { clearGithubConfig, loadGithubConfig, type GithubConfig } from "./github";

type Tab = "egresados" | "textos";

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [config, setConfig] = useState<GithubConfig | null>(loadGithubConfig());
  const [tab, setTab] = useState<Tab>("egresados");
  const [showTechnical, setShowTechnical] = useState(false);

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
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-10 border-b border-paper/10 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Alumni USB Cali</p>
            <h1 className="font-display text-lg font-light text-paper">Panel de administración</h1>
          </div>

          <nav className="flex items-center gap-2 rounded-full border border-paper/10 bg-ink-2/60 p-1">
            <button
              onClick={() => setTab("egresados")}
              className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
                tab === "egresados" ? "bg-gold text-ink" : "text-paper-dim hover:text-paper"
              }`}
            >
              Egresados
            </button>
            <button
              onClick={() => setTab("textos")}
              className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
                tab === "textos" ? "bg-gold text-ink" : "text-paper-dim hover:text-paper"
              }`}
            >
              Textos del sitio
            </button>
          </nav>

          <div className="flex items-center gap-3 text-xs">
            <a href="#/" className="text-paper-dim hover:text-gold">
              Ver sitio →
            </a>
            <button onClick={() => setShowTechnical(true)} className="text-paper-dim hover:text-gold">
              Configuración técnica
            </button>
            <button onClick={handleDisconnect} className="text-paper-dim hover:text-red-400">
              Desconectar GitHub
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full border border-paper/15 px-3 py-1.5 uppercase tracking-[0.1em] text-paper-dim hover:border-gold/40 hover:text-gold"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl">
        {tab === "egresados" ? <EgresadosEditor config={config} /> : <ContentEditor config={config} />}
      </main>
    </div>
  );
}
