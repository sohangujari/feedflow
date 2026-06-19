-- ============================================================
-- FeedFlow - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable pg_cron extension (available on Supabase free tier)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ARTICLES ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS articles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  url          TEXT UNIQUE NOT NULL,
  image        TEXT,
  source       TEXT NOT NULL,        -- human-readable name e.g. "NDTV"
  source_id    TEXT NOT NULL,        -- slug e.g. "ndtv-general"
  country      CHAR(2) NOT NULL,     -- ISO 3166-1 alpha-2 e.g. "IN"
  language     CHAR(2) NOT NULL DEFAULT 'en',
  category     TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Full-text search vector (auto-updated via trigger)
  search_vector TSVECTOR
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_articles_country      ON articles (country);
CREATE INDEX IF NOT EXISTS idx_articles_category     ON articles (category);
CREATE INDEX IF NOT EXISTS idx_articles_source_id    ON articles (source_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_created_at   ON articles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_country_cat  ON articles (country, category);
CREATE INDEX IF NOT EXISTS idx_articles_search       ON articles USING GIN (search_vector);

-- Trigger to keep search_vector up to date
CREATE OR REPLACE FUNCTION update_articles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('pg_catalog.english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('pg_catalog.english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_articles_search_vector ON articles;
CREATE TRIGGER tg_articles_search_vector
  BEFORE INSERT OR UPDATE OF title, description
  ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_search_vector();

-- ─── SOURCES ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sources (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id  TEXT UNIQUE NOT NULL,  -- matches RSS_SOURCES[].id
  name       TEXT NOT NULL,
  url        TEXT UNIQUE NOT NULL,
  country    CHAR(2) NOT NULL,
  category   TEXT NOT NULL,
  language   CHAR(2) NOT NULL DEFAULT 'en',
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);



-- ─── RLS (Row Level Security) ────────────────────────────────────────────────
-- Articles and sources are publicly readable (our API handles auth)

ALTER TABLE articles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources   ENABLE ROW LEVEL SECURITY;

-- Public access on articles & sources (bypasses need for service_role key)
CREATE POLICY "Public read articles"
  ON articles FOR SELECT USING (true);

CREATE POLICY "Public insert articles" 
  ON articles FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update articles" 
  ON articles FOR UPDATE USING (true);

CREATE POLICY "Public read sources"
  ON sources FOR SELECT USING (true);

-- ─── SEED SOURCES ────────────────────────────────────────────────────────────

INSERT INTO sources (source_id, name, url, country, category, language) VALUES
  ('ndtv-general',        'NDTV',                   'https://feeds.feedburner.com/ndtvnews-top-stories',                    'IN', 'general',       'en'),
  ('toi-general',         'Times of India',          'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',          'IN', 'general',       'en'),
  ('hindu-general',       'The Hindu',               'https://www.thehindu.com/news/feeder/default.rss',                    'IN', 'general',       'en'),
  ('indiatoday-general',  'India Today',             'https://www.indiatoday.in/rss/home',                                  'IN', 'general',       'en'),
  ('ndtv-tech',           'NDTV Gadgets',            'https://feeds.feedburner.com/gadgets360-latest',                      'IN', 'technology',    'en'),
  ('livemint-business',   'Livemint',                'https://www.livemint.com/rss/money',                                  'IN', 'business',      'en'),
  ('espncricinfo-sports', 'ESPNCricinfo',            'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',          'IN', 'sports',        'en'),
  ('indianexpress-general', 'The Indian Express',    'https://indianexpress.com/feed/',                                     'IN', 'general',       'en'),
  ('moneycontrol-business', 'Moneycontrol',          'https://www.moneycontrol.com/rss/latestnews.xml',                     'IN', 'business',      'en'),
  ('economictimes-business', 'The Economic Times',   'https://economictimes.indiatimes.com/rssfeedstopstories.cms',         'IN', 'business',      'en'),
  ('hindustantimes-general', 'Hindustan Times',      'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',     'IN', 'general',       'en'),
  ('news18-general',      'News18',                  'https://www.news18.com/rss/india.xml',                                'IN', 'general',       'en'),
  ('ap-general',          'NYT News',                'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',           'US', 'general',       'en'),
  ('npr-general',         'NPR News',                'https://feeds.npr.org/1001/rss.xml',                                  'US', 'general',       'en'),
  ('techcrunch-tech',     'TechCrunch',              'https://techcrunch.com/feed/',                                        'US', 'technology',    'en'),
  ('wired-tech',          'Wired',                   'https://www.wired.com/feed/rss',                                      'US', 'technology',    'en'),
  ('wsj-business',        'Wall Street Journal',     'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',                      'US', 'business',      'en'),
  ('espn-sports',         'ESPN',                    'https://www.espn.com/espn/rss/news',                                  'US', 'sports',        'en'),
  ('healthline-health',   'Healthline',              'https://www.healthline.com/rss/health-news',                          'US', 'health',        'en'),
  ('entertainment-weekly','Entertainment Weekly',    'https://ew.com/feed/',                                                'US', 'entertainment', 'en'),
  ('variety-entertainment','Variety',                'https://variety.com/feed/',                                           'US', 'entertainment', 'en'),
  ('cnn-general',         'CNN',                     'http://rss.cnn.com/rss/cnn_topstories.rss',                           'US', 'general',       'en'),
  ('foxnews-general',     'Fox News',                'https://feeds.foxnews.com/foxnews/latest',                            'US', 'general',       'en'),
  ('theverge-tech',       'The Verge',               'https://www.theverge.com/rss/index.xml',                              'US', 'technology',    'en'),
  ('ign-entertainment',   'IGN',                     'https://feeds.feedburner.com/ign/news',                               'US', 'entertainment', 'en'),
  ('washingtonpost-general', 'Washington Post',      'https://feeds.washingtonpost.com/rss/world',                          'US', 'general',       'en'),
  ('cbsnews-general',     'CBS News',                'https://www.cbsnews.com/latest/rss/main',                             'US', 'general',       'en'),
  ('latimes-general',     'LA Times',                'https://www.latimes.com/world-nation/rss2.0.xml',                     'US', 'general',       'en'),
  ('bbc-general',         'BBC News',                'http://feeds.bbci.co.uk/news/rss.xml',                                'GB', 'general',       'en'),
  ('guardian-general',    'The Guardian',            'https://www.theguardian.com/world/rss',                               'GB', 'general',       'en'),
  ('bbc-tech',            'BBC Technology',          'http://feeds.bbci.co.uk/news/technology/rss.xml',                     'GB', 'technology',    'en'),
  ('guardian-science',    'The Guardian Science',    'https://www.theguardian.com/science/rss',                             'GB', 'science',       'en'),
  ('aljazeera-general',   'Al Jazeera English',      'https://www.aljazeera.com/xml/rss/all.xml',                           'GB', 'general',       'en'),
  ('abc-general',         'ABC News Australia',      'https://www.abc.net.au/news/feed/51120/rss.xml',                      'AU', 'general',       'en'),
  ('abc-tech',            'iTnews Australia',        'https://www.itnews.com.au/RSS/rss.ashx',                              'AU', 'technology',    'en'),
  ('smh-general',         'The Sydney Morning Herald', 'https://www.smh.com.au/rss/feed.xml',                               'AU', 'general',       'en'),
  ('cbc-general',         'CBC News',                'https://www.cbc.ca/cmlink/rss-topstories',                            'CA', 'general',       'en'),
  ('cbc-tech',            'CBC Technology',          'https://www.cbc.ca/cmlink/rss-technology',                            'CA', 'technology',    'en'),
  ('globeandmail-general', 'The Globe and Mail',     'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/canada/', 'CA', 'general',    'en'),
  ('cna-general',         'Channel NewsAsia',        'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml','SG', 'general',       'en'),
  ('straitstimes-business','Straits Times Business', 'https://www.straitstimes.com/news/business/rss.xml',                 'SG', 'business',      'en')
ON CONFLICT (source_id) DO NOTHING;

-- ─── PG_CRON JOBS ────────────────────────────────────────────────────────────
-- These call your Vercel API endpoints on a schedule.
-- Replace YOUR_VERCEL_URL and YOUR_CRON_SECRET with actual values.

-- Fetch news every 30 minutes
SELECT cron.schedule(
  'fetch-news-every-30min',
  '*/30 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://YOUR_VERCEL_URL/api/cron',
      headers := '{"Content-Type": "application/json", "x-cron-secret": "YOUR_CRON_SECRET"}'::jsonb,
      body := '{"action": "fetch"}'::jsonb
    );
  $$
);

-- Prune articles older than 7 days - runs daily at 2am UTC
SELECT cron.schedule(
  'prune-old-articles-daily',
  '0 2 * * *',
  $$
    SELECT net.http_post(
      url := 'https://YOUR_VERCEL_URL/api/cron',
      headers := '{"Content-Type": "application/json", "x-cron-secret": "YOUR_CRON_SECRET"}'::jsonb,
      body := '{"action": "prune"}'::jsonb
    );
  $$
);
