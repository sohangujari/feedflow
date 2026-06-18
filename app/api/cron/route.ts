import { NextRequest, NextResponse } from "next/server";
import { fetchFeed } from "@/lib/fetcher";
import { upsertArticles, pruneOldArticles } from "@/lib/db";
import { RSS_SOURCES } from "@/lib/sources";

// Vercel max duration for cron routes (free tier = 10s, but we batch)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  // Verify cron secret
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return unauthorized();
  }

  const body = await req.json().catch(() => ({}));
  const action = body?.action ?? "fetch";

  // ─── PRUNE ────────────────────────────────────────────────────────────────
  if (action === "prune") {
    const deleted = await pruneOldArticles(7);
    console.log(`[cron] Pruned ${deleted} old articles`);
    return NextResponse.json({ status: "ok", action: "prune", deleted });
  }

  // ─── FETCH ────────────────────────────────────────────────────────────────
  const activeSources = RSS_SOURCES.filter((s) => s.active);
  const results: Record<string, { fetched: number; inserted: number; error?: string }> = {};
  let totalInserted = 0;

  for (const source of activeSources) {
    try {
      const articles = await fetchFeed(source.url, { scrapeImages: true });

      if (articles.length === 0) {
        results[source.id] = { fetched: 0, inserted: 0 };
        continue;
      }

      // Normalize for DB insert
      const rows = articles
        .filter((a) => a.url && a.title)
        .map((a) => ({
          title: a.title,
          description: a.description,
          url: a.url,
          image: a.image,
          source: source.name,
          source_id: source.id,
          country: source.country,
          language: source.language,
          category: source.category,
          published_at: a.publishedAt ? new Date(a.publishedAt).toISOString() : null,
          search_vector: null as unknown as string, // set by DB trigger
        }));

      const { inserted, error } = await upsertArticles(rows);
      totalInserted += inserted;
      results[source.id] = { fetched: articles.length, inserted, error };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results[source.id] = { fetched: 0, inserted: 0, error: message };
      console.error(`[cron] Error processing source ${source.id}:`, err);
    }
  }

  console.log(`[cron] Fetch complete. Total inserted: ${totalInserted}`);

  return NextResponse.json({
    status: "ok",
    action: "fetch",
    totalInserted,
    sources: results,
  });
}
