import { NextRequest, NextResponse } from "next/server";
import { ErrorResponse } from "@/types";

const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitData {
  count: number;
  resetAt: number;
}

// In-memory store (resets on server restart/cold start)
const rateLimitStore = new Map<string, RateLimitData>();

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function checkRateLimit(req: NextRequest): Promise<{
  errorResponse: NextResponse | null;
  headers: Record<string, string>;
}> {
  const ip = getIP(req);
  const now = Date.now();

  let data = rateLimitStore.get(ip);

  // If new IP or window has expired
  if (!data || data.resetAt < now) {
    data = {
      count: 0,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
  }

  data.count++;
  rateLimitStore.set(ip, data);

  const remaining = Math.max(0, RATE_LIMIT_MAX - data.count);
  const headers = {
    "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": data.resetAt.toString(),
  };

  if (data.count > RATE_LIMIT_MAX) {
    const errorResponse = NextResponse.json(
      {
        status: "error",
        code: "rate_limit_exceeded",
        message: `Rate limit exceeded. You are allowed ${RATE_LIMIT_MAX} requests per 15 minutes.`,
      } as ErrorResponse,
      { status: 429, headers }
    );
    return { errorResponse, headers };
  }

  return { errorResponse: null, headers };
}

export function withRateLimitHeaders(res: NextResponse, headers: Record<string, string>): NextResponse {
  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value);
  }
  return res;
}
