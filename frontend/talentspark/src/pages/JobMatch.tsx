import { useState } from "react";
import { matchJobs, embedJobs, semanticSearch } from "../Services/RagService";
import type { JobMatchResult, SemanticSearchResult } from "../types/rag";

function JobMatch() {
    const [skills, setSkills] = useState("");
    const [experience, setExperience] = useState("");
    const [matches, setMatches] = useState<JobMatchResult[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SemanticSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [embedMsg, setEmbedMsg] = useState("");

    const handleEmbed = async () => {
        setLoading(true);
        setEmbedMsg("");
        try {
            const result = await embedJobs();
            setEmbedMsg(result.message);
        } catch {
            setEmbedMsg("Failed to embed jobs. Is Qdrant running?");
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

    return (
        <div className="page-container" style={{ marginTop: '2rem' }}>
            <h2>Smart Job Match</h2>

            <div className="card">
                <h3>Step 1: Embed Jobs into Vector DB</h3>
                <p style={{ marginBottom: "1rem" }}>Click below to embed all jobs from the database into Qdrant for semantic search.</p>
                <button onClick={handleEmbed} disabled={loading}>
                    {loading ? "Embedding..." : "Embed All Jobs"}
                </button>
                {embedMsg && <p style={{ marginTop: "1rem", color: "var(--success)", fontWeight: 500 }}>{embedMsg}</p>}
            </div>

            <div className="card">
                <h3>Step 2: Semantic Job Search</h3>
                <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "var(--text)" }}>
                    Search for jobs using natural language. Try "python backend developer" or "frontend react"
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search jobs... e.g. 'python backend developer'"
                        style={{ marginBottom: 0 }}
                    />
                    <button 
                        onClick={handleSearch} 
                        disabled={loading || !searchQuery.trim()}
                        style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                    >
                        🔍 Search
                    </button>
                </div>
                {searchResults.length > 0 && (
                    <div style={{ marginTop: "1.5rem", display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {searchResults.map((r, i) => (
                            <div key={i} style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg)" }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <strong style={{ color: "var(--accent)", fontSize: "1.1rem" }}>{r.title}</strong>
                                    <span style={{ fontSize: "0.85rem", background: "var(--success)", color: "white", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                                        Match: {Math.round(r.score * 100)}%
                                    </span>
                                </div>
                                <p style={{ margin: '0.5rem 0', fontSize: "0.95rem" }}>{r.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <small style={{ fontWeight: 600, color: "var(--text)" }}>💰 {r.salary}</small>
                                    <button 
                                        style={{ 
                                            padding: "0.4rem 0.8rem", 
                                            fontSize: "0.85rem", 
                                            background: "var(--accent)", 
                                            color: "white", 
                                            border: "none", 
                                            borderRadius: "4px", 
                                            cursor: "pointer" 
                                        }}
                                        onClick={() => window.location.href = '/application'}
                                    >
                                        Apply Now →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="card">
                <h3>Step 3: Match Your Profile</h3>
                <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "var(--text)" }}>
                    Enter your skills and experience to find jobs that match your profile
                </p>
                <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Your skills... e.g. 'Python, React, SQL'"
                />
                <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Your experience... e.g. '3 years in web development'"
                />
                <button onClick={handleMatch} disabled={loading || !skills.trim()}>
                    {loading ? "Matching..." : "Find Matching Jobs"}
                </button>
                {matches.length > 0 && (
                    <div style={{ marginTop: "1.5rem", display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4>Top Matches</h4>
                        {matches.map((m, i) => (
                            <div key={i} style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg)" }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <strong style={{ color: "var(--success)", fontSize: "1.1rem" }}>{m.title}</strong>
                                    <span style={{ fontSize: "0.85rem", background: "var(--success)", color: "white", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                                        Match: {m.match_score}%
                                    </span>
                                </div>
                                <p style={{ margin: '0.5rem 0', fontSize: "0.95rem" }}>{m.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <small style={{ fontWeight: 600, color: "var(--text)" }}>💰 {m.salary}</small>
                                    <button 
                                        style={{ 
                                            padding: "0.4rem 0.8rem", 
                                            fontSize: "0.85rem", 
                                            background: "var(--accent)", 
                                            color: "white", 
                                            border: "none", 
                                            borderRadius: "4px", 
                                            cursor: "pointer" 
                                        }}
                                        onClick={() => window.location.href = '/application'}
                                    >
                                        Apply Now →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default JobMatch;
