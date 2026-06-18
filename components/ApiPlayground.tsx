"use client";

import { useState } from "react";

const COUNTRIES = ["All", "IN", "US", "GB", "AU", "CA", "SG"];
const CATEGORIES = ["All", "general", "technology", "business", "sports", "health", "science", "entertainment"];

export default function ApiPlayground() {
  const [endpoint, setEndpoint] = useState("/api/news");
  const [country, setCountry] = useState("All");
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");
  const [articleId, setArticleId] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate URL based on state
  const getUrl = () => {
    let url = typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000";
    if (endpoint === "/api/news/:id") {
      url += `/api/news/${articleId || "uuid-here"}`;
      return url;
    }
    
    url += endpoint;
    const params = new URLSearchParams();
    if (country !== "All") params.append("country", country);
    if (category !== "All") params.append("category", category);
    if (q) params.append("q", q);
    
    const qs = params.toString();
    if (qs) url += `?${qs}`;
    return url;
  };

  const fullUrl = getUrl();
  const curlCommand = `curl --request GET \\\n  --url '${fullUrl}'`;

  const handleTest = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000";
      const res = await fetch(fullUrl.replace(baseUrl, ""));
      const data = await res.json();
      setResponse(data);
    } catch (e: any) {
      setResponse({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="playground-container" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <style>{`
         .playground-container {
           width: 100%;
         }
         .pg-left {
           flex: 1;
           min-width: 320px;
         }
         .pg-right {
           flex: 1.2;
           min-width: 320px;
           background: #0d0d0d;
           border: 1px solid #1e1e1e;
           border-radius: 12px;
           overflow: hidden;
           position: sticky;
           top: 80px;
           box-shadow: 0 20px 40px rgba(0,0,0,0.4);
         }
         .pg-label {
           display: block;
           font-family: 'Space Grotesk', sans-serif;
           font-size: 13px;
           color: #888;
           margin-bottom: 6px;
           font-weight: 500;
         }
         .pg-input, .pg-select {
           width: 100%;
           background: #111;
           border: 1px solid #222;
           border-radius: 6px;
           padding: 10px 14px;
           color: #e8e8e8;
           font-family: inherit;
           font-size: 14px;
           margin-bottom: 20px;
           transition: border-color 0.2s;
         }
         .pg-input:focus, .pg-select:focus {
           outline: none;
           border-color: #63ffb4;
         }
         .pg-header {
           background: #151515;
           padding: 12px 16px;
           border-bottom: 1px solid #1e1e1e;
           display: flex;
           justify-content: space-between;
           align-items: center;
         }
         .pg-code-block {
           padding: 20px;
           margin: 0;
           font-size: 13px;
           color: #a8e6cf;
           overflow-x: auto;
           background: transparent;
           border: none;
           line-height: 1.6;
         }
         .pg-btn-copy {
           background: transparent;
           border: 1px solid #333;
           color: #888;
           padding: 4px 10px;
           border-radius: 4px;
           font-size: 12px;
           cursor: pointer;
           transition: all 0.2s;
         }
         .pg-btn-copy:hover {
           background: #222;
           color: #e8e8e8;
         }
         .pg-btn-run {
           background: #63ffb4;
           color: #0a0a0a;
           border: none;
           padding: 12px 24px;
           border-radius: 6px;
           font-family: 'Space Grotesk', sans-serif;
           font-weight: 600;
           font-size: 14px;
           cursor: pointer;
           transition: opacity 0.2s;
           width: 100%;
           margin-top: 10px;
         }
         .pg-btn-run:hover { opacity: 0.9; }
         .pg-btn-run:disabled { opacity: 0.5; cursor: not-allowed; }
         .pg-tabs {
           display: flex;
           border-bottom: 1px solid #1e1e1e;
           border-top: 1px solid #1e1e1e;
           background: #0a0a0a;
         }
         .pg-tab {
           padding: 10px 20px;
           font-size: 13px;
           color: #888;
           cursor: pointer;
           border-bottom: 2px solid transparent;
           margin-bottom: -1px;
         }
         .pg-tab.active {
           color: #63ffb4;
           border-bottom-color: #63ffb4;
         }
         .pg-response {
            max-height: 400px;
            overflow-y: auto;
         }
         /* Syntax highlighting for JSON */
         .json-key { color: #a8e6cf; }
         .json-string { color: #ffa563; }
         .json-number { color: #82aaff; }
         .json-boolean { color: #c792ea; }
         .json-null { color: #ff5370; }
      `}</style>

      <div className="pg-left">
        <label className="pg-label">Endpoint</label>
        <select className="pg-select" value={endpoint} onChange={e => {
          setEndpoint(e.target.value);
          setResponse(null);
        }}>
          <option value="/api/news">GET /api/news</option>
          <option value="/api/news/:id">GET /api/news/:id</option>
          <option value="/api/categories">GET /api/categories</option>
          <option value="/api/countries">GET /api/countries</option>
          <option value="/api/sources">GET /api/sources</option>
        </select>

        {endpoint === "/api/news" && (
          <>
            <label className="pg-label">Country</label>
            <select className="pg-select" value={country} onChange={e => setCountry(e.target.value)}>
              {COUNTRIES.map(c => <option key={c} value={c}>{c === "All" ? "Any (All)" : c}</option>)}
            </select>

            <label className="pg-label">Category</label>
            <select className="pg-select" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c === "All" ? "Any (All)" : c}</option>)}
            </select>

            <label className="pg-label">Search Query (q)</label>
            <input 
              type="text" 
              className="pg-input" 
              placeholder="e.g. artificial intelligence" 
              value={q} 
              onChange={e => setQ(e.target.value)} 
            />
          </>
        )}

        {endpoint === "/api/news/:id" && (
          <>
            <label className="pg-label">Article ID</label>
            <input 
              type="text" 
              className="pg-input" 
              placeholder="Enter a valid UUID..." 
              value={articleId} 
              onChange={e => setArticleId(e.target.value)} 
            />
          </>
        )}

        <button className="pg-btn-run" onClick={handleTest} disabled={loading}>
          {loading ? "Sending Request..." : "Test Request"}
        </button>
      </div>

      <div className="pg-right">
        <div className="pg-header">
          <span style={{ fontSize: "13px", color: "#888", fontFamily: "'Space Grotesk', sans-serif" }}>cURL</span>
          <button className="pg-btn-copy" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="pg-code-block">{curlCommand}</pre>

        {response && (
          <>
            <div className="pg-tabs">
              <div className="pg-tab active">Response</div>
            </div>
            <pre className="pg-code-block pg-response" style={{ color: "#e8e8e8" }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
