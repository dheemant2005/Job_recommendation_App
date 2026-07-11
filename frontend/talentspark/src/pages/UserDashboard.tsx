import { useEffect, useState } from "react";
import api from "../Services/api";

interface Job { id: number; title: string; description: string; company_id: number; }
interface Application { id: number; job_id: number; resume_url: string; status: string; applied_at: string; }

type Props = { onNavigate?: (page: string) => void };

function statusClass(s: string) {
  if (s === "pending")  return "badge badge-pending";
  if (s === "reviewed") return "badge badge-reviewed";
  if (s === "accepted") return "badge badge-accepted";
  return "badge badge-rejected";
}

export default function UserDashboard({ onNavigate }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/job/"), api.get("/applications/my").catch(() => ({ data: [] }))])
      .then(([j, a]) => { setJobs(j.data); setApplications(a.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <span className="animate-spin" style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", display: "inline-block" }} />
    </div>
  );

  const pending = applications.filter(a => a.status === "pending").length;

  const actions = [
    { label: "Find Jobs",      icon: "✦", page: "jobmatch",     color: "var(--accent)" },
    { label: "Analyse Resume", icon: "◎", page: "resume",        color: "var(--success)" },
    { label: "AI Career Chat", icon: "◉", page: "chat",          color: "var(--info)" },
    { label: "Apply for Jobs", icon: "◈", page: "application",   color: "var(--warning)" },
  ];

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h2 className="gradient-text">My Dashboard</h2>
        <p>Welcome back — here's your career overview</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }} className="stagger">
        <div className="stat-card"><div className="stat-value">{jobs.length}</div><div className="stat-label">Available Jobs</div></div>
        <div className="stat-card"><div className="stat-value">{applications.length}</div><div className="stat-label">Applications</div></div>
        <div className="stat-card"><div className="stat-value" style={{ background: "none", WebkitTextFillColor: "#f59e0b" }}>{pending}</div><div className="stat-label">Pending Review</div></div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "1.25rem" }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
          {actions.map(({ label, icon, page, color }) => (
            <button
              key={page}
              onClick={() => onNavigate?.(page)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                padding: "1rem", height: "auto",
                background: `${color}12`, border: `1px solid ${color}25`,
                borderRadius: "var(--radius-sm)",
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>{icon}</span>
              <span style={{ color: "var(--text-h)", fontSize: "0.82rem", fontWeight: 600 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ margin: 0 }}>Recent Applications</h3>
          <button className="btn-ghost" onClick={() => onNavigate?.("application")} style={{ fontSize: "0.82rem" }}>
            View all →
          </button>
        </div>

        {applications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-dim)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📋</div>
            <p style={{ margin: 0 }}>No applications yet — start applying to jobs!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }} className="stagger">
            {applications.slice(0, 5).map((app) => {
              const job = jobs.find(j => j.id === app.job_id);
              return (
                <div key={app.id} className="list-row">
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--text-h)", margin: 0 }}>
                      {job?.title || "Unknown Position"}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-dim)", margin: "0.2rem 0 0" }}>
                      Applied {new Date(app.applied_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <span className={statusClass(app.status)}>{app.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
