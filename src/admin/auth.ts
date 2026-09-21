import adminAuth from "./adminAuth.json";

const SESSION_KEY = "alumni-admin-session";

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function checkLogin(usuario: string, clave: string): Promise<boolean> {
  if (usuario.trim().toLowerCase() !== adminAuth.usuario.trim().toLowerCase()) return false;
  const hash = await sha256Hex(clave);
  return hash === adminAuth.hashClave;
}

export function isLoggedIn(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function markLoggedIn() {
  sessionStorage.setItem(SESSION_KEY, "1");
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}
