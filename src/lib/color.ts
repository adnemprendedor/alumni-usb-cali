/** Deterministic small integer from a string, used to seed per-profile Portrait variety. */
export function hueSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) % 997;
  }
  return h;
}
