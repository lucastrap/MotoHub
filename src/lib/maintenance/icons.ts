import {
  faOilCan,
  faCircleDot,
  faCompactDisc,
  faLink,
  faScrewdriverWrench,
  faWrench,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

/** Libelles des types d'entretien, alignes sur l'enum Prisma MaintenanceType. */
export const TYPE_LABELS: Record<string, string> = {
  OIL_CHANGE: "Vidange",
  TIRE_CHANGE: "Pneus",
  BRAKE_SERVICE: "Freins",
  CHAIN_SERVICE: "Chaîne",
  GENERAL_SERVICE: "Révision générale",
  REPAIR: "Réparation",
  OTHER: "Autre",
};

const ICONS: Record<string, IconDefinition> = {
  OIL_CHANGE: faOilCan,
  TIRE_CHANGE: faCircleDot,
  // Disque de frein : visuellement distinct du pneu, deux cercles se
  // confondaient à la taille d'affichage.
  BRAKE_SERVICE: faCompactDisc,
  CHAIN_SERVICE: faLink,
  GENERAL_SERVICE: faScrewdriverWrench,
  REPAIR: faWrench,
  OTHER: faClipboardList,
};

/** Icone d'un type d'entretien. Les cles inconnues retombent sur la cle generique. */
export function typeIcon(type: string): IconDefinition {
  return ICONS[type] ?? ICONS.OTHER;
}

/** Libelle d'un type d'entretien, avec repli lisible pour une cle inconnue. */
export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type.replace(/_/g, " ").toLowerCase();
}
