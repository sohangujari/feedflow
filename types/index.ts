// ─── Article ────────────────────────────────────────────────────────────────

export interface Article {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  source: string;
  source_id: string;
  country: string;
  language: string;
  category: string;
  published_at: string;
  created_at: string;
}

export interface ArticleRow {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  source: string;
  source_id: string;
  country: string;
  language: string;
  category: string;
  published_at: string | null;
  created_at: string;
}

// ─── Source ─────────────────────────────────────────────────────────────────

export interface Source {
  id: string;
  name: string;
  url: string;
  country: string;
  category: string;
  language: string;
  active: boolean;
}

// ─── API Key ─────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  requests_today: number;
  rate_limit: number;
  active: boolean;
  created_at: string;
  last_used_at: string | null;
}

// ─── API Responses ──────────────────────────────────────────────────────────

export interface NewsResponse {
  status: "ok" | "error";
  totalResults: number;
  page: number;
  pageSize: number;
  articles: Article[];
}

export interface SingleArticleResponse {
  status: "ok" | "error";
  article: Article | null;
}

export interface SourcesResponse {
  status: "ok";
  totalResults: number;
  sources: Source[];
}

export interface CategoriesResponse {
  status: "ok";
  categories: CategoryMeta[];
}

export interface CountriesResponse {
  status: "ok";
  countries: CountryMeta[];
}

export interface ErrorResponse {
  status: "error";
  code: string;
  message: string;
}

// ─── Meta ─────────────────────────────────────────────────────────────────

export interface CategoryMeta {
  id: string;
  name: string;
  description: string;
}

export interface CountryMeta {
  code: string;
  name: string;
  flag: string;
  sourceCount: number;
}

// ─── Query Params ──────────────────────────────────────────────────────────

export interface NewsQueryParams {
  country?: string;
  category?: string;
  source?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  language?: string;
  sortBy?: "publishedAt" | "relevancy";
}

// ─── RSS Feed ─────────────────────────────────────────────────────────────

export interface ParsedArticle {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  publishedAt: string | null;
}
