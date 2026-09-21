// Cliente mínimo para la API de GitHub (Contents API), usado por el panel de
// administración para leer y guardar los archivos de datos (egresados.json,
// media.json, content.json) y las fotos/logos directamente en el repositorio.
// Todo corre en el navegador — el token nunca sale de esta pestaña salvo
// hacia api.github.com.

export interface GithubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

const STORAGE_KEY = "alumni-admin-github-config";

export function loadGithubConfig(): GithubConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GithubConfig;
    if (!parsed.owner || !parsed.repo || !parsed.token) return null;
    return { ...parsed, branch: parsed.branch || "main" };
  } catch {
    return null;
  }
}

export function saveGithubConfig(config: GithubConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearGithubConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

function apiBase(config: GithubConfig) {
  return `https://api.github.com/repos/${config.owner}/${config.repo}`;
}

function authHeaders(config: GithubConfig) {
  return {
    Authorization: `Bearer ${config.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export class GithubApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handle(res: Response) {
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body.message || "";
    } catch {
      /* ignore */
    }
    const hint =
      res.status === 401
        ? "El token no es válido o expiró."
        : res.status === 403
          ? "El token no tiene permiso para escribir en este repositorio."
          : res.status === 404
            ? "No se encontró el repositorio o el archivo — revisa usuario, repositorio y rama."
            : "";
    throw new GithubApiError([hint, detail].filter(Boolean).join(" ") || `Error de GitHub (${res.status})`, res.status);
  }
  return res.json();
}

export interface RemoteFile {
  path: string;
  sha: string;
  content: string; // texto plano, ya decodificado
}

// Decodifica base64 respetando UTF-8 (los nombres con tildes/ñ vienen así).
function decodeBase64Utf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function encodeUtf8Base64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export async function getFile(config: GithubConfig, path: string): Promise<RemoteFile> {
  const res = await fetch(`${apiBase(config)}/contents/${path}?ref=${encodeURIComponent(config.branch)}`, {
    headers: authHeaders(config),
  });
  const data = await handle(res);
  return { path, sha: data.sha, content: decodeBase64Utf8(data.content) };
}

export async function getFileIfExists(config: GithubConfig, path: string): Promise<RemoteFile | null> {
  try {
    return await getFile(config, path);
  } catch (e) {
    if (e instanceof GithubApiError && e.status === 404) return null;
    throw e;
  }
}

export async function putTextFile(
  config: GithubConfig,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<{ sha: string }> {
  const res = await fetch(`${apiBase(config)}/contents/${path}`, {
    method: "PUT",
    headers: { ...authHeaders(config), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: encodeUtf8Base64(content),
      branch: config.branch,
      ...(sha ? { sha } : {}),
    }),
  });
  const data = await handle(res);
  return { sha: data.content.sha };
}

// Sube un archivo binario (foto/logo) ya en base64 puro (sin el prefijo
// data:...;base64,). Si el archivo ya existe hay que pasar su sha para
// reemplazarlo; si no se pasa, intenta averiguarlo solo.
export async function putBinaryFile(
  config: GithubConfig,
  path: string,
  base64Content: string,
  message: string
): Promise<{ sha: string }> {
  const existing = await getFileIfExists(config, path);
  const res = await fetch(`${apiBase(config)}/contents/${path}`, {
    method: "PUT",
    headers: { ...authHeaders(config), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: base64Content,
      branch: config.branch,
      ...(existing ? { sha: existing.sha } : {}),
    }),
  });
  const data = await handle(res);
  return { sha: data.content.sha };
}

export async function deleteFile(config: GithubConfig, path: string, message: string): Promise<void> {
  const existing = await getFileIfExists(config, path);
  if (!existing) return;
  const res = await fetch(`${apiBase(config)}/contents/${path}`, {
    method: "DELETE",
    headers: { ...authHeaders(config), "Content-Type": "application/json" },
    body: JSON.stringify({ message, sha: existing.sha, branch: config.branch }),
  });
  await handle(res);
}

// Verifica que el token y el repositorio funcionan, sin escribir nada.
export async function testConnection(config: GithubConfig): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${apiBase(config)}`, { headers: authHeaders(config) });
    if (!res.ok) {
      await handle(res);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}
