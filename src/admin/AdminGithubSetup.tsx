import { useState } from "react";
import { saveGithubConfig, testConnection, type GithubConfig } from "./github";

// Pantalla de configuración técnica única — SOLO la usa la persona que
// despliega el sitio (Jose), no la jefa. Conecta el panel con el
// repositorio de GitHub guardando un token de acceso en este navegador
// (localStorage), nunca en el repositorio.
export default function AdminGithubSetup({ onSaved }: { onSaved: () => void }) {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [token, setToken] = useState("");
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleTestAndSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setTesting(true);
    const config: GithubConfig = {
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim() || "main",
      token: token.trim(),
    };
    const result = await testConnection(config);
    setTesting(false);
    if (result.ok) {
      saveGithubConfig(config);
      setStatus({ ok: true, message: "Conexión exitosa. Guardando…" });
      setTimeout(onSaved, 400);
    } else {
      setStatus({ ok: false, message: result.error });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-10">
      <form
        onSubmit={handleTestAndSave}
        className="w-full max-w-lg rounded-2xl border border-paper/10 bg-ink-2/60 p-8"
      >
        <p className="mb-1 text-xs uppercase tracking-[0.3em] text-gold">Configuración técnica</p>
        <h1 className="font-display mb-2 text-2xl font-light text-paper">Conectar con GitHub</h1>
        <p className="mb-6 text-sm leading-relaxed text-paper-dim">
          Esta pantalla solo se llena <strong className="text-paper">una vez</strong>, al preparar el sitio. Conecta
          el panel con el repositorio de GitHub para que los cambios se guarden ahí. Sigue la guía paso a paso para
          crear el repositorio y el token antes de llenar esto.
        </p>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-paper-dim">
            Usuario u organización de GitHub
          </span>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="p.ej. jperez-usb"
            className="w-full rounded-lg border border-paper/15 bg-ink px-4 py-2.5 text-paper focus:border-gold/60 focus:outline-none"
            required
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-paper-dim">
            Nombre del repositorio
          </span>
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="p.ej. alumni-usb-cali"
            className="w-full rounded-lg border border-paper/15 bg-ink px-4 py-2.5 text-paper focus:border-gold/60 focus:outline-none"
            required
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-paper-dim">Rama (branch)</span>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            className="w-full rounded-lg border border-paper/15 bg-ink px-4 py-2.5 text-paper focus:border-gold/60 focus:outline-none"
          />
        </label>

        <label className="mb-2 block">
          <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-paper-dim">
            Token de acceso personal (Personal Access Token)
          </span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_…"
            className="w-full rounded-lg border border-paper/15 bg-ink px-4 py-2.5 text-paper focus:border-gold/60 focus:outline-none"
            required
          />
        </label>
        <p className="mb-6 text-xs text-paper-dim">
          El token se guarda solo en este navegador (nunca se sube al repositorio) y es lo que autoriza a guardar
          cambios. Ver el Paso 4 de la guía para crearlo.
        </p>

        {status && (
          <p className={`mb-4 text-sm ${status.ok ? "text-emerald-400" : "text-red-400"}`}>{status.message}</p>
        )}

        <button
          type="submit"
          disabled={testing}
          className="w-full rounded-full bg-gold px-6 py-3 text-sm uppercase tracking-[0.15em] text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {testing ? "Probando conexión…" : "Probar conexión y guardar"}
        </button>

        <a href="#/" className="mt-6 block text-center text-xs text-paper-dim hover:text-gold">
          ← Volver al sitio
        </a>
      </form>
    </div>
  );
}
