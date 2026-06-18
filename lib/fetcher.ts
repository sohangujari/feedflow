import RSSParser from "rss-parser";
import * as cheerio from "cheerio";
import { ParsedArticle } from "@/types";

const parser = new RSSParser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
      ["enclosure", "enclosure"],
    ],
  },
});

/**
 * Extract image from RSS item custom fields
 */
function extractImageFromItem(item: Record<string, unknown>): string | null {
  // media:content
  const mediaContent = item["mediaContent"] as Record<string, unknown> | undefined;
  if (mediaContent?.["$"]) {
    const attrs = mediaContent["$"] as Record<string, string>;
    if (attrs.url && /\.(jpg|jpeg|png|webp|gif)/i.test(attrs.url)) {
      return attrs.url;
    }
  }

  // media:thumbnail
  const mediaThumbnail = item["mediaThumbnail"] as Record<string, unknown> | undefined;
  if (mediaThumbnail?.["$"]) {
    const attrs = mediaThumbnail["$"] as Record<string, string>;
    if (attrs.url) return attrs.url;
  }

  // enclosure
  const enclosure = item["enclosure"] as Record<string, string> | undefined;
  if (enclosure?.url && /image/i.test(enclosure.type ?? "")) {
    return enclosure.url;
  }

  // content:encoded - look for first <img src>
  const content = (item["content:encoded"] ?? item["content"]) as string | undefined;
  if (content) {
    const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * Scrape og:image from an article URL as fallback
 */
async function scrapeOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    const ogImage =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[property="og:image:secure_url"]').attr("content");

    return ogImage ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch and parse a single RSS feed, returning normalized articles
 */
export async function fetchFeed(
  feedUrl: string,
  options: { scrapeImages?: boolean } = {}
): Promise<ParsedArticle[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const articles: ParsedArticle[] = [];

    for (const item of feed.items.slice(0, 20)) {
      if (!item.title || !item.link) continue;

      // Clean description - strip HTML tags
      const rawDescription =
        item.contentSnippet ?? item.summary ?? item.content ?? null;
      const description = rawDescription
        ? rawDescription.replace(/<[^>]+>/g, "").trim().slice(0, 500) || null
        : null;

      // Get image
      let image = extractImageFromItem(item as unknown as Record<string, unknown>);

      // Fallback to og:image scraping (only if enabled and no image found)
      if (!image && options.scrapeImages && item.link) {
        image = await scrapeOgImage(item.link);
      }

      // Parse published date
      const publishedAt =
        item.pubDate ?? item.isoDate ?? (item as any).date?.toString() ?? null;

      articles.push({
        title: item.title.trim(),
        description,
        url: item.link,
        image,
        publishedAt,
      });
    }

    return articles;
  } catch (err) {
    console.error(`[fetcher] Failed to fetch ${feedUrl}:`, err);
    return [];
  }
}
