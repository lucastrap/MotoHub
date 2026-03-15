"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper, faArrowUpRightFromSquare, faFire } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";

type NewsItem = {
  id: string;
  title: string;
  pubDate: string;
  link: string;
  thumbnail: string;
  description: string;
  source: string;
};

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Utilisation de notre propre API backend aggregator plutôt qu'un service tiers externe
  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("/api/news");
        if (res.ok) {
           const data = await res.json();
           setArticles(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des actualités", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <AppLayout title="Actualités Moto">
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 opacity-50">
          <FontAwesomeIcon icon={faNewspaper} className="h-12 w-12 mb-4 animate-bounce text-primary" />
          <p>Recherche des dernières nouvelles moteurs...</p>
        </div>
      ) : (
        <div className="space-y-8">
           <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-8 flex items-center justify-between shadow-lg text-white">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                   <FontAwesomeIcon icon={faFire} className="text-yellow-300" />
                   Toute l'Actu Pilotage
                </h2>
                <p className="mt-2 text-white/80 max-w-xl">
                   Les derniers essais, rumeurs de transferts et nouvelles réglementations issus des meilleurs sites d'actualité moto français combinés.
                </p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
             {articles.map((article) => (
                <div key={article.id} className="bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col group hover:border-primary/50 hover:shadow-primary/10 transition-all duration-300">
                  {article.thumbnail ? (
                     <div className="h-48 w-full overflow-hidden bg-muted relative">
                        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded-sm z-10 uppercase backdrop-blur-sm shadow-sm ring-1 ring-white/10">
                           {article.source}
                        </div>
                        <img 
                          src={article.thumbnail} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                     </div>
                  ) : (
                    <div className="h-2 w-full bg-primary" />
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-primary">
                         {new Date(article.pubDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!article.thumbnail && (
                        <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {article.source}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors" title={article.title}>
                       {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6" dangerouslySetInnerHTML={{ __html: article.description }}></p>
                    <div className="mt-auto pt-4 border-t border-muted/50">
                       <Button asChild variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground font-semibold">
                         <a href={article.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                            Voir sur {article.source} <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
                         </a>
                       </Button>
                    </div>
                  </div>
                </div>
             ))}
           </div>
           
           {articles.length === 0 && (
              <div className="text-center p-12 text-muted-foreground">
                 Aucun article n'a pu être récupéré à ce moment.
              </div>
           )}
        </div>
      )}
    </AppLayout>
  );
}
