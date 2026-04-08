"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faShoppingBag,
  faCogs,
  faMotorcycle,
  faSearch,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

type Motorcycle = {
  id: string;
  brand: string;
  model: string;
  year: number;
};

type ShopLink = {
  name: string;
  url: string;
  type: "official" | "parts" | "search" | "general";
  description: string;
  logo?: string;
};

// Liens statiques par marque
const BRAND_LINKS: Record<string, ShopLink[]> = {
  kawasaki: [
    { name: "Pièces-Kawa", url: "https://www.pieces-kawa.com", type: "parts", description: "Microfiches et pièces d'origine Kawasaki." },
    { name: "Kawasaki Accessories", url: "https://www.kawasaki.fr/fr_fr/parts-and-accessories.html", type: "official", description: "Catalogue officiel constructeur." },
  ],
  honda: [
    { name: "Bike-Parts Honda", url: "https://www.bike-parts.fr/", type: "parts", description: "Microfiches originales Honda, toutes les références." },
    { name: "Honda France", url: "https://moto.honda.fr/", type: "official", description: "Site constructeur, accessoires officiels." },
  ],
  yamaha: [
    { name: "Pièces-Yam", url: "https://www.pieces-yam.com/", type: "parts", description: "Référence microfiches Yamaha, livraison rapide." },
    { name: "Yamaha Motor EU", url: "https://www.yamaha-motor.eu/fr/fr/parts-accessories/", type: "official", description: "Accessoires officiels Yamaha." },
  ],
  suzuki: [
    { name: "Pièces-Suz", url: "https://www.pieces-suz.com/", type: "parts", description: "Bible des microfiches pour Suzuki." },
    { name: "Suzuki France", url: "https://www.suzuki.fr/moto/pieces-accessoires", type: "official", description: "Accessoires et pièces officiels Suzuki." },
  ],
  bmw: [
    { name: "Leebmann24", url: "https://www.leebmann24.de/bmw-ersatzteile/", type: "parts", description: "Référence européenne pièces BMW Motorrad." },
    { name: "BMW Motorrad", url: "https://www.bmw-motorrad.fr/fr/accessories-and-parts/accessories.html", type: "official", description: "Site constructeur officiel." },
  ],
  ducati: [
    { name: "Ducati Accessories", url: "https://www.ducati.com/fr/fr/accessoires", type: "official", description: "Accessoires et pièces officiels Ducati." },
    { name: "Desmo-Racing", url: "https://www.desmo-racing.com/", type: "parts", description: "Spécialiste français pièces Ducati." },
  ],
  triumph: [
    { name: "World of Triumph", url: "https://www.worldoftriumph.com/collections/triumph-motorcycle-parts", type: "parts", description: "Éclatés et pièces Triumph." },
    { name: "Triumph France", url: "https://www.triumphmotorcycles.fr/accessoires", type: "official", description: "Accessoires officiels." },
  ],
  aprilia: [
    { name: "Aprilia France", url: "https://www.aprilia.com/fr_FR/", type: "official", description: "Site officiel Aprilia France." },
    { name: "Motoblouz Aprilia", url: "https://www.motoblouz.com/pieces-detachees/route-aprilia.html", type: "parts", description: "Pièces et entretien Aprilia." },
  ],
  ktm: [
    { name: "KTM Parts", url: "https://www.ktm.com/fr-fr/parts-accessories.html", type: "official", description: "Pièces et accessoires officiels KTM." },
    { name: "Motoblouz KTM", url: "https://www.motoblouz.com/pieces-detachees/route-ktm.html", type: "parts", description: "Entretien et pièces KTM." },
  ],
  harley: [
    { name: "Harley-Davidson FR", url: "https://www.harley-davidson.com/fr/fr/", type: "official", description: "Pièces et accessoires officiels H-D." },
    { name: "J&P Cycles", url: "https://www.jpcycles.com/", type: "parts", description: "Référence mondiale pièces Harley." },
  ],
};

// Sites généralistes toujours affichés
const GENERAL_SHOPS: ShopLink[] = [
  { name: "Motoblouz", url: "https://www.motoblouz.com/pieces-detachees.html", type: "general", description: "Incontournable français, grand catalogue." },
  { name: "Dafy Moto", url: "https://www.dafy-moto.com/pieces-detachees-moto.html", type: "general", description: "Réseau national + boutique en ligne." },
  { name: "Wemoto", url: "https://www.wemoto.fr/", type: "general", description: "Kits chaîne, consommables, livraison express." },
  { name: "Motointegrator", url: "https://www.motointegrator.fr/", type: "general", description: "Comparateur de prix pièces toutes marques." },
];

