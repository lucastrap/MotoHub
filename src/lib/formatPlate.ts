export const PLATE_REGEX = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;

export function formatPlate(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
}
