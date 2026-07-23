import {
  getUpcomingMaintenance,
  getMaintenanceStatus,
  MAINTENANCE_RULES,
} from "@/lib/maintenance/schedule";

describe("getMaintenanceStatus", () => {
  it("retourne 'ok' bien avant l'échéance", () => {
    expect(getMaintenanceStatus(1000, 7000, 300)).toBe("ok");
  });

  it("retourne 'soon' dès l'entrée dans la marge d'anticipation", () => {
    expect(getMaintenanceStatus(6700, 7000, 300)).toBe("soon"); // pile au seuil
    expect(getMaintenanceStatus(6800, 7000, 300)).toBe("soon");
  });

  it("retourne 'overdue' à l'échéance exacte et au-delà", () => {
    expect(getMaintenanceStatus(7000, 7000, 300)).toBe("overdue");
    expect(getMaintenanceStatus(9000, 7000, 300)).toBe("overdue");
  });
});

describe("getUpcomingMaintenance", () => {
  it("retourne une échéance par règle métier, dans l'ordre", () => {
    const result = getUpcomingMaintenance(10000, {});
    expect(result).toHaveLength(MAINTENANCE_RULES.length);
    expect(result.map((i) => i.type)).toEqual([
      "CHAIN_SERVICE",
      "OIL_CHANGE",
      "BRAKE_SERVICE",
      "TIRE_CHANGE",
    ]);
  });

  it("sans historique, l'échéance = kilométrage courant + intervalle (statut ok)", () => {
    const chain = getUpcomingMaintenance(10000, {}).find((i) => i.type === "CHAIN_SERVICE")!;
    expect(chain.targetMileage).toBe(11000); // 10000 + 1000
    expect(chain.status).toBe("ok");
  });

  it("calcule l'échéance depuis le dernier entretien du type", () => {
    const oil = getUpcomingMaintenance(12500, { OIL_CHANGE: { mileage: 12000 } }).find(
      (i) => i.type === "OIL_CHANGE",
    )!;
    expect(oil.targetMileage).toBe(18000); // 12000 + 6000
    expect(oil.status).toBe("ok");
  });

  it("passe en 'soon' dans la marge d'anticipation", () => {
    // chaîne : dernier à 10000 → échéance 11000, marge 100 → soon dès 10900
    const chain = getUpcomingMaintenance(10950, { CHAIN_SERVICE: { mileage: 10000 } }).find(
      (i) => i.type === "CHAIN_SERVICE",
    )!;
    expect(chain.status).toBe("soon");
  });

  it("passe en 'overdue' quand l'échéance est dépassée   l'état qui manquait", () => {
    const chain = getUpcomingMaintenance(11500, { CHAIN_SERVICE: { mileage: 10000 } }).find(
      (i) => i.type === "CHAIN_SERVICE",
    )!;
    expect(chain.status).toBe("overdue");
  });

  it("un entretien récent n'est jamais en retard (le compteur ne fait pas reculer l'échéance)", () => {
    const oil = getUpcomingMaintenance(12000, { OIL_CHANGE: { mileage: 12000 } }).find(
      (i) => i.type === "OIL_CHANGE",
    )!;
    expect(oil.status).toBe("ok");
  });

  it("porte l'information sur trois canaux indépendants de la couleur (icône, libellé, valeur)", () => {
    const chain = getUpcomingMaintenance(10000, {}).find((i) => i.type === "CHAIN_SERVICE")!;
    expect(chain.icon).toBeTruthy();
    expect(chain.label).toBe("Kit chaîne");
    expect(chain.detail).toMatch(/\d/); // contient la valeur chiffrée
  });
});
