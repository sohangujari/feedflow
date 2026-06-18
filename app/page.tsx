import Link from "next/link";
import ApiPlayground from "@/components/ApiPlayground";

const endpoints = [
  {
    method: "GET",
    path: "/api/news",
    desc: "Latest headlines across all sources",
    example: "/api/news?pageSize=10",
  },
  {
    method: "GET",
    path: "/api/news?country=IN",
    desc: "Filter by country (IN, US, GB, AU, CA, SG)",
    example: "/api/news?country=IN&category=technology",
  },
  {
    method: "GET",
    path: "/api/news?q=budget",
    desc: "Full-text search across title and description",
    example: "/api/news?q=AI+regulation&country=US",
  },
  {
    method: "GET",
    path: "/api/news/:id",
    desc: "Single article by ID",
    example: "/api/news/uuid-here",
  },
  {
    method: "GET",
    path: "/api/categories",
    desc: "All available categories",
    example: "/api/categories",
  },
  {
    method: "GET",
    path: "/api/countries",
    desc: "Supported countries with source counts",
    example: "/api/countries",
  },
  {
    method: "GET",
    path: "/api/sources",
    desc: "All active RSS sources",
    example: "/api/sources",
  },
];

const params = [
  { name: "country", type: "string", desc: "ISO code - IN, US, GB, AU, CA, SG" },
  { name: "category", type: "string", desc: "general, technology, business, sports, health, science, entertainment" },
  { name: "q", type: "string", desc: "Full-text keyword search" },
  { name: "source", type: "string", desc: "Source ID e.g. ndtv-general, bbc-general" },
  { name: "language", type: "string", desc: "Language code e.g. en" },
  { name: "from", type: "ISO date", desc: "Filter articles published after this date" },
  { name: "to", type: "ISO date", desc: "Filter articles published before this date" },
  { name: "sortBy", type: "string", desc: "publishedAt (default) or relevancy" },
  { name: "page", type: "number", desc: "Page number, default 1" },
  { name: "pageSize", type: "number", desc: "Results per page, default 20, max 100" },
];

