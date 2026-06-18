"use client";

import { useState, useEffect } from "react";

function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedArray = value ? value.split(',') : [];

  const toggle = (val: string) => {
    if (val === "") {
      onChange("");
      setOpen(false);
      return;
    }
    let newArr = [...selectedArray];
    if (newArr.includes(val)) {
      newArr = newArr.filter(v => v !== val);
    } else {
      newArr.push(val);
    }
    onChange(newArr.join(','));
  };

  const displayText = selectedArray.length === 0 
    ? placeholder 
    : selectedArray.length === 1 
      ? (options.find(o => o.value === selectedArray[0])?.label || selectedArray[0])
      : `${selectedArray.length} selected`;

  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <label className="pg-label">{label}</label>
      <div 
        className="pg-select" 
        style={{ cursor: 'pointer', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} 
        onClick={() => setOpen(!open)}
      >
        <span style={{ color: selectedArray.length === 0 ? '#888' : '#e8e8e8' }}>{displayText}</span>
        <span style={{ fontSize: '10px' }}>▼</span>
      </div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, 
            background: '#111', border: '1px solid #222', borderRadius: '6px', 
            marginTop: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto',
            boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
          }}>
            <div 
              style={{ padding: '8px 14px', cursor: 'pointer', borderBottom: '1px solid #222', color: selectedArray.length === 0 ? '#63ffb4' : '#e8e8e8' }}
              onClick={() => toggle("")}
            >
              Any (All)
            </div>
            {options.map(o => (
              <div 
                key={o.value} 
                style={{ padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => toggle(o.value)}
              >
                <input type="checkbox" checked={selectedArray.includes(o.value)} readOnly style={{ cursor: 'pointer' }} />
                <span style={{ color: selectedArray.includes(o.value) ? '#63ffb4' : '#e8e8e8' }}>{o.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ApiPlayground() {
  const [endpoint, setEndpoint] = useState("/api/news");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");
  const [articleId, setArticleId] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [dynamicCountries, setDynamicCountries] = useState<any[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);
  const [dynamicSources, setDynamicSources] = useState<any[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [cRes, catRes, sRes] = await Promise.all([
          fetch("/api/countries").then(r => r.json()),
          fetch("/api/categories").then(r => r.json()),
          fetch("/api/sources").then(r => r.json())
        ]);
        if (cRes.countries) setDynamicCountries(cRes.countries);
        if (catRes.categories) setDynamicCategories(catRes.categories);
        if (sRes.sources) setDynamicSources(sRes.sources);
      } catch (err) {
        console.error("Failed to load dynamic options", err);
      }
    };
    fetchOptions();
  }, []);

  // Generate URL based on state
  const getUrl = () => {
    let url = typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000";
    if (endpoint === "/api/news/:id") {
      url += `/api/news/${articleId || "uuid-here"}`;
      return url;
    }
    
    url += endpoint;
    const params = new URLSearchParams();
    if (country) params.append("country", country);
    if (category) params.append("category", category);
    
    if (endpoint === "/api/news") {
      if (source) params.append("source", source);
      if (q) params.append("q", q);
    }
    
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
      `}</style>

      <div className="pg-left">
        <label className="pg-label">Endpoint</label>
        <select className="pg-select" value={endpoint} onChange={e => {
          setEndpoint(e.target.value);
          setResponse(null);
          setCountry("");
          setCategory("");
          setSource("");
          setQ("");
        }}>
          <option value="/api/news">GET /api/news</option>
          <option value="/api/news/:id">GET /api/news/:id</option>
          <option value="/api/categories">GET /api/categories</option>
          <option value="/api/countries">GET /api/countries</option>
          <option value="/api/sources">GET /api/sources</option>
        </select>

        {(endpoint === "/api/news" || endpoint === "/api/sources" || endpoint === "/api/categories" || endpoint === "/api/countries") && (
          <>
            <MultiSelect
              label="Country (comma-separated for multiple)"
              placeholder="e.g. US, IN (Leave blank for all)"
              value={country}
              onChange={setCountry}
              options={dynamicCountries.map(c => ({ value: c.code, label: c.name }))}
            />

            <MultiSelect
              label="Category (comma-separated for multiple)"
              placeholder="e.g. technology, science (Leave blank for all)"
              value={category}
              onChange={setCategory}
              options={dynamicCategories.map(c => ({ value: c.id, label: c.name }))}
            />
          </>
        )}

        {endpoint === "/api/news" && (
          <>
            <MultiSelect
              label="Source (comma-separated for multiple)"
              placeholder="e.g. ndtv-general, techcrunch-tech (Leave blank for all)"
              value={source}
              onChange={setSource}
              options={dynamicSources.map(s => ({ value: s.id, label: s.name }))}
            />

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
