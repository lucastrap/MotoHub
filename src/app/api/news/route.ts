import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Format d'une actualité moto
export type MotoNews = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail: string;
  source: string;
};

// Instance de rss-parser pour lire plusieurs champs spécifiques
const parser = new Parser({
  customFields: {
    item: ['media:content', 'content:encoded', 'description']
  }
});

// Liste des flux RSS spécialisés en motos
const RSS_FEEDS = [
  { name: 'Moto-Station', url: 'https://moto-station.com/feed' },
  { name: 'Motoservices', url: 'http://www.motoservices.com/actualite-moto/rss.xml' },
  // Vous pouvez en ajouter d'autres ici (Le Repaire, Caradisiac, etc.)
];

export async function GET() {
  try {
    let allArticles: MotoNews[] = [];

    // On boucle sur tous nos flux RSS pour récupérer les actualités
    for (const feed of RSS_FEEDS) {
      try {
        const parsedFeed = await parser.parseURL(feed.url);
        
        const articles = parsedFeed.items.map((item: any) => {
          // Extraction d'une image miniature
          let thumbnail = '';
          
          if (item['media:content'] && item['media:content'].$) {
             thumbnail = item['media:content'].$.url; // Standard Media RSS
          } 
          else if (item['content:encoded']) {
             // Extraction via Regex si l'image est perdue dans le contenu HTML
             const imgMatch = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
             if (imgMatch) thumbnail = imgMatch[1];
          } 
          else if (item.description) {
            const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
             if (imgMatch) thumbnail = imgMatch[1];
          }

          // Nettoyage de la description HTML pour n'avoir que du texte
          const cleanDesc = (item.contentSnippet || item.description || "")
            .replace(/<[^>]*>?/gm, '') // Enlever les balises HTML restantes
            .replace(/&nbsp;|&#160;/gi, ' ') // Nettoyer les espaces insécables
            .substring(0, 200) + "..."; // Garder juste un extrait

          return {
            id: item.guid || item.link || Math.random().toString(),
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            description: cleanDesc,
            thumbnail,
            source: feed.name
          };
        });

        allArticles = [...allArticles, ...articles];
      } catch (feedError) {
        console.error(`Erreur lors de la lecture du flux ${feed.name}:`, feedError);
        // On continue même si un flux échoue
      }
    }

    // On trie tous les articles du plus récent au plus ancien
    allArticles.sort((a, b) => {
       const dateA = new Date(a.pubDate || 0).getTime();
       const dateB = new Date(b.pubDate || 0).getTime();
       return dateB - dateA;
    });

    // On retourne les 20 meilleurs articles
    return NextResponse.json(allArticles.slice(0, 20));
    
  } catch (error) {
    console.error("Erreur Globale RSS API:", error);
    return NextResponse.json({ error: "Impossible de récupérer les actualités" }, { status: 500 });
  }
}
