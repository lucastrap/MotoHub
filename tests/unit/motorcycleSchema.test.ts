
import { motorcycleSchema as schema, buildMotorcycleSchema } from "@/lib/schemas/motorcycle";

describe("Schéma Zod   ajout de moto", () => {
  const validBase = {
    brand: "Yamaha",
    model: "MT-07",
    year: 2022,
    currentMileage: 12500,
  };

  it("accepte des données valides minimales", () => {
    expect(() => schema.parse(validBase)).not.toThrow();
  });

  it("accepte un formulaire complet valide", () => {
    expect(() =>
      schema.parse({
        ...validBase,
        color: "Rouge",
        licensePlate: "AB-123-CD",
        vin: "JKAZX4R14XA000001",
        purchaseDate: "2022-06-15",
        purchasePrice: 8500,
      })
    ).not.toThrow();
  });

  it("rejette si la marque est vide", () => {
    expect(() => schema.parse({ ...validBase, brand: "" })).toThrow();
  });

  it("rejette si le modèle est vide", () => {
    expect(() => schema.parse({ ...validBase, model: "" })).toThrow();
  });

  it("rejette une année inférieure à 1990", () => {
    expect(() => schema.parse({ ...validBase, year: 1985 })).toThrow();
  });

  it("rejette un kilométrage négatif", () => {
    expect(() => schema.parse({ ...validBase, currentMileage: -1 })).toThrow();
  });

  it("rejette une immatriculation hors format SIV", () => {
    expect(() =>
      schema.parse({ ...validBase, licensePlate: "123ABC" })
    ).toThrow();
  });

  it("accepte une immatriculation vide (champ optionnel)", () => {
    const result = schema.parse({ ...validBase, licensePlate: "" });
    expect(result.licensePlate).toBeUndefined();
  });

  it("accepte un VIN vide (champ optionnel)", () => {
    const result = schema.parse({ ...validBase, vin: "" });
    expect(result.vin).toBeUndefined();
  });

  it("accepte un prix vide sans erreur", () => {
    const result = schema.parse({ ...validBase, purchasePrice: "" });
    expect(result.purchasePrice).toBeUndefined();
  });

  it("rejette un prix d'achat négatif", () => {
    expect(() =>
      schema.parse({ ...validBase, purchasePrice: -500 })
    ).toThrow();
  });

  it("coerce correctement le kilométrage depuis une chaîne", () => {
    const result = schema.parse({ ...validBase, currentMileage: "12500" });
    expect(result.currentMileage).toBe(12500);
  });
});

describe("Schéma Zod   règles ajoutées", () => {
  const base = { brand: "Yamaha", model: "MT-07", year: 2022, currentMileage: 12500 };
  const s = buildMotorcycleSchema(2026, "2026-07-30");

  it("refuse une date d'achat dans le futur", () => {
    const r = s.safeParse({ ...base, purchaseDate: "2026-07-31" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toMatch(/futur/i);
  });

  it("accepte une date d'achat passée ou du jour", () => {
    expect(s.safeParse({ ...base, purchaseDate: "2026-07-30" }).success).toBe(true);
    expect(s.safeParse({ ...base, purchaseDate: "2010-01-05" }).success).toBe(true);
  });

  it("laisse un prix vide non renseigné au lieu de le ramener à zéro", () => {
    const r = s.safeParse({ ...base, purchasePrice: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.purchasePrice).toBeUndefined();
  });

  it("refuse un prix négatif", () => {
    expect(s.safeParse({ ...base, purchasePrice: -1 }).success).toBe(false);
  });

  it("refuse un kilométrage négatif ou aberrant", () => {
    expect(s.safeParse({ ...base, currentMileage: -1 }).success).toBe(false);
    expect(s.safeParse({ ...base, currentMileage: 1_000_000 }).success).toBe(false);
  });

  it("refuse un numéro de série qui ne fait pas 17 caractères", () => {
    expect(s.safeParse({ ...base, vin: "TROPCOURT" }).success).toBe(false);
    expect(s.safeParse({ ...base, vin: "JKAZX4R14XA000001" }).success).toBe(true);
  });
});
