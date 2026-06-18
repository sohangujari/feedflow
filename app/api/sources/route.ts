import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, withRateLimitHeaders } from "@/lib/ratelimit";
import { getSources } from "@/lib/db";
import { SourcesResponse, ErrorResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rateLimit = await checkRateLimit(req);
  if (rateLimit.errorResponse) return rateLimit.errorResponse;

  try {
    const sources = await getSources();

    const response: SourcesResponse = {
      status: "ok",
      totalResults: sources.length,
      sources,
    };

    return withRateLimitHeaders(
      NextResponse.json(response, {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }),
      rateLimit.headers
    );
  } catch (err) {
    console.error("[/api/sources] Error:", err);
    return withRateLimitHeaders(
      NextResponse.json(
        { status: "error", code: "server_error", message: "Internal server error." } as ErrorResponse,
        { status: 500 }
      ),
      rateLimit.headers
    );
  }
}