const sampleResponse = `{
  "status": "ok",
  "totalResults": 482,
  "page": 1,
  "pageSize": 2,
  "articles": [
    {
      "id": "3f2e1a4b-...",
      "title": "India Unveils New Tech Policy 2026",
      "description": "The government announced sweeping...",
      "url": "https://ndtv.com/india/tech-policy",
      "image": "https://ndtv.com/img/thumb.jpg",
      "source": "NDTV",
      "source_id": "ndtv-general",
      "country": "IN",
      "language": "en",
      "category": "technology",
      "publishedAt": "2026-06-17T08:30:00Z",
      "createdAt": "2026-06-17T08:31:12Z"
    }
  ]
}`;

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#e8e8e8",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;600;700&display=swap');
        
        .glow { text-shadow: 0 0 40px rgba(99,255,180,0.4); }
        .tag { 
          display: inline-block;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .tag-get { background: rgba(99,255,180,0.12); color: #63ffb4; border: 1px solid rgba(99,255,180,0.25); }
        .tag-post { background: rgba(255,165,99,0.12); color: #ffa563; border: 1px solid rgba(255,165,99,0.25); }
        .card {
          background: #111;
          border: 1px solid #222;
          border-radius: 8px;
          padding: 20px 24px;
          transition: border-color 0.2s;
        }
        .card:hover { border-color: #333; }
        .endpoint-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #1a1a1a;
        }
        .endpoint-row:last-child { border-bottom: none; }
        code {
          background: #161616;
          border: 1px solid #252525;
          border-radius: 4px;
          padding: 1px 6px;
          font-size: 13px;
          color: #63ffb4;
          font-family: inherit;
        }
        pre {
          background: #0d0d0d;
          border: 1px solid #1e1e1e;
          border-radius: 8px;
          padding: 24px;
          overflow-x: auto;
          font-size: 13px;
          line-height: 1.7;
          color: #a8e6cf;
          font-family: inherit;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #63ffb4;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .nav-link {
          color: #666;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #e8e8e8; }
        table { width: 100%; border-collapse: collapse; }
        th {
          text-align: left;
          padding: 10px 16px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #555;
          border-bottom: 1px solid #1e1e1e;
        }
        td {
          padding: 12px 16px;
          font-size: 13px;
          border-bottom: 1px solid #141414;
          vertical-align: top;
        }
        tr:last-child td { border-bottom: none; }
        .param-name { color: #63ffb4; }
        .param-type { color: #ffa563; font-size: 11px; }
        .param-desc { color: #888; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid #1a1a1a",
        background: "rgba(10,10,10,0.95)",
        backdropFilter: "blur(10px)",
        padding: "0 40px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#63ffb4", fontWeight: 600, fontSize: "15px", letterSpacing: "-0.02em" }}>
            feed<span style={{ color: "#e8e8e8" }}>flow</span>
          </span>
          <div className="pill" style={{ background: "rgba(99,255,180,0.08)", border: "1px solid rgba(99,255,180,0.15)" }}>
            <div className="dot" />
            <span style={{ color: "#63ffb4" }}>live</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          <a href="#endpoints" className="nav-link">Endpoints</a>
          <a href="#params" className="nav-link">Parameters</a>
          <a href="#response" className="nav-link">Response</a>
          <a href="https://github.com/sohangujari/feedflow" className="nav-link" target="_blank">GitHub ↗</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        padding: "100px 40px 80px",
        maxWidth: "900px",
        margin: "0 auto",
        borderBottom: "1px solid #141414",
      }}>
        <div style={{ marginBottom: "20px" }}>
          <span className="tag tag-get">v1.0</span>
          {" "}
          <span style={{ color: "#444", fontSize: "13px" }}>Free & Open Source</span>
        </div>
        <h1 className="glow" style={{
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: "24px",
        }}>
          Real-time news.<br />
          <span style={{ color: "#63ffb4" }}>No cost. No limits.</span>
        </h1>
        <p style={{
          fontSize: "17px",
          color: "#888",
          lineHeight: 1.7,
          maxWidth: "560px",
          marginBottom: "40px",
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          An open-source news API aggregating 25+ RSS sources across 6 countries.
          Filter by category, country, or keyword. Refreshed every 15 minutes.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href="#endpoints" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            background: "#63ffb4",
            color: "#0a0a0a",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "14px",
            textDecoration: "none",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            View Endpoints →
          </a>
          <a href="https://github.com/sohangujari/feedflow" target="_blank" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            background: "transparent",
            color: "#e8e8e8",
            border: "1px solid #2a2a2a",
            borderRadius: "6px",
            fontWeight: 500,
            fontSize: "14px",
            textDecoration: "none",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            View on GitHub
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1px",
          background: "#1a1a1a",
          border: "1px solid #1a1a1a",
          borderRadius: "8px",
          marginTop: "64px",
          overflow: "hidden",
        }}>
          {[
            { value: "25+", label: "RSS Sources" },
            { value: "6", label: "Countries" },
            { value: "7", label: "Categories" },
            { value: "15min", label: "Refresh Rate" },
          ].map((stat) => (
            <div key={stat.label} style={{
              padding: "24px",
              background: "#0e0e0e",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#63ffb4",
                fontFamily: "'Space Grotesk', sans-serif",
                marginBottom: "4px",
              }}>{stat.value}</div>
              <div style={{ fontSize: "12px", color: "#555", letterSpacing: "0.05em" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE PLAYGROUND */}
      <section style={{ padding: "72px 40px", maxWidth: "1100px", margin: "0 auto", borderBottom: "1px solid #141414" }}>
        <ApiPlayground />
      </section>

      {/* ENDPOINTS */}
      <section id="endpoints" style={{ padding: "72px 40px", maxWidth: "900px", margin: "0 auto", borderBottom: "1px solid #141414" }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: 600, marginBottom: "28px", color: "#e8e8e8" }}>
          Endpoints
        </h2>
        <div className="card">
          {endpoints.map((ep) => (
            <div key={ep.path} className="endpoint-row">
              <span className="tag tag-get" style={{ flexShrink: 0, marginTop: "2px" }}>{ep.method}</span>
              <div style={{ flex: 1 }}>
                <code style={{ marginBottom: "6px", display: "inline-block" }}>{ep.path}</code>
                <p style={{ fontSize: "13px", color: "#666", margin: "6px 0 4px" }}>{ep.desc}</p>
                <p style={{ fontSize: "12px", color: "#444" }}>
                  Example: <code style={{ color: "#888" }}>{ep.example}</code>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PARAMS */}
      <section id="params" style={{ padding: "72px 40px", maxWidth: "900px", margin: "0 auto", borderBottom: "1px solid #141414" }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: 600, marginBottom: "28px", color: "#e8e8e8" }}>
          Query Parameters
        </h2>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <tr key={p.name}>
                  <td><span className="param-name">{p.name}</span></td>
                  <td><span className="param-type">{p.type}</span></td>
                  <td><span className="param-desc">{p.desc}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RESPONSE */}
      <section id="response" style={{ padding: "72px 40px", maxWidth: "900px", margin: "0 auto", borderBottom: "1px solid #141414" }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: 600, marginBottom: "28px", color: "#e8e8e8" }}>
          Response Format
        </h2>
        <pre>{sampleResponse}</pre>
      </section>

      {/* RATE LIMITS & ERRORS */}
      <section id="rate-limits" style={{ padding: "72px 40px", maxWidth: "900px", margin: "0 auto", borderBottom: "1px solid #141414" }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: 600, marginBottom: "12px", color: "#e8e8e8" }}>
          Rate Limits & Errors
        </h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px", lineHeight: 1.7 }}>
          The API is open and requires no authentication. To ensure fair usage, requests are rate-limited by IP address.
          <br /><br />
          <strong>Limit:</strong> 100 requests per 15 minutes per IP.<br />
          <strong>Headers:</strong> <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code>.
        </p>

        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: 600, margin: "36px 0 16px", color: "#e8e8e8" }}>
          Error Codes
        </h3>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>HTTP</th>
                <th>Code</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["429", "rate_limit_exceeded", "Over 100 requests per 15 minutes"],
                ["400", "invalid_param", "A query parameter is malformed"],
                ["404", "not_found", "Article ID not found"],
                ["500", "server_error", "Internal server error"],
              ].map(([status, code, meaning]) => (
                <tr key={code}>
                  <td><span style={{ color: status === "200" ? "#63ffb4" : status.startsWith("4") ? "#ffa563" : "#ff6363" }}>{status}</span></td>
                  <td><code>{code}</code></td>
                  <td><span className="param-desc">{meaning}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* COUNTRIES */}
      <section style={{ padding: "72px 40px", maxWidth: "900px", margin: "0 auto", borderBottom: "1px solid #141414" }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: 600, marginBottom: "28px", color: "#e8e8e8" }}>
          Supported Countries
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {[
            { flag: "🇮🇳", name: "India", code: "IN", sources: 7 },
            { flag: "🇺🇸", name: "United States", code: "US", sources: 8 },
            { flag: "🇬🇧", name: "United Kingdom", code: "GB", sources: 4 },
            { flag: "🇦🇺", name: "Australia", code: "AU", sources: 2 },
            { flag: "🇨🇦", name: "Canada", code: "CA", sources: 2 },
            { flag: "🇸🇬", name: "Singapore", code: "SG", sources: 2 },
          ].map((c) => (
            <div key={c.code} className="card" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>{c.flag}</span>
              <div>
                <div style={{ fontWeight: 500, fontSize: "14px", fontFamily: "'Space Grotesk', sans-serif" }}>{c.name}</div>
                <div style={{ fontSize: "12px", color: "#555" }}>
                  <code>{c.code}</code> · {c.sources} sources
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "40px",
        borderTop: "1px solid #141414",
        textAlign: "center",
        color: "#333",
        fontSize: "13px",
      }}>
        <span>FeedFlow - MIT License · Built with ❤️‍🔥</span>
      </footer>
    </div>
  );
}
