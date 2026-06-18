import { supabase } from "./supabase";
import { Article, ArticleRow, NewsQueryParams } from "@/types";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
    image: row.image,
    source: row.source,
    source_id: row.source_id,
    country: row.country,
    language: row.language,
    category: row.category,
    published_at: row.published_at ?? row.created_at,
    created_at: row.created_at,
  };
}

/**
 * Query articles with filters, pagination, and full-text search
 */
export async function queryArticles(params: NewsQueryParams): Promise<{
  articles: Article[];
  total: number;
}> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE)
  );
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("articles")
    .select("*", { count: "exact" });

  // Filters
  if (params.country) {
    const countries = params.country.split(",").map(c => c.trim().toUpperCase());
    if (countries.length === 1) query = query.eq("country", countries[0]);
    else query = query.in("country", countries);
  }
  if (params.category) {
    const categories = params.category.split(",").map(c => c.trim().toLowerCase());
    if (categories.length === 1) query = query.eq("category", categories[0]);
    else query = query.in("category", categories);
  }
  if (params.source) {
    const sources = params.source.split(",").map(s => s.trim().toLowerCase());
    if (sources.length === 1) query = query.eq("source_id", sources[0]);
    else query = query.in("source_id", sources);
  }
  if (params.language) {
    query = query.eq("language", params.language.toLowerCase());
  }
  if (params.from) {
    query = query.gte("published_at", new Date(params.from).toISOString());
  }
  if (params.to) {
    query = query.lte("published_at", new Date(params.to).toISOString());
  }

  // Full-text search using PostgreSQL tsvector
  if (params.q) {
    query = query.textSearch("search_vector", params.q, {
      type: "websearch",
      config: "english",
    });
  }

  // Sorting
  const sortBy = params.sortBy === "relevancy" && params.q ? "created_at" : "published_at";
  query = query.order(sortBy, { ascending: false });

  // Pagination
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("[db] queryArticles error:", error);
    throw new Error(error.message);
  }

  return {
    articles: (data as ArticleRow[]).map(toArticle),
    total: count ?? 0,
  };
}

/**
 * Get a single article by ID
 */
export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toArticle(data as ArticleRow);
}

/**
 * Bulk upsert articles (deduplicates by URL)
 */
export async function upsertArticles(
  articles: Omit<ArticleRow, "id" | "created_at">[]
): Promise<{ inserted: number; error?: string }> {
  if (articles.length === 0) return { inserted: 0 };

  const { error } = await supabase
    .from("articles")
    .upsert(articles, {
      onConflict: "url",
      ignoreDuplicates: true,
    });

  if (error) {
    console.error("[db] upsertArticles error:", error);
    return { inserted: 0, error: error.message };
  }

  return { inserted: articles.length };
}

/**
 * Delete articles older than retentionDays
 */
export async function pruneOldArticles(retentionDays = 7): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const { error, count } = await supabase
    .from("articles")
    .delete({ count: "exact" })
    .lt("created_at", cutoff.toISOString());

  if (error) {
    console.error("[db] pruneOldArticles error:", error);
    return 0;
  }

  return count ?? 0;
}

/**
 * Get all active sources from DB
 */
export async function getSources(params?: { country?: string; category?: string }) {
  let query = supabase
    .from("sources")
    .select("*")
    .eq("active", true);

  if (params?.country) {
    const countries = params.country.split(",").map(c => c.trim().toUpperCase());
    if (countries.length === 1) query = query.eq("country", countries[0]);
    else query = query.in("country", countries);
  }

  if (params?.category) {
    const categories = params.category.split(",").map(c => c.trim().toLowerCase());
    if (categories.length === 1) query = query.eq("category", categories[0]);
    else query = query.in("category", categories);
  }

  query = query.order("country");

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
