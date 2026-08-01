import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import logger from '@/lib/logger';

export type MotoNews = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail: string;
  source: string;
};

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'content:encoded', 'enclosure'],
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; MotoTrack/1.0)',
  },
  timeout: 8000,
});

const RSS_FEEDS = [
  {
    name: 'Moto Magazine',
    url: 'https://news.google.com/rss/search?q=moto+magazine+actualité&hl=fr&gl=FR&ceid=FR:fr',
  },
  {
    name: 'MotoGP',
    url: 'https://news.google.com/rss/search?q=MotoGP+2025&hl=fr&gl=FR&ceid=FR:fr',
  },
  {
    name: 'Actu Moto',
    url: 'https://news.google.com/rss/search?q=moto+sportive+nouveauté+2025&hl=fr&gl=FR&ceid=FR:fr',
  },
  {
    name: 'Essais Moto',
    url: 'https://news.google.com/rss/search?q=essai+moto+test+2025&hl=fr&gl=FR&ceid=FR:fr',
  },
];

function extractThumbnail(item: any): string {
  if (item['media:content']?.$?.url) return item['media:content'].$.url;
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url;
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) return item.enclosure.url;
  if (item['content:encoded']) {
    const match = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
    if (match) return match[1];
  }
  if (item.description) {
    const match = item.description.match(/<img[^>]+src="([^">]+)"/);
    if (match) return match[1];
  }
  return '';
}

function cleanDescription(item: any): string {
  const raw = item.contentSnippet || item.description || '';
  return raw
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
    .substring(0, 220) + '...';
}

export async function GET() {
  try {
    const allArticles: MotoNews[] = [];
    const seenLinks = new Set<string>();

    await Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        try {
          const parsedFeed = await parser.parseURL(feed.url);
          for (const item of parsedFeed.items) {
            if (!item.link || seenLinks.has(item.link)) continue;
            seenLinks.add(item.link);
            allArticles.push({
              id: item.guid || item.link,
              title: item.title || '',
              link: item.link,
              pubDate: item.pubDate || new Date().toISOString(),
              description: cleanDescription(item),
              thumbnail: extractThumbnail(item),
              source: feed.name,
            });
          }
        } catch (err) {
          logger.warn(`[news] flux indisponible : ${feed.name}`, { err });
        }
      })
    );

    allArticles.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    return NextResponse.json(allArticles.slice(0, 24));
  } catch (error) {
    logger.error('[news] échec global de récupération', { error });
    return NextResponse.json({ error: 'Impossible de récupérer les actualités' }, { status: 500 });
  }
}