import { useEffect, useState } from "react";
import api from "../Services/api";
import { getCompanies } from "../Services/CompanyService";
import { getJobs } from "../Services/JobService";
import type { Company } from "../types/company";
import type { Job } from "../types/job";

interface Application { id: number; job_id: number; user_id: number; resume_url: string; status: string; applied_at: string; }

function statusClass(s: string) {
  if (s === "pending")  return "badge badge-pending";
  if (s === "reviewed") return "badge badge-reviewed";
  if (s === "accepted") return "badge badge-accepted";
  return "badge badge-rejected";
}

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "companies" | "jobs" | "applications">("overview");

  useEffect(() => {
    Promise.all([
      getCompanies(),
      getJobs(),
      api.get("/applications/all").catch(() => ({ data: [] })),
    ]).then(([c, j, a]) => {
      setCompanies(c); setJobs(j); setApplications(a.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.patch(`/applications/${id}`, { status });
      const updated = await api.get("/applications/all").catch(() => ({ data: [] }));
      setApplications(updated.data);
    } catch { alert("Failed to update status"); }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <span className="animate-spin" style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", display: "inline-block" }} />
    </div>
  );

  const tabs: Array<{ id: typeof activeTab; label: string; count: number }> = [
    { id: "overview",     label: "Overview",     count: 0 },
    { id: "companies",    label: "Companies",    count: companies.length },
    { id: "jobs",         label: "Jobs",         count: jobs.length },
    { id: "applications", label: "Applications", count: applications.length },
  ];

  return (
    <div className="page-container" style={{ maxWidth: 1000 }}>
      <div className="page-header">
        <h2 className="gradient-text">Admin Dashboard</h2>
        <p>TalentSpark Management Portal</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                background: activeTab === t.id ? "rgba(255,255,255,0.25)" : "var(--card-bg)",
                border: "1px solid var(--border)",
                padding: "0.1rem 0.45rem",
                borderRadius: "100px",
                fontSize: "0.7rem",
                fontWeight: 700,
                marginLeft: "0.25rem",
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }} className="stagger">
          <div className="stat-card"><div className="stat-value">{companies.length}</div><div className="stat-label">Companies</div></div>
          <div className="stat-card"><div className="stat-value">{jobs.length}</div><div className="stat-label">Active Jobs</div></div>
          <div className="stat-card">
            <div className="stat-value" style={{ background: "none", WebkitTextFillColor: "#a855f7" }}>{applications.length}</div>
            <div className="stat-label">Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ background: "none", WebkitTextFillColor: "var(--warning)" }}>
              {applications.filter(a => a.status === "pending").length}
            </div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>
      )}

      {/* Companies */}
      {activeTab === "companies" && (
        <div className="card">
          <h3 style={{ marginBottom: "1.25rem" }}>Companies</h3>
          {companies.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-dim)", padding: "2rem" }}>No companies yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }} className="stagger">
              {companies.map(c => (
                <div key={c.id} className="list-row">
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--text-h)", margin: 0 }}>{c.name}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-dim)", margin: "0.2rem 0 0" }}>
                      {c.email} · {c.location}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}>Edit</button>
                    <button className="btn-danger" style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Jobs */}
      {activeTab === "jobs" && (
        <div className="card">
          <h3 style={{ marginBottom: "1.25rem" }}>Jobs</h3>
          {jobs.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-dim)", padding: "2rem" }}>No jobs yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }} className="stagger">
              {jobs.map(j => (
                <div key={j.id} className="list-row">
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: "var(--text-h)", margin: 0 }}>{j.title}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-dim)", margin: "0.2rem 0 0" }}>
                      Company ID: {j.company_id} · ${Number(j.salary).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}>Edit</button>
                    <button className="btn-danger" style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications */}
      {activeTab === "applications" && (
        <div className="card">
          <h3 style={{ marginBottom: "1.25rem" }}>Applications</h3>
          {applications.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-dim)", padding: "2rem" }}>No applications yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }} className="stagger">
              {applications.map(app => {
                const job = jobs.find(j => j.id === app.job_id);
                return (
                  <div key={app.id} className="list-row" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <p style={{ fontWeight: 600, color: "var(--text-h)", margin: 0 }}>
                        {job?.title || "Unknown Position"}
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-dim)", margin: "0.2rem 0 0" }}>
                        User #{app.user_id} · {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span className={statusClass(app.status)}>{app.status}</span>
                      <select
                        value={app.status}
                        onChange={e => handleStatusChange(app.id, e.target.value)}
                        style={{ width: "auto", marginBottom: 0, fontSize: "0.82rem", padding: "0.35rem 0.5rem" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
