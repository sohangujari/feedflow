import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, withRateLimitHeaders } from "@/lib/ratelimit";
import { CATEGORIES } from "@/lib/sources";
import { CategoriesResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rateLimit = await checkRateLimit(req);
  if (rateLimit.errorResponse) return rateLimit.errorResponse;

  const response: CategoriesResponse = {
    status: "ok",
    categories: CATEGORIES,
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
