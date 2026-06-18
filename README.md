# FeedFlow

A free, open-source real-time news API built on **Next.js + Supabase + Vercel**. Aggregates 25+ RSS sources across 6 countries with full-text search, category/country filtering, thumbnail images, and API key rate limiting.

## Features

- 📰 **25 RSS sources** — India, USA, UK, Australia, Canada, Singapore
- 🖼️ **Images & thumbnails** — Extracted from RSS feeds + `og:image` scraping fallback
- 🌍 **Country & category filtering**
- 🔍 **Full-text search** via PostgreSQL `tsvector`
- 🛡️ **IP-based rate limiting** (100 req/15min)
- ⏰ **Auto-refresh** every 15 minutes via Supabase `pg_cron`
- 🗑️ **Auto-prune** articles older than 7 days
- 💸 **Truly free** on Vercel + Supabase free tiers

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | Latest articles (all sources) |
| GET | `/api/news?country=IN` | Filter by country code |
| GET | `/api/news?category=technology` | Filter by category |
| GET | `/api/news?q=budget` | Full-text search |
| GET | `/api/news?country=US&category=sports` | Combined filters |
| GET | `/api/news/:id` | Single article by ID |
| GET | `/api/categories` | All categories |
| GET | `/api/countries` | Supported countries |
| GET | `/api/sources` | All active RSS sources |

### Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `country` | string | ISO code — IN, US, GB, AU, CA, SG |
| `category` | string | general, technology, business, sports, health, science, entertainment |
| `q` | string | Full-text keyword search |
| `source` | string | Source ID e.g. `ndtv-general`, `bbc-general` |
| `language` | string | Language code e.g. `en` |
| `from` | ISO date | Articles published after this date |
| `to` | ISO date | Articles published before this date |
| `sortBy` | string | `publishedAt` (default) or `relevancy` |
| `page` | number | Page number, default 1 |
| `pageSize` | number | Results per page, default 20, max 100 |

---

## Setup Guide

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) account (free)
- A [Vercel](https://vercel.com) account (free)

---

### Step 1 — Clone & Install

```bash
git clone https://github.com/your-username/feedflow.git
cd feedflow
npm install
```

---

### Step 2 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Once created, go to **SQL Editor** and run the full contents of `supabase/schema.sql`
3. This creates:
   - `articles` table with full-text search index
   - `sources` table (pre-seeded with 25 sources)

   - `pg_cron` jobs for auto-fetching and pruning

4. Copy your credentials from **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(keep this secret!)*

---

### Step 3 — Configure pg_cron

In `supabase/schema.sql`, near the bottom, update the cron jobs with your actual values:

```sql
SELECT cron.schedule(
  'fetch-news-every-15min',
  '*/15 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://YOUR_VERCEL_URL/api/cron',   -- ← your Vercel URL
      headers := '{"Content-Type": "application/json", "x-cron-secret": "YOUR_CRON_SECRET"}'::jsonb,
      body := '{"action": "fetch"}'::jsonb
    );
  $$
);
```

**Note:** Supabase requires the `pg_net` extension for HTTP calls from cron. Enable it in **Database → Extensions → pg_net**.

---

### Step 4 — Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
CRON_SECRET=any-long-random-string-you-choose
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

---

### Step 5 — Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see the docs page.

Trigger a manual fetch (replace secret):
```bash
curl -X POST http://localhost:3000/api/cron \
  -H "x-cron-secret: your-cron-secret" \
  -H "Content-Type: application/json" \
  -d '{"action": "fetch"}'
```

---

### Step 6 — Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Then add environment variables in Vercel Dashboard → **Settings → Environment Variables**.

Or use the CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add CRON_SECRET
vercel env add NEXT_PUBLIC_APP_URL
```

Redeploy after adding vars:
```bash
vercel --prod
```



---

### Step 8 — Update pg_cron with Final URL

Go back to Supabase SQL Editor and update the cron jobs with your Vercel production URL:

```sql
SELECT cron.unschedule('fetch-news-every-15min');
SELECT cron.unschedule('prune-old-articles-daily');

-- Re-run the cron schedule SQL from schema.sql with your real URL
```

---

## Usage Examples

```bash
# Latest India tech news
curl "https://your-project.vercel.app/api/news?country=IN&category=technology"

# Search for AI news in the US
curl "https://your-project.vercel.app/api/news?q=artificial+intelligence&country=US"

# BBC articles only
curl "https://your-project.vercel.app/api/news?source=bbc-general&pageSize=5"

# Paginated results
curl "https://your-project.vercel.app/api/news?page=2&pageSize=50"

# Date range
curl "https://your-project.vercel.app/api/news?from=2026-06-01&to=2026-06-17"
```

---

## Adding More Sources

Edit `lib/sources.ts` and add to the `RSS_SOURCES` array:

```ts
{
  id: "reuters-general",
  name: "Reuters",
  url: "https://feeds.reuters.com/reuters/topNews",
  country: "US",
  category: "general",
  language: "en",
  active: true,
}
```

Then run the seed SQL again or insert directly:
```sql
INSERT INTO sources (source_id, name, url, country, category, language)
VALUES ('reuters-general', 'Reuters', 'https://feeds.reuters.com/reuters/topNews', 'US', 'general', 'en');
```

---

## Free Tier Limits

| Service | Limit | Notes |
|---------|-------|-------|
| Vercel Functions | 100GB bandwidth, 100k invocations/day | Well within limits |
| Supabase DB | 500MB storage | ~500k articles |
| Supabase pg_cron | Included | ✅ |
| Rate limit | 100 req/15min per IP | In-memory |

> ⚠️ **Supabase Inactivity Warning**: Supabase pauses free projects after 7 days of inactivity. Since pg_cron runs every 15 minutes, this won't be an issue as long as the cron job is active.

---

## Project Structure

```
feedflow/
├── app/
│   ├── api/
│   │   ├── news/route.ts          # GET /api/news
│   │   ├── news/[id]/route.ts     # GET /api/news/:id
│   │   ├── categories/route.ts    # GET /api/categories
│   │   ├── countries/route.ts     # GET /api/countries
│   │   ├── sources/route.ts       # GET /api/sources
│   │   └── cron/route.ts          # POST /api/cron (fetcher)
│   ├── layout.tsx
│   ├── page.tsx                   # Docs landing page
│   └── globals.css
├── lib/
│   ├── supabase.ts                # Supabase client
│   ├── ratelimit.ts               # IP-based rate limiting
│   ├── fetcher.ts                 # RSS parser + og:image scraper
│   ├── db.ts                      # Database helpers
│   └── sources.ts                 # RSS sources config
├── types/index.ts                 # TypeScript types
├── supabase/schema.sql            # Full DB schema + pg_cron setup
└── .env.example
```

---

## License

MIT — use freely, contribute back!
