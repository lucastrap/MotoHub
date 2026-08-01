const EUROS = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const KM = new Intl.NumberFormat("fr-FR");

/** Montant en euros au format francais : 1 234,56 EUR avec l'espace insecable. */
export function formatEuros(value: number | null | undefined): string {
  if (value == null) return "";
  return EUROS.format(value);
}

/** Kilometrage au format francais, sans unite. */
export function formatKm(value: number | null | undefined): string {
  if (value == null) return "";
  return KM.format(value);
}
