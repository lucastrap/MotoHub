import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { typeIcon } from "@/lib/maintenance/icons";
import type { UpcomingMaintenance } from "@/lib/maintenance/schedule";

/**
 * Le statut est porté par le libellé texte autant que par la couleur : un
 * daltonien lit « En retard », pas seulement du rouge (RGAA 3.1).
 */
const STATUTS = {
  overdue: { texte: "En retard", cadre: "border-destructive/40 bg-destructive/5", badge: "text-destructive" },
  soon: { texte: "Bientôt", cadre: "border-primary/40 bg-primary/5", badge: "text-primary" },
  ok: { texte: "À jour", cadre: "border-border bg-muted/20", badge: "text-muted-foreground" },
} as const;

export function UpcomingRow({ item }: { item: UpcomingMaintenance }) {
  const statut = STATUTS[item.status];

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${statut.cadre}`}>
      <FontAwesomeIcon icon={typeIcon(item.type)} className="h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="flex-1 text-sm font-medium">{item.label}</p>
      <p className="hidden text-xs text-muted-foreground sm:block">{item.detail}</p>
      <span className={`text-xs font-semibold ${statut.badge}`}>{statut.texte}</span>
    </div>
  );
}
