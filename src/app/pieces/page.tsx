"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

type Motorcycle = {
  id: string;
  brand: string;
  model: string;
  year: number;
};

type Boutique = {
  name: string;
  url: string;
  note?: string;
};

const CLE_DERNIERE_MOTO = "mototrack:pieces:moto";

/** Sites du constructeur et spécialistes, par marque. */
const PAR_MARQUE: Record<string, Boutique[]> = {
  kawasaki: [
    { name: "Kawasaki France", url: "https://www.kawasaki.fr/fr_fr/parts-and-accessories.html", note: "Constructeur" },
    { name: "Pièces-Kawa", url: "https://www.pieces-kawa.com", note: "Microfiches" },
  ],
  honda: [
    { name: "Honda France", url: "https://moto.honda.fr/", note: "Constructeur" },
    { name: "Bike-Parts Honda", url: "https://www.bike-parts.fr/", note: "Microfiches" },
  ],
  yamaha: [
    { name: "Yamaha Motor Europe", url: "https://www.yamaha-motor.eu/fr/fr/parts-accessories/", note: "Constructeur" },
    { name: "Pièces-Yam", url: "https://www.pieces-yam.com/", note: "Microfiches" },
  ],
  suzuki: [
    { name: "Suzuki France", url: "https://www.suzuki.fr/moto/pieces-accessoires", note: "Constructeur" },
    { name: "Pièces-Suz", url: "https://www.pieces-suz.com/", note: "Microfiches" },
  ],
  bmw: [
    { name: "BMW Motorrad", url: "https://www.bmw-motorrad.fr/fr/accessories-and-parts/accessories.html", note: "Constructeur" },
    { name: "Leebmann24", url: "https://www.leebmann24.de/bmw-ersatzteile/", note: "Microfiches" },
  ],
  ducati: [
    { name: "Ducati", url: "https://www.ducati.com/fr/fr/accessoires", note: "Constructeur" },
    { name: "Desmo-Racing", url: "https://www.desmo-racing.com/" },
  ],
  triumph: [
    { name: "Triumph France", url: "https://www.triumphmotorcycles.fr/accessoires", note: "Constructeur" },
    { name: "World of Triumph", url: "https://www.worldoftriumph.com/collections/triumph-motorcycle-parts" },
  ],
  aprilia: [
    { name: "Aprilia France", url: "https://www.aprilia.com/fr_FR/", note: "Constructeur" },
    { name: "Motoblouz Aprilia", url: "https://www.motoblouz.com/pieces-detachees/route-aprilia.html" },
  ],
  ktm: [
    { name: "KTM", url: "https://www.ktm.com/fr-fr/parts-accessories.html", note: "Constructeur" },
    { name: "Motoblouz KTM", url: "https://www.motoblouz.com/pieces-detachees/route-ktm.html" },
  ],
  harley: [
    { name: "Harley-Davidson France", url: "https://www.harley-davidson.com/fr/fr/", note: "Constructeur" },
    { name: "J&P Cycles", url: "https://www.jpcycles.com/" },
  ],
};

const GENERALISTES: Boutique[] = [
  { name: "Motoblouz", url: "https://www.motoblouz.com/pieces-detachees.html" },
  { name: "Dafy Moto", url: "https://www.dafy-moto.com/pieces-detachees-moto.html" },
  { name: "Wemoto", url: "https://www.wemoto.fr/" },
  { name: "Motointegrator", url: "https://www.motointegrator.fr/", note: "Comparateur" },
];

function occasion(moto: Motorcycle): Boutique[] {
  const requete = encodeURIComponent(`${moto.brand} ${moto.model}`);
  return [
    {
      name: "Le Bon Coin",
      url: `https://www.leboncoin.fr/recherche?text=${requete}&category=56`,
    },
    {
      name: "eBay",
      url: `https://www.ebay.fr/sch/i.html?_nkw=pieces+${requete}&_sacat=6024`,
    },
  ];
}

function comparer(moto: Motorcycle): Boutique[] {
  const requete = encodeURIComponent(`pièces ${moto.brand} ${moto.model} ${moto.year}`);
  return [
    { name: "Google Shopping", url: `https://www.google.fr/search?q=${requete}&tbm=shop` },
    { name: "Amazon", url: `https://www.amazon.fr/s?k=${requete}` },
  ];
}

export default function PiecesPage() {
  const [motos, setMotos] = useState<Motorcycle[]>([]);
  const [choisie, setChoisie] = useState<Motorcycle | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch("/api/motorcycles")
      .then((r) => (r.ok ? r.json() : []))
      .then((donnees: Motorcycle[]) => {
        setMotos(donnees);
        // Reprend la dernière moto consultée plutôt que toujours la première.
        const memorisee = localStorage.getItem(CLE_DERNIERE_MOTO);
        setChoisie(donnees.find((m) => m.id === memorisee) ?? donnees[0] ?? null);
      })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  function selectionner(moto: Motorcycle) {
    setChoisie(moto);
    localStorage.setItem(CLE_DERNIERE_MOTO, moto.id);
  }

  const marque = choisie?.brand.trim().toLowerCase().split(" ")[0] ?? "";
  const liensMarque = PAR_MARQUE[marque] ?? [];

  if (chargement) {
    return (
      <AppLayout title="Pièces">
        <p className="text-muted-foreground">Chargement…</p>
      </AppLayout>
    );
  }

  if (!choisie) {
    return (
      <AppLayout title="Pièces">
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h2 className="mb-2 text-lg font-medium">Aucune moto dans votre garage</h2>
          <p className="mb-4 text-muted-foreground">
            Ajoutez une moto pour obtenir les liens correspondant à sa marque.
          </p>
          <Link href="/garage/new" className="font-medium text-primary hover:underline">
            Ajouter une moto
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Pièces">
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground">
            Où acheter des pièces pour votre {choisie.brand} {choisie.model} de {choisie.year}.
          </p>

          {motos.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {motos.map((m) => (
                <button
                  key={m.id}
                  onClick={() => selectionner(m)}
                  aria-pressed={choisie.id === m.id}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    choisie.id === m.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {m.brand} {m.model}
                </button>
              ))}
            </div>
          )}
        </div>

        {liensMarque.length > 0 && (
          <Groupe titre={`Pièces d'origine ${choisie.brand}`} boutiques={liensMarque} />
        )}
        <Groupe titre="Occasion" boutiques={occasion(choisie)} />
        <Groupe titre="Comparer les prix" boutiques={comparer(choisie)} />
        <Groupe titre="Boutiques généralistes" boutiques={GENERALISTES} />
      </div>
    </AppLayout>
  );
}

function Groupe({ titre, boutiques }: { titre: string; boutiques: Boutique[] }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-foreground">{titre}</h2>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border bg-card">
        {boutiques.map((b) => (
          <li key={b.url}>
            <a
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <span className="font-medium">{b.name}</span>
              {b.note && <span className="text-xs text-muted-foreground">{b.note}</span>}
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className="ml-auto h-3 w-3 text-muted-foreground"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
