import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, withRateLimitHeaders } from "@/lib/ratelimit";
import { getArticleById } from "@/lib/db";
import { SingleArticleResponse, ErrorResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimit = await checkRateLimit(req);
  if (rateLimit.errorResponse) return rateLimit.errorResponse;

  const { id } = await params;

  if (!id) {
    return withRateLimitHeaders(
      NextResponse.json(
        { status: "error", code: "missing_id", message: "Article ID is required." } as ErrorResponse,
        { status: 400 }
      ),
      rateLimit.headers
    );
  }

  try {
    const article = await getArticleById(id);

    if (!article) {
      return withRateLimitHeaders(
        NextResponse.json(
          { status: "error", code: "not_found", message: `Article with id '${id}' not found.` } as ErrorResponse,
          { status: 404 }
        ),
        rateLimit.headers
      );
    }

    return withRateLimitHeaders(
      NextResponse.json(
        { status: "ok", article } as SingleArticleResponse,
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      ),
      rateLimit.headers
    );
  } catch (err) {
    console.error("[/api/news/[id]] Error:", err);
    return withRateLimitHeaders(
      NextResponse.json(
        { status: "error", code: "server_error", message: "Internal server error." } as ErrorResponse,
        { status: 500 }
      ),
      rateLimit.headers
    );
  }
}
