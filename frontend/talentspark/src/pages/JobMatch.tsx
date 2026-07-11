import { useState } from "react";
import { matchJobs, embedJobs, semanticSearch } from "../Services/RagService";
import type { JobMatchResult, SemanticSearchResult } from "../types/rag";

type Props = { onNavigate?: (page: string) => void };

function ScoreBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)";
  return (
    <span style={{
      background: `${color}18`,
      color,
      border: `1px solid ${color}30`,
      padding: "0.2rem 0.6rem",
      borderRadius: "100px",
      fontSize: "0.78rem",
      fontWeight: 700,
    }}>
      {pct}% match
    </span>
  );
}

function JobResultCard({ title, description, salary, onApply }: {
  title: string; description: string; salary?: number | null; onApply: () => void;
}) {
  return (
    <div className="list-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 0.25rem", color: "var(--text-h)" }}>{title}</h4>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text)", lineHeight: 1.5 }}>
            {description?.slice(0, 140)}{description?.length > 140 ? "…" : ""}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 }}>
          {salary != null && (
            <span style={{ fontSize: "0.82rem", color: "var(--success)", fontWeight: 600 }}>
              💰 ${Number(salary).toLocaleString()}
            </span>
          )}
          <button className="btn-primary" onClick={onApply} style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>
            Apply →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobMatch({ onNavigate }: Props) {
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [matches, setMatches] = useState<JobMatchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SemanticSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [embedMsg, setEmbedMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "match">("search");

  const handleEmbed = async () => {
    setLoading(true);
    setEmbedMsg("");
    try {
      const result = await embedJobs();
      setEmbedMsg(result.message);
    } catch {
      setEmbedMsg("⚠️ Failed to embed jobs. Is Qdrant running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearchResults([]);
    try {
      const result = await semanticSearch(searchQuery);
      setSearchResults(result.results);
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!skills.trim()) return;
    setLoading(true);
    setMatches([]);
    try {
      const result = await matchJobs(skills, experience);
      setMatches(result.matches);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 860 }}>
      <div className="page-header">
        <h2 className="gradient-text">Smart Job Match</h2>
        <p>Semantic AI search — find jobs that truly fit your skills and experience</p>
      </div>

      {/* Embed Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.85rem 1.25rem",
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        marginBottom: "1.5rem",
        gap: "1rem",
        flexWrap: "wrap",
      }}>
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: "var(--text-h)", fontSize: "0.9rem" }}>
            Vector Database
          </p>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-dim)" }}>
            {embedMsg || "Index all jobs into Qdrant before searching"}
          </p>
        </div>
        <button onClick={handleEmbed} disabled={loading} style={{ fontSize: "0.85rem", flexShrink: 0 }}>
          {loading ? "Indexing…" : "⟳ Index Jobs"}
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === "search" ? "active" : ""}`} onClick={() => setActiveTab("search")}>
          🔍 Semantic Search
        </button>
        <button className={`tab-btn ${activeTab === "match" ? "active" : ""}`} onClick={() => setActiveTab("match")}>
          ✦ Profile Match
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === "search" && (
        <div className="animate-fadein">
          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Search by Natural Language</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text)", marginBottom: "1.25rem" }}>
              Describe the role you're looking for — skills, tech stack, or job title.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='e.g. "Python backend developer with FastAPI"'
                style={{ marginBottom: 0, flex: 1 }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="btn-primary"
                style={{ flexShrink: 0 }}
              >
                {loading ? "…" : "Search"}
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} className="stagger">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                <h3 style={{ margin: 0 }}>Results</h3>
                <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>{searchResults.length} matches</span>
              </div>
              {searchResults.map((r, i) => (
                <div key={i} className="list-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                        <h4 style={{ margin: 0 }}>{r.title}</h4>
                        <ScoreBadge value={r.score} />
                      </div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text)" }}>
                        {r.description?.slice(0, 160)}…
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 }}>
                      {r.salary != null && (
                        <span style={{ fontSize: "0.82rem", color: "var(--success)", fontWeight: 600 }}>
                          💰 ${Number(r.salary).toLocaleString()}
                        </span>
                      )}
                      <button className="btn-primary" onClick={() => onNavigate?.("application")} style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>
                        Apply →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Match Tab */}
      {activeTab === "match" && (
        <div className="animate-fadein">
          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Match Your Profile</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text)", marginBottom: "1.25rem" }}>
              Enter your skills and experience to get AI-ranked job recommendations.
            </p>
            <label>Your Skills</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Python, React, SQL, Docker…"
            />
            <label>Your Experience</label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="3 years web development, led team of 4…"
              style={{ marginBottom: "1.25rem" }}
            />
            <button
              onClick={handleMatch}
              disabled={loading || !skills.trim()}
              className="btn-primary"
              style={{ width: "100%", padding: "0.75rem" }}
            >
              {loading ? "Finding matches…" : "✦ Find My Matches"}
            </button>
          </div>

          {matches.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} className="stagger">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                <h3 style={{ margin: 0 }}>Top Matches</h3>
                <span style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>{matches.length} results</span>
              </div>
              {matches.map((m, i) => (
                <div key={i} className="list-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                        <h4 style={{ margin: 0 }}>{m.title}</h4>
                        <span style={{
                          background: "rgba(16,185,129,0.15)", color: "var(--success)",
                          border: "1px solid rgba(16,185,129,0.25)",
                          padding: "0.2rem 0.6rem", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 700,
                        }}>
                          {m.match_score}%
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text)" }}>
                        {m.description?.slice(0, 160)}…
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 }}>
                      {m.salary != null && (
                        <span style={{ fontSize: "0.82rem", color: "var(--success)", fontWeight: 600 }}>
                          💰 ${Number(m.salary).toLocaleString()}
                        </span>
                      )}
                      <button className="btn-primary" onClick={() => onNavigate?.("application")} style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>
                        Apply →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
