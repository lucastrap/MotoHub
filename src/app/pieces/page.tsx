"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Motorcycle } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faShoppingBag, faCogs, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";

type BrandLinks = {
  name: string;
  url: string;
  type: "official" | "parts";
  description: string;
};

// Base de données des sites selon la marque
const BRANDS_LINKS: Record<string, BrandLinks[]> = {
  kawasaki: [
    { name: "Pièces Kawa", url: "https://www.pieces-kawa.com", type: "parts", description: "Boutique en ligne avec éclatés pour commander toutes pièces d'origine." },
    { name: "Kawasaki Accessories", url: "https://www.kawasaki.fr/fr_fr/parts-and-accessories.html", type: "official", description: "Catalogue officiel des accessoires et pièces constructeur." },
    { name: "Motoblouz (Kawa)", url: "https://www.motoblouz.com/pieces-detachees/route-kawasaki.html", type: "parts", description: "Large choix d'équipements et d'entretien pour votre sportive." }
  ],
  honda: [
    { name: "Bike-Parts (Honda)", url: "https://www.bike-parts.fr/", type: "parts", description: "Toutes les microfiches Honda originales pour trouver la bonne vis." },
    { name: "Honda Officiel", url: "https://moto.honda.fr/", type: "official", description: "Site constructeur pour accessoires officiels." },
  ],
  yamaha: [
    { name: "Pièces Yam", url: "https://www.pieces-yam.com/", type: "parts", description: "Site de référence en microfiches pour commander les pièces Yamaha." },
    { name: "Yamaha Motor Europe", url: "https://www.yamaha-motor.eu/fr/fr/parts-accessories/", type: "official", description: "Dénichez l'accessoire parfait pour votre YZF ou MT." }
  ],
  suzuki: [
    { name: "Pièces Suz", url: "https://www.pieces-suz.com/", type: "parts", description: "La bible des microfiches pour entretenir et réparer votre Suzuki." }
  ],
  bmw: [
    { name: "Leebmann24", url: "https://www.leebmann24.de/bmw-ersatzteile/", type: "parts", description: "Boutique allemande référence pour les pièces BMW (Expédie en zone Euro)." },
    { name: "BMW Motorrad", url: "https://www.bmw-motorrad.fr/fr/accessories-and-parts/accessories.html", type: "official", description: "Site constructeur."}
  ],
  ducati: [
    { name: "Ducati Pièces", url: "https://www.ducati.com/fr/fr/accessoires", type: "official", description: "Trouvez tout ce qu'il faut en rouge pour votre Ducati." },
    { name: "Desmo-Racing", url: "https://www.desmo-racing.com/", type: "parts", description: "Le spécialiste français de la pièce pour l'équipement Ducati." }
  ],
  triumph: [
    { name: "Triumph Parts", url: "https://www.worldoftriumph.com/collections/triumph-motorcycle-parts", type: "parts", description: "Site anglais réputé pour les éclatés et les pièces de base Triumph." },
    { name: "Triumph France", url: "https://www.triumphmotorcycles.fr/accessoires", type: "official", description: "Accessoires officiels pour un pur look British." }
  ]
};

// Marques généralistes si non trouvé
const GENERAL_LINKS: BrandLinks[] = [
  { name: "Motoblouz", url: "https://www.motoblouz.com/pieces-detachees.html", type: "parts", description: "Site français incontournable" },
  { name: "Dafy Moto", url: "https://www.dafy-moto.com/pieces-detachees-moto.html", type: "parts", description: "Magasins partout et gros catalogue web." },
  { name: "Wemoto", url: "https://www.wemoto.fr/", type: "parts", description: "Excellente adresse pour des kits chaînes et consommables." },
];

export default function PiecesPage() {
  const [motorcycle, setMotorcycle] = useState<Motorcycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/motorcycles");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setMotorcycle(data[0]); // On prend la première moto
          }
        }
      } catch (error) {
        console.error("Failed to fetch motorcycles", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getBrandKey = (brandStr: string) => {
    return brandStr.trim().toLowerCase().split(" ")[0]; // ex: "Honda" -> "honda", "BMW Motorrad" -> "bmw"
  };

  const brandKey = motorcycle ? getBrandKey(motorcycle.brand) : "";
  const specificLinks = BRANDS_LINKS[brandKey] || [];
  const linksToShow = specificLinks.length > 0 ? specificLinks : GENERAL_LINKS;

  return (
    <AppLayout title="Pièces Déclarées & Achat">
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground animate-pulse">Recherche des meilleurs fournisseurs...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {motorcycle && specificLinks.length > 0 ? (
             <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 flex items-center justify-between shadow-sm">
                <div>
                  <h2 className="text-2xl font-black uppercase text-primary mb-2">Boutiques pour votre {motorcycle.brand}</h2>
                  <p className="text-muted-foreground max-w-2xl">
                     Nous avons sélectionné les meilleurs sites de microfiches et d'accessoires spécifiquement pour le modèle et la marque de votre véhicule : <strong className="text-foreground">{motorcycle.brand} {motorcycle.model}</strong>.
                  </p>
                </div>
                <div className="hidden md:flex text-primary/30">
                  <FontAwesomeIcon icon={faCogs} className="h-20 w-20" />
                </div>
             </div>
          ) : (
             <div className="bg-card rounded-2xl p-8 flex items-center gap-6 border shadow-sm">
               <div className="bg-yellow-500/20 text-yellow-600 p-4 rounded-full">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="h-8 w-8" />
               </div>
               <div>
                 <h2 className="text-xl font-bold mb-1">
                   {motorcycle ? `Pas de sites spécifiques trouvés pour "${motorcycle.brand}"` : "Aucune moto dans votre garage"}
                 </h2>
                 <p className="text-muted-foreground text-sm">
                   Voici une liste de nos sites généralistes favoris pour commander vos pièces.
                 </p>
               </div>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {linksToShow.map((link, index) => (
               <a 
                 key={index} 
                 href={link.url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="group block"
               >
                 <div className="h-full bg-card rounded-xl border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-muted/20 transform group-hover:scale-110 group-hover:text-primary/5 transition-transform duration-500">
                       <FontAwesomeIcon icon={link.type === 'official' ? faShoppingBag : faCogs} className="h-24 w-24" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="mb-4">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${link.type === 'official' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500' }`}>
                          {link.type === 'official' ? "Accessoires Officiels" : "Pièces OEM & Entretien"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 flex items-center gap-2 group-hover:text-primary transition-colors">
                        {link.name}
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3 opacity-50" />
                      </h3>
                      <p className="text-sm text-muted-foreground mt-auto">
                        {link.description}
                      </p>
                    </div>
                 </div>
               </a>
            ))}
          </div>

        </div>
      )}
    </AppLayout>
  );
}
