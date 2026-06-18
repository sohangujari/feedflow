import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, withRateLimitHeaders } from "@/lib/ratelimit";
import { CATEGORIES, RSS_SOURCES } from "@/lib/sources";
import { CategoriesResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rateLimit = await checkRateLimit(req);
  if (rateLimit.errorResponse) return rateLimit.errorResponse;

  const { searchParams } = req.nextUrl;
  const country = searchParams.get("country");
  
  let filteredCategories = CATEGORIES;
  if (country) {
    const countries = country.split(",").map(c => c.trim().toUpperCase());
    const validCategories = new Set(
      RSS_SOURCES.filter(s => s.active && countries.includes(s.country)).map(s => s.category)
    );
    filteredCategories = CATEGORIES.filter(c => validCategories.has(c.id));
  }

  const response: CategoriesResponse = {
    status: "ok",
    categories: filteredCategories,
  };

  return withRateLimitHeaders(
    NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }),
    rateLimit.headers
  );
}
