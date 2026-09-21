import { useState } from "react";
import { checkLogin } from "./auth";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const ok = await checkLogin(usuario, clave);
    setLoading(false);
    if (ok) {
      onSuccess();
    } else {
      setError("Usuario o clave incorrectos.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-paper/10 bg-ink-2/60 p-8"
      >
        <p className="mb-1 text-xs uppercase tracking-[0.3em] text-gold">Alumni USB Cali</p>
        <h1 className="font-display mb-6 text-2xl font-light text-paper">Panel de administración</h1>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-paper-dim">Usuario</span>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            className="w-full rounded-lg border border-paper/15 bg-ink px-4 py-2.5 text-paper focus:border-gold/60 focus:outline-none"
            required
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-paper-dim">Clave</span>
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-paper/15 bg-ink px-4 py-2.5 text-paper focus:border-gold/60 focus:outline-none"
            required
          />
        </label>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gold px-6 py-3 text-sm uppercase tracking-[0.15em] text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Verificando…" : "Entrar"}
        </button>

        <a href="#/" className="mt-6 block text-center text-xs text-paper-dim hover:text-gold">
          ← Volver al sitio
        </a>
      </form>
    </div>
  );
}
