import { useState, useEffect } from "react";
import api from "../Services/api";
import { supabase, isSupabaseConfigured } from "../config/supabase";

interface Job { id: number; title: string; description: string; company_id: number; }
interface Application { id: number; job_id: number; resume_url: string; status: string; applied_at: string; }

type Props = { onNavigate?: (page: string) => void };

function statusClass(s: string) {
  if (s === "pending")  return "badge badge-pending";
  if (s === "reviewed") return "badge badge-reviewed";
  if (s === "accepted") return "badge badge-accepted";
  return "badge badge-rejected";
}

export default function UserApplication({ onNavigate }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/job/"),
      api.get("/applications/my").catch(() => ({ data: [] })),
    ]).then(([j, a]) => { setJobs(j.data); setApplications(a.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchApplications = () =>
    api.get("/applications/my").catch(() => ({ data: [] })).then(r => setApplications(r.data));

  const handleUpload = async () => {
    if (!file || !selectedJob) { setError("Please select a job and a resume file."); return; }
    setUploading(true); setError(""); setSuccess("");

    try {
      let resumeUrl = "";

      if (isSupabaseConfigured && supabase) {
        const fileName = `${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("resumes").upload(fileName, file);
        if (upErr) throw new Error(upErr.message);
        const { data: { publicUrl } } = supabase.storage.from("resumes").getPublicUrl(fileName);
        resumeUrl = publicUrl;
      } else {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/s3/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
        resumeUrl = res.data.url || res.data.local_path || "uploaded";
      }

      await api.post("/applications/", { job_id: selectedJob, resume_url: resumeUrl });
      await fetchApplications();
      setFile(null); setSelectedJob(null);
      setSuccess("Application submitted! 🎉 We'll be in touch.");
    } catch (err: any) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <span className="animate-spin" style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", display: "inline-block" }} />
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h2 className="gradient-text">Apply for Jobs</h2>
        <p>Submit your application and track its status in real time</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Form */}
        <div className="card" style={{ margin: 0 }}>
          <h3 style={{ marginBottom: "1.5rem" }}>New Application</h3>

          {error   && <div className="alert alert-error"><span>⚠</span>{error}</div>}
          {success && <div className="alert alert-success"><span>✓</span>{success}</div>}

          <label>Select Position</label>
          <select value={selectedJob || ""} onChange={e => setSelectedJob(Number(e.target.value))}>
            <option value="">Choose a job…</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>

          <label>Upload Resume</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />

          {file && (
            <div className="alert alert-info" style={{ marginTop: "-0.5rem" }}>
              <span>📄</span> {file.name} ({(file.size / 1024).toFixed(0)} KB)
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !file || !selectedJob}
            className="btn-primary"
            style={{ width: "100%", padding: "0.85rem", marginTop: "0.5rem" }}
          >
            {uploading ? (
              <>
                <span className="animate-spin" style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }} />
                Submitting…
              </>
            ) : "Submit Application →"}
          </button>
        </div>

        {/* My Applications */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0 }}>My Applications</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{applications.length} total</span>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-dim)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📋</div>
              <p style={{ margin: 0 }}>No applications yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }} className="stagger">
              {applications.map(app => {
                const job = jobs.find(j => j.id === app.job_id);
                return (
                  <div key={app.id} className="list-row">
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: "var(--text-h)", margin: 0 }}>
                        {job?.title || "Position"}
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: "0.2rem 0 0" }}>
                        {new Date(app.applied_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <span className={statusClass(app.status)}>{app.status}</span>
                  </div>
                );
              })}
            </div>
          )}

          {onNavigate && (
            <button className="btn-ghost" onClick={() => onNavigate("userdashboard")} style={{ width: "100%", marginTop: "1rem", fontSize: "0.82rem" }}>
              ← Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
