/** Deterministic small integer from a string, used to seed per-profile Portrait variety. */
export function hueSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) % 997;
  }
  return h;
}

/**
 * Tono de la gama Alumni USB Cali para un número cualquiera: va del azul
 * marino (≈236°) al morado y al rosa (≈346°) del logo de Alumni, para que
 * los fondos generados de tarjetas y retratos se sientan de la marca.
 */
export function alumniHue(seed: number): number {
  return 236 + ((((seed * 37) % 110) + 110) % 110);
}

/** Naranja de acento de Alumni para líneas y motivos sobre fondos oscuros. */
export const ALUMNI_STROKE = "hsla(28, 95%, 62%, 0.32)";
