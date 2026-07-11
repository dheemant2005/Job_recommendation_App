import { useState } from "react";
import { analyseResume } from "../Services/RagService";

export default function ResumeAnalyser() {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleAnalyse = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setAnalysis("");
    try {
      const result = await analyseResume(resumeText);
      setAnalysis(result.analysis);
    } catch {
      setAnalysis("⚠️ Failed to analyse resume. Please check the backend and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(e.target.value);
    setCharCount(e.target.value.length);
  };

  return (
    <div className="page-container" style={{ maxWidth: 820 }}>
      <div className="page-header">
        <h2 className="gradient-text">Resume Analyser</h2>
        <p>Paste your resume and get AI-powered insights, strengths, and improvement suggestions.</p>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Your Resume</h3>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            {charCount.toLocaleString()} characters
          </span>
        </div>

        <textarea
          value={resumeText}
          onChange={handleTextChange}
          placeholder="Paste your full resume text here — work experience, education, skills, projects…"
          rows={14}
          style={{ marginBottom: "1rem", fontFamily: "var(--mono)", fontSize: "0.82rem" }}
        />

        <button
          onClick={handleAnalyse}
          disabled={loading || !resumeText.trim()}
          className="btn-primary"
          style={{ width: "100%", padding: "0.85rem", fontSize: "0.95rem" }}
        >
          {loading ? (
            <>
              <span
                className="animate-spin"
                style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }}
              />
              Analysing your resume…
            </>
          ) : "✦ Analyse with AI"}
        </button>
      </div>

      {analysis && (
        <div className="card animate-fadein" style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--accent-gradient)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem", flexShrink: 0,
            }}>✦</div>
            <div>
              <h3 style={{ margin: 0 }}>Analysis Result</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-dim)" }}>Powered by Llama 3.3</p>
            </div>
          </div>
          <div className="divider" />
          <div style={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.8,
            fontSize: "0.9rem",
            color: "var(--text-h)",
            fontFamily: "var(--font)",
          }}>
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
}
