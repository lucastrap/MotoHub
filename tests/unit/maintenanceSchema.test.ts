import { buildMaintenanceSchema, aujourdhui, KM_MAX } from "@/lib/schemas/maintenance";

const schema = buildMaintenanceSchema("2026-07-30");
const BASE = {
  motorcycleId: "8f14e45f-ceea-467a-9c2b-1f6a1b2c3d4e",
  type: "OIL_CHANGE" as const,
  date: "2026-07-30",
  mileage: 12500,
};

describe("aujourdhui", () => {
  it("formate en YYYY-MM-DD sans décaler d'un jour selon le fuseau", () => {
    // 1er janvier à 00h30 heure locale : un passage par UTC ferait reculer au 31/12.
    expect(aujourdhui(new Date(2026, 0, 1, 0, 30))).toBe("2026-01-01");
    expect(aujourdhui(new Date(2026, 11, 31, 23, 30))).toBe("2026-12-31");
  });
});

describe("buildMaintenanceSchema   date", () => {
  it("accepte aujourd'hui", () => {
    expect(schema.safeParse(BASE).success).toBe(true);
  });

  it("accepte une date passée", () => {
    expect(schema.safeParse({ ...BASE, date: "2020-03-15" }).success).toBe(true);
  });

  it("refuse une date dans le futur", () => {
    const r = schema.safeParse({ ...BASE, date: "2026-07-31" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toMatch(/futur/i);
    }
  });

  it("refuse une date mal formée", () => {
    expect(schema.safeParse({ ...BASE, date: "30/07/2026" }).success).toBe(false);
  });
});

describe("buildMaintenanceSchema   description", () => {
  it("est facultative et vaut une chaîne vide par défaut", () => {
    const r = schema.safeParse(BASE);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.description).toBe("");
  });

  it("conserve la description quand elle est fournie", () => {
    const r = schema.safeParse({ ...BASE, description: "Vidange + filtre" });
    if (r.success) expect(r.data.description).toBe("Vidange + filtre");
  });
});

describe("buildMaintenanceSchema   coût", () => {
  it("laisse un coût vide non renseigné au lieu de le ramener à zéro", () => {
    const r = schema.safeParse({ ...BASE, cost: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.cost).toBeUndefined();
  });

  it("accepte un coût chiffré", () => {
    const r = schema.safeParse({ ...BASE, cost: "89.90" });
    if (r.success) expect(r.data.cost).toBeCloseTo(89.9);
  });

  it("refuse un coût négatif", () => {
    expect(schema.safeParse({ ...BASE, cost: -10 }).success).toBe(false);
  });
});

describe("buildMaintenanceSchema   kilométrage", () => {
  it("refuse un kilométrage négatif", () => {
    expect(schema.safeParse({ ...BASE, mileage: -1 }).success).toBe(false);
  });

  it("refuse une valeur manifestement erronée", () => {
    expect(schema.safeParse({ ...BASE, mileage: KM_MAX + 1 }).success).toBe(false);
  });

  it("accepte zéro (moto neuve)", () => {
    expect(schema.safeParse({ ...BASE, mileage: 0 }).success).toBe(true);
  });
});

describe("buildMaintenanceSchema   moto", () => {
  it("exige un identifiant de moto valide", () => {
    const r = schema.safeParse({ ...BASE, motorcycleId: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toMatch(/sélectionner une moto/i);
  });

  it("refuse un type d'entretien inconnu", () => {
    expect(schema.safeParse({ ...BASE, type: "LAVAGE" }).success).toBe(false);
  });
});
