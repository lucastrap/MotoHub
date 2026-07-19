

export type MaintenanceStatus = "ok" | "soon" | "overdue";

export interface MaintenanceRule {
  /** Type d'entretien (aligné sur l'enum Prisma MaintenanceType). */
  type: string;
  /** Icône affichée (canal d'information indépendant de la couleur). */
  icon: string;
  /** Libellé lisible (canal d'information indépendant de la couleur). */
  label: string;
  /** Intervalle kilométrique entre deux entretiens de ce type. */
  interval: number;
  /** Marge d'anticipation : en deçà, l'échéance passe en « bientôt ». */
  soonMargin: number;
}

export interface UpcomingMaintenance {
  type: string;
  icon: string;
  label: string;
  targetMileage: number;
  detail: string;
  status: MaintenanceStatus;
}


export const MAINTENANCE_RULES: MaintenanceRule[] = [
  { type: "CHAIN_SERVICE", icon: "⚙️", label: "Kit chaîne", interval: 1000, soonMargin: 100 },
  { type: "OIL_CHANGE", icon: "🛢️", label: "Vidange", interval: 6000, soonMargin: 300 },
  { type: "BRAKE_SERVICE", icon: "🔴", label: "Freins", interval: 15000, soonMargin: 500 },
  { type: "TIRE_CHANGE", icon: "🔵", label: "Pneus", interval: 10000, soonMargin: 500 },
];


export function getMaintenanceStatus(
  currentMileage: number,
  targetMileage: number,
  soonMargin: number,
): MaintenanceStatus {
  if (currentMileage >= targetMileage) return "overdue";
  if (currentMileage >= targetMileage - soonMargin) return "soon";
  return "ok";
}


export function getUpcomingMaintenance(
  currentMileage: number,
  lastByType: Record<string, { mileage: number } | undefined>,
): UpcomingMaintenance[] {
  return MAINTENANCE_RULES.map((rule) => {
    const last = lastByType[rule.type];
    const baseMileage = last ? last.mileage : currentMileage;
    const targetMileage = baseMileage + rule.interval;
    return {
      type: rule.type,
      icon: rule.icon,
      label: rule.label,
      targetMileage,
      detail: `À ${targetMileage.toLocaleString("fr-FR")} km`,
      status: getMaintenanceStatus(currentMileage, targetMileage, rule.soonMargin),
    };
  });
}
