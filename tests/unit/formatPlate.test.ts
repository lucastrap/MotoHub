// Test de la fonction de formatage d'immatriculation SIV
// Logique extraite de src/app/garage/new/page.tsx

function formatPlate(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
}

const PLATE_REGEX = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;

describe("formatPlate — format SIV automatique", () => {
  it("retourne une chaîne vide si l'entrée est vide", () => {
    expect(formatPlate("")).toBe("");
  });

  it("retourne les 2 premières lettres brutes", () => {
    expect(formatPlate("AB")).toBe("AB");
  });

  it("insère le premier tiret après 2 caractères", () => {
    expect(formatPlate("AB1")).toBe("AB-1");
    expect(formatPlate("AB123")).toBe("AB-123");
  });

  it("insère le second tiret après 5 caractères (2 lettres + 3 chiffres)", () => {
    expect(formatPlate("AB123C")).toBe("AB-123-C");
    expect(formatPlate("AB123CD")).toBe("AB-123-CD");
  });

  it("tronque à 7 caractères significatifs", () => {
    expect(formatPlate("AB123CDE")).toBe("AB-123-CD");
  });

  it("convertit en majuscules", () => {
    expect(formatPlate("ab123cd")).toBe("AB-123-CD");
  });

  it("ignore les tirets et espaces saisis manuellement", () => {
    expect(formatPlate("AB-123-CD")).toBe("AB-123-CD");
    expect(formatPlate("AB 123 CD")).toBe("AB-123-CD");
  });

  it("ignore les caractères spéciaux", () => {
    expect(formatPlate("AB!123@CD")).toBe("AB-123-CD");
  });
});

describe("Regex validation plaque SIV", () => {
  it("valide une plaque correcte", () => {
    expect(PLATE_REGEX.test("AB-123-CD")).toBe(true);
    expect(PLATE_REGEX.test("ZZ-999-ZZ")).toBe(true);
  });

  it("rejette une plaque sans tirets", () => {
    expect(PLATE_REGEX.test("AB123CD")).toBe(false);
  });

  it("rejette une plaque avec des chiffres aux mauvaises positions", () => {
    expect(PLATE_REGEX.test("12-ABC-DE")).toBe(false);
  });

  it("rejette une plaque trop courte", () => {
    expect(PLATE_REGEX.test("AB-12-CD")).toBe(false);
  });

  it("rejette une plaque trop longue", () => {
    expect(PLATE_REGEX.test("AB-1234-CD")).toBe(false);
  });
});
