import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, withRateLimitHeaders } from "@/lib/ratelimit";
import { COUNTRIES, RSS_SOURCES } from "@/lib/sources";
import { CountriesResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rateLimit = await checkRateLimit(req);
  if (rateLimit.errorResponse) return rateLimit.errorResponse;

  const countries = COUNTRIES.map((c) => ({
    ...c,
    sourceCount: RSS_SOURCES.filter((s) => s.country === c.code && s.active).length,
  }));

  const response: CountriesResponse = {
    status: "ok",
    countries,
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
