// Genera el hash que va en src/admin/adminAuth.json para cambiar el usuario
// o la clave del panel de administración (/admin).
//
// Uso:
//   node scripts/generar-clave-admin.mjs "mi-nueva-clave-segura"
//
// Copia el hash que imprime y pégalo como "hashClave" en
// src/admin/adminAuth.json (y cambia "usuario" si también quieres otro
// usuario). Después haz commit y push del archivo para que quede activo.
import { createHash } from "node:crypto";

const clave = process.argv[2];

if (!clave) {
  console.error('Falta la clave. Uso: node scripts/generar-clave-admin.mjs "mi-nueva-clave"');
  process.exit(1);
}

if (clave.length < 8) {
  console.warn("Aviso: se recomienda una clave de al menos 8 caracteres, idealmente más larga y no obvia.");
}

const hash = createHash("sha256").update(clave).digest("hex");
console.log("hashClave:", hash);
