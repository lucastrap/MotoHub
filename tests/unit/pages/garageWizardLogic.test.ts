import {
  BRANDS,
  COLORS,
  buildYears,
  buildMotorcycleSchema,
  motorcycleWizardSchema,
  STEP_FIELDS,
  evaluatePlate,
  isKnownModel,
  filterModels,
  buildModelsUrl,
  parseSubmitError,
} from "@/app/garage/new/wizardLogic";

describe("Données de référence du wizard", () => {
  it("expose une liste de marques non vide incluant 'Autre'", () => {
    expect(BRANDS.length).toBeGreaterThan(10);
    expect(BRANDS.some((b) => b.name === "Yamaha")).toBe(true);
    expect(BRANDS[BRANDS.length - 1].name).toBe("Autre");
  });

  it("expose une palette de couleurs avec libellé et hex", () => {
    expect(COLORS.length).toBe(10);
    COLORS.forEach((c) => {
      expect(c.label).toBeTruthy();
      expect(c.hex).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe("buildYears", () => {
  it("commence à l'année suivante et couvre les années récentes", () => {
    const years = buildYears(2026);
    expect(years[0]).toBe(2027);
    expect(years).toContain(2026);
    expect(years).toContain(1990);
    // La borne basse historique inclut 1989 (le schéma restreint ensuite à ≥ 1990)
    expect(years[years.length - 1]).toBe(1989);
  });
});

describe("buildMotorcycleSchema", () => {
  const schema = buildMotorcycleSchema(2026);
  const base = { brand: "Yamaha", model: "MT-07", year: 2022, currentMileage: 1000 };

  it("accepte des données valides", () => {
    expect(() => schema.parse(base)).not.toThrow();
  });

  it("rejette une année au-delà de l'an prochain", () => {
    expect(() => schema.parse({ ...base, year: 2028 })).toThrow();
  });

  it("rejette une plaque hors format SIV", () => {
    expect(() => schema.parse({ ...base, licensePlate: "123ABC" })).toThrow();
  });

  it("accepte une plaque SIV valide", () => {
    expect(() => schema.parse({ ...base, licensePlate: "AB-123-CD" })).not.toThrow();
  });

  it("normalise un prix vide en undefined", () => {
    expect(schema.parse({ ...base, purchasePrice: "" }).purchasePrice).toBeUndefined();
  });

  it("expose un schéma par défaut prêt à l'emploi", () => {
    expect(() => motorcycleWizardSchema.parse(base)).not.toThrow();
  });
});

describe("STEP_FIELDS", () => {
  it("définit les champs à valider pour 3 étapes", () => {
    expect(STEP_FIELDS).toHaveLength(3);
    expect(STEP_FIELDS[0]).toEqual(["brand", "model", "year", "currentMileage"]);
  });
});

describe("evaluatePlate", () => {
  it("retourne null tant que la saisie est incomplète", () => {
    expect(evaluatePlate("")).toBeNull();
    expect(evaluatePlate("AB-12")).toBeNull();
  });
  it("valide une plaque complète correcte", () => {
    expect(evaluatePlate("AB-123-CD")).toBe(true);
  });
  it("invalide une plaque complète incorrecte", () => {
    expect(evaluatePlate("A1-234-CD")).toBe(false);
  });
});

describe("isKnownModel", () => {
  const models = ["MT-07", "MT-09", "R1"];
  it("retourne null si vide ou liste vide", () => {
    expect(isKnownModel("", models)).toBeNull();
    expect(isKnownModel("MT-07", [])).toBeNull();
  });
  it("reconnaît un modèle indépendamment de la casse", () => {
    expect(isKnownModel("mt-07", models)).toBe(true);
  });
  it("rejette un modèle absent", () => {
    expect(isKnownModel("Panigale", models)).toBe(false);
  });
});

describe("filterModels", () => {
  const models = ["MT-07", "MT-09", "MT-10", "R1", "R6", "R7", "XSR700", "Tracer", "Ténéré"];
  it("filtre par sous-chaîne insensible à la casse", () => {
    expect(filterModels(models, "mt")).toEqual(["MT-07", "MT-09", "MT-10"]);
  });
  it("limite le nombre de suggestions", () => {
    expect(filterModels(models, "", 3)).toHaveLength(3);
  });
});

describe("buildModelsUrl", () => {
  it("encode la marque et intègre l'année", () => {
    expect(buildModelsUrl("MV Agusta", 2022)).toBe(
      "/api/motorcycle-models?brand=MV%20Agusta&year=2022"
    );
  });
});

describe("parseSubmitError", () => {
  it("concatène les messages d'un tableau d'erreurs Zod", () => {
    const body = { error: [{ message: "Champ A invalide" }, { message: "Champ B invalide" }] };
    expect(parseSubmitError(body, 400)).toBe("Champ A invalide, Champ B invalide");
  });
  it("retourne le message string tel quel", () => {
    expect(parseSubmitError({ error: "Déjà existant" }, 409)).toBe("Déjà existant");
  });
  it("se rabat sur le code HTTP si pas de message exploitable", () => {
    expect(parseSubmitError({}, 500)).toBe("Erreur 500");
  });
});
