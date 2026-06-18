import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, withRateLimitHeaders } from "@/lib/ratelimit";
import { queryArticles } from "@/lib/db";
import { NewsQueryParams, NewsResponse, ErrorResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Rate limit check
  const rateLimit = await checkRateLimit(req);
  if (rateLimit.errorResponse) return rateLimit.errorResponse;

  const { searchParams } = req.nextUrl;

  // Parse query params
  const params: NewsQueryParams = {
    country:  searchParams.get("country")  ?? undefined,
    category: searchParams.get("category") ?? undefined,
    source:   searchParams.get("source")   ?? undefined,
    q:        searchParams.get("q")        ?? undefined,
    language: searchParams.get("language") ?? undefined,
    from:     searchParams.get("from")     ?? undefined,
    to:       searchParams.get("to")       ?? undefined,
    sortBy:   (searchParams.get("sortBy") as NewsQueryParams["sortBy"]) ?? "publishedAt",
    page:     parseInt(searchParams.get("page") ?? "1", 10),
    pageSize: parseInt(searchParams.get("pageSize") ?? "20", 10),
  };

  // Validate dates
  if (params.from && isNaN(Date.parse(params.from))) {
    return withRateLimitHeaders(
      NextResponse.json(
        { status: "error", code: "invalid_param", message: "'from' must be a valid ISO date." } as ErrorResponse,
        { status: 400 }
      ),
      rateLimit.headers
    );
  }
  if (params.to && isNaN(Date.parse(params.to))) {
    return withRateLimitHeaders(
      NextResponse.json(
        { status: "error", code: "invalid_param", message: "'to' must be a valid ISO date." } as ErrorResponse,
        { status: 400 }
      ),
      rateLimit.headers
    );
  }

  try {
    const { articles, total } = await queryArticles(params);

    const response: NewsResponse = {
      status: "ok",
      totalResults: total,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      articles,
    };

    return withRateLimitHeaders(
      NextResponse.json(response, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }),
      rateLimit.headers
    );
  } catch (err) {
    console.error("[/api/news] Error:", err);
    return withRateLimitHeaders(
      NextResponse.json(
        { status: "error", code: "server_error", message: "Internal server error." } as ErrorResponse,
        { status: 500 }
      ),
      rateLimit.headers
    );
  }
}
