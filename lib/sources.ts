export interface RSSSource {
  id: string;
  name: string;
  url: string;
  country: string; // ISO 3166-1 alpha-2
  category: string;
  language: string;
  active: boolean;
}

export const RSS_SOURCES: RSSSource[] = [
  // ─── INDIA ────────────────────────────────────────────────────────────────
  {
    id: "ndtv-general",
    name: "NDTV",
    url: "https://feeds.feedburner.com/ndtvnews-top-stories",
    country: "IN",
    category: "general",
    language: "en",
    active: true,
  },
  {
    id: "toi-general",
    name: "Times of India",
    url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    country: "IN",
    category: "general",
    language: "en",
    active: true,
  },
  {
    id: "hindu-general",
    name: "The Hindu",
    url: "https://www.thehindu.com/news/feeder/default.rss",
    country: "IN",
    category: "general",
    language: "en",
    active: true,
  },
  {
    id: "indiatoday-general",
    name: "India Today",
    url: "https://www.indiatoday.in/rss/home",
    country: "IN",
    category: "general",
    language: "en",
    active: true,
  },
  {
    id: "ndtv-tech",
    name: "NDTV Gadgets",
    url: "https://feeds.feedburner.com/gadgets360-latest",
    country: "IN",
    category: "technology",
    language: "en",
    active: true,
  },
  {
    id: "livemint-business",
    name: "Livemint",
    url: "https://www.livemint.com/rss/money",
    country: "IN",
    category: "business",
    language: "en",
    active: true,
  },
  {
    id: "espncricinfo-sports",
    name: "ESPNCricinfo",
    url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
    country: "IN",
    category: "sports",
    language: "en",
    active: true,
  },

  // ─── USA ──────────────────────────────────────────────────────────────────
  {
    id: "ap-general",
    name: "NYT News",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
    country: "US",
    category: "general",
    language: "en",
    active: true,
  },
  {
    id: "npr-general",
    name: "NPR News",
    url: "https://feeds.npr.org/1001/rss.xml",
    country: "US",
    category: "general",
    language: "en",
    active: true,
  },
  {
    id: "techcrunch-tech",
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    country: "US",
    category: "technology",
    language: "en",
    active: true,
  },
  {
    id: "wired-tech",
    name: "Wired",
    url: "https://www.wired.com/feed/rss",
    country: "US",
    category: "technology",
    language: "en",
    active: true,
  },
  {
    id: "wsj-business",
    name: "Wall Street Journal",
    url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
    country: "US",
    category: "business",
    language: "en",
    active: true,
  },
  {
    id: "espn-sports",
    name: "ESPN",
    url: "https://www.espn.com/espn/rss/news",
    country: "US",
    category: "sports",
    language: "en",
    active: true,
  },
  {
    id: "healthline-health",
    name: "Healthline",
    url: "https://www.healthline.com/rss/health-news",
    country: "US",
    category: "health",
    language: "en",
    active: true,
  },
  {
    id: "variety-entertainment",
    name: "Variety",
    url: "https://variety.com/feed/",
    country: "US",
    category: "entertainment",
    language: "en",
    active: true,
  },

  // ─── UK ───────────────────────────────────────────────────────────────────
  {
    id: "bbc-general",
    name: "BBC News",
    url: "http://feeds.bbci.co.uk/news/rss.xml",
    country: "GB",
    category: "general",
    language: "en",
    active: true,
  },
  {
    id: "guardian-general",
    name: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
    country: "GB",
    category: "general",
    language: "en",
    active: true,
  },
  {
    id: "bbc-tech",
    name: "BBC Technology",
    url: "http://feeds.bbci.co.uk/news/technology/rss.xml",
    country: "GB",
    category: "technology",
    language: "en",
    active: true,
  },
  {
    id: "guardian-science",
    name: "The Guardian Science",
    url: "https://www.theguardian.com/science/rss",
    country: "GB",
    category: "science",
    language: "en",
    active: true,
  },

  // ─── AUSTRALIA ────────────────────────────────────────────────────────────
  {
    id: "abc-general",
    name: "ABC News Australia",
    url: "https://www.abc.net.au/news/feed/51120/rss.xml",
    country: "AU",
    category: "general",
    language: "en",
    active: true,
  },
  {
    id: "abc-tech",
    name: "iTnews Australia",
    url: "https://www.itnews.com.au/RSS/rss.ashx",
    country: "AU",
    category: "technology",
    language: "en",
    active: true,
  },

  // ─── CANADA ───────────────────────────────────────────────────────────────
  {
    id: "cbc-general",
    name: "CBC News",
    url: "https://www.cbc.ca/cmlink/rss-topstories",
    country: "CA",
    category: "general",
    language: "en",
    active: true,
  },
  {
    id: "cbc-tech",
    name: "CBC Technology",
    url: "https://www.cbc.ca/cmlink/rss-technology",
    country: "CA",
    category: "technology",
    language: "en",
    active: true,
  },

  // ─── SINGAPORE ────────────────────────────────────────────────────────────
  {
    id: "cna-general",
    name: "Channel NewsAsia",
    url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml",
    country: "SG",
    category: "general",
    language: "en",
    active: true,
  },
  {
    id: "straitstimes-business",
    name: "Straits Times Business",
    url: "https://www.straitstimes.com/news/business/rss.xml",
    country: "SG",
    category: "business",
    language: "en",
    active: true,
  },
];

export const CATEGORIES = [
  { id: "general", name: "General", description: "Top headlines and breaking news" },
  { id: "technology", name: "Technology", description: "Tech news, gadgets, and innovation" },
  { id: "business", name: "Business", description: "Finance, markets, and economy" },
  { id: "sports", name: "Sports", description: "Sports news and scores" },
  { id: "health", name: "Health", description: "Health, medicine, and wellness" },
  { id: "science", name: "Science", description: "Science and research discoveries" },
  { id: "entertainment", name: "Entertainment", description: "Movies, music, and celebrity news" },
];

export const COUNTRIES = [
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
];