function getDynamicSearchLinks(moto: Motorcycle): ShopLink[] {
  const q = encodeURIComponent(`pièces ${moto.brand} ${moto.model} ${moto.year}`);
  const qSimple = encodeURIComponent(`${moto.brand} ${moto.model}`);
  return [
    {
      name: "eBay",
      url: `https://www.ebay.fr/sch/i.html?_nkw=pieces+${encodeURIComponent(moto.brand + ' ' + moto.model)}&_sacat=6024`,
      type: "search",
      description: `Rechercher "${moto.brand} ${moto.model}" sur eBay — neuf & occasion.`,
    },
    {
      name: "Le Bon Coin",
      url: `https://www.leboncoin.fr/recherche?text=${qSimple}&category=56`,
      type: "search",
      description: `Annonces pièces d'occasion pour votre ${moto.brand} ${moto.model}.`,
    },
    {
      name: "Amazon",
      url: `https://www.amazon.fr/s?k=${q}`,
      type: "search",
      description: `Pièces et accessoires ${moto.brand} ${moto.model} sur Amazon.`,
    },
    {
      name: "Google Shopping",
      url: `https://www.google.fr/search?q=${q}&tbm=shop`,
      type: "search",
      description: `Comparer les prix de toutes les pièces pour votre moto.`,
    },
  ];
}

const TYPE_STYLES: Record<string, string> = {
  official: "bg-blue-500/10 text-blue-400",
  parts: "bg-orange-500/10 text-orange-400",
  search: "bg-purple-500/10 text-purple-400",
  general: "bg-zinc-500/10 text-zinc-400",
};

const TYPE_LABELS: Record<string, string> = {
  official: "Officiel",
  parts: "Pièces OEM",
  search: "Recherche",
  general: "Généraliste",
};

export default function PiecesPage() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [selected, setSelected] = useState<Motorcycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/motorcycles")
      .then((r) => r.ok ? r.json() : [])
      .then((data: Motorcycle[]) => {
        setMotorcycles(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const brandKey = selected?.brand.trim().toLowerCase().split(" ")[0] ?? "";
  const brandLinks = BRAND_LINKS[brandKey] ?? [];
  const dynamicLinks = selected ? getDynamicSearchLinks(selected) : [];

  return (
    <AppLayout title="Pièces & Achats">
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground animate-pulse">Chargement de votre garage...</p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Header + sélecteur de moto */}
          <div className="bg-gradient-to-r from-primary/10 to-orange-500/5 border border-primary/20 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-black uppercase text-white mb-2 flex items-center gap-3">
                  <FontAwesomeIcon icon={faCogs} className="text-primary" />
                  {selected
                    ? `Pièces pour ${selected.brand} ${selected.model} (${selected.year})`
                    : "Pièces & Achats"}
                </h2>
                <p className="text-muted-foreground max-w-xl text-sm">
                  {selected
                    ? `Sites spécialisés, recherches en ligne et boutiques généralistes sélectionnés pour votre ${selected.brand} ${selected.model}.`
                    : "Ajoutez une moto à votre garage pour obtenir des recommandations personnalisées."}
                </p>
              </div>

              {/* Sélecteur si plusieurs motos */}
              {motorcycles.length > 1 && (
                <div className="relative shrink-0">
                  <select
                    value={selected?.id ?? ""}
                    onChange={(e) =>
                      setSelected(motorcycles.find((m) => m.id === e.target.value) ?? null)
                    }
                    className="appearance-none bg-[#111] border border-white/10 text-white rounded-xl px-4 py-3 pr-10 text-sm font-medium cursor-pointer focus:outline-none focus:border-primary"
                  >
                    {motorcycles.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.brand} {m.model} ({m.year})
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 h-3 w-3 pointer-events-none"
                  />
                </div>
              )}
            </div>

            {/* Toutes les motos du garage en chips */}
            {motorcycles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/5">
                {motorcycles.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selected?.id === m.id
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <FontAwesomeIcon icon={faMotorcycle} className="h-3 w-3" />
                    {m.brand} {m.model}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!selected && (
            <div className="text-center p-12 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
              Aucune moto dans votre garage. Ajoutez-en une depuis la section <strong className="text-white">Garage</strong>.
            </div>
          )}

          {selected && (
            <>
              {/* Sites spécifiques à la marque */}
              {brandLinks.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                    Sites spécialisés {selected.brand}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {brandLinks.map((link) => (
                      <ShopCard key={link.url} link={link} />
                    ))}
                  </div>
                </div>
              )}

              {/* Liens de recherche dynamiques */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faSearch} className="h-3 w-3" />
                  Rechercher "{selected.brand} {selected.model}" en ligne
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {dynamicLinks.map((link) => (
                    <ShopCard key={link.url} link={link} />
                  ))}
                </div>
              </div>

              {/* Généralistes */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
                  Boutiques généralistes
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {GENERAL_SHOPS.map((link) => (
                    <ShopCard key={link.url} link={link} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </AppLayout>
  );
}

function ShopCard({ link }: { link: ShopLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full"
    >
      <div className="h-full bg-[#0e0e0e] border border-white/[0.06] rounded-xl p-5 hover:border-primary/30 hover:bg-white/[0.03] transition-all duration-200 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${TYPE_STYLES[link.type]}`}>
            {TYPE_LABELS[link.type]}
          </span>
          <FontAwesomeIcon
            icon={link.type === "search" ? faSearch : link.type === "official" ? faShoppingBag : faCogs}
            className="h-3.5 w-3.5 text-white/20 group-hover:text-primary/50 transition-colors shrink-0 mt-0.5"
          />
        </div>
        <h3 className="font-bold text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
          {link.name}
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-2.5 w-2.5 opacity-40" />
        </h3>
        <p className="text-xs text-white/40 leading-relaxed mt-auto">{link.description}</p>
      </div>
    </a>
  );
}