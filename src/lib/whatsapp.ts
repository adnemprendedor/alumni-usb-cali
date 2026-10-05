/**
 * Construye un enlace de WhatsApp (wa.me) a partir del teléfono del negocio,
 * solo cuando el número tiene forma de celular colombiano (10 dígitos que
 * empiezan en 3, con o sin el +57 ya incluido). Si no se puede confirmar eso,
 * devuelve null en vez de arriesgar un enlace que no abre un chat real —
 * muchos de los teléfonos registrados son fijos, no celulares con WhatsApp.
 */
export function whatsappLink(telefono: string | null | undefined): string | null {
  if (!telefono) return null;
  const digitos = telefono.replace(/\D/g, "");

  if (digitos.length === 10 && digitos.startsWith("3")) {
    return `https://wa.me/57${digitos}`;
  }
  if (digitos.length === 12 && digitos.startsWith("573")) {
    return `https://wa.me/${digitos}`;
  }
  return null;
}
