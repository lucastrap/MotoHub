import { formatEuros, formatKm } from "@/lib/format";

// Les espaces produits par Intl sont des espaces insécables (U+00A0 / U+202F) ;
// on les normalise en espace ordinaire pour comparer sans dépendre de la version d'ICU.
const norm = (s: string) => s.replace(/ | /g, " ");

describe("formatEuros", () => {
  it("retourne une chaîne vide pour null ou undefined", () => {
    expect(formatEuros(null)).toBe("");
    expect(formatEuros(undefined)).toBe("");
  });

  it("formate un montant à la française avec deux décimales", () => {
    expect(norm(formatEuros(1234.56))).toBe("1 234,56 €");
  });

  it("garde les deux décimales pour un entier", () => {
    expect(norm(formatEuros(0))).toBe("0,00 €");
  });
});

describe("formatKm", () => {
  it("retourne une chaîne vide pour null ou undefined", () => {
    expect(formatKm(null)).toBe("");
    expect(formatKm(undefined)).toBe("");
  });

  it("sépare les milliers sans unité", () => {
    expect(norm(formatKm(13200))).toBe("13 200");
  });
});
