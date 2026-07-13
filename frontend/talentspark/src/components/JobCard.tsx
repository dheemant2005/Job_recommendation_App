import type { Job, JobPayload } from "../types/job";
import type { Company } from "../types/company";
import { useState } from "react";

type Props = {
  jobs: Job[];
  companies: Company[];
  onEdit: (id: number, job: JobPayload) => void;
  onDelete: (id: number) => void;
  onAdd: (job: JobPayload) => void;
};

const emptyForm: JobPayload = { title: "", description: "", salary: 0, company_id: 0 };

export default function JobCard({ jobs, companies, onEdit, onDelete, onAdd }: Props) {
  const [editId, setEditId] = useState<number | null>(null);
  const [addForm, setAddForm] = useState<JobPayload>(emptyForm);
  const [editForm, setEditForm] = useState<JobPayload>(emptyForm);
  const [showAdd, setShowAdd] = useState(false);

  const userRole = localStorage.getItem("user_role")?.toLowerCase();
  const isAuthorized = userRole === "admin" || userRole === "hr";

  const handleSave = () => {
    if (editId !== null) onEdit(editId, editForm);
    setEditId(null);
    setEditForm(emptyForm);
  };

  return (
    <div style={{ marginBottom: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>Job Listings</h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "var(--text-dim)" }}>
            {jobs.length} open positions
          </p>
        </div>
        {isAuthorized && (
          <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ fontSize: "0.875rem" }}>
            {showAdd ? "✕ Cancel" : "+ Post Job"}
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="card animate-fadein" style={{ marginBottom: "1.5rem", borderColor: "rgba(124,58,237,0.25)" }}>
          <h3 style={{ marginBottom: "1.25rem" }}>New Job Posting</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label>Job Title</label>
              <input type="text" value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })} placeholder="Senior Software Engineer" />
            </div>
            <div>
              <label>Company</label>
              <select value={addForm.company_id || ""} onChange={e => setAddForm({ ...addForm, company_id: Number(e.target.value) })}>
                <option value="">Select a company…</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label>Salary (USD)</label>
              <input type="number" min="0" value={addForm.salary} onChange={e => setAddForm({ ...addForm, salary: Number(e.target.value) })} placeholder="90000" />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label>Description</label>
              <textarea value={addForm.description || ""} onChange={e => setAddForm({ ...addForm, description: e.target.value })} placeholder="Describe the role, responsibilities, requirements…" rows={4} style={{ fontFamily: "var(--font)", fontSize: "0.875rem" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="btn-primary"
              onClick={() => { onAdd(addForm); setAddForm(emptyForm); setShowAdd(false); }}
              disabled={!addForm.title.trim() || addForm.company_id <= 0}
            >
              Post Job
            </button>
            <button onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Job Grid */}
      {jobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-dim)", border: "1px dashed var(--border)", borderRadius: "var(--radius)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>💼</div>
          <p style={{ margin: 0 }}>No jobs posted yet — post the first one!</p>
        </div>
      ) : (
        <div className="grid-layout stagger">
          {jobs.map(job => {
            const company = companies.find(c => c.id === job.company_id);
            return (
              <div key={job.id} className="card" style={{ margin: 0, display: "flex", flexDirection: "column" }}>
                {editId === job.id ? (
                  <>
                    <h3 style={{ marginBottom: "1rem" }}>Edit Job</h3>
                    <label>Title</label>
                    <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                    <label>Description</label>
                    <textarea value={editForm.description || ""} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3} style={{ fontFamily: "var(--font)", fontSize: "0.875rem" }} />
                    <label>Salary</label>
                    <input type="number" min="0" value={editForm.salary} onChange={e => setEditForm({ ...editForm, salary: Number(e.target.value) })} />
                    <label>Company</label>
                    <select value={editForm.company_id || ""} onChange={e => setEditForm({ ...editForm, company_id: Number(e.target.value) })} style={{ marginBottom: "1rem" }}>
                      <option value="">Select…</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <div className="action-buttons">
                      <button className="btn-primary" onClick={handleSave}>Save</button>
                      <button onClick={() => { setEditId(null); setEditForm(emptyForm); }}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: "auto" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <h3 style={{ margin: 0, lineHeight: 1.3, flex: 1 }}>{job.title}</h3>
                        <span style={{
                          background: "rgba(16,185,129,0.12)",
                          color: "var(--success)",
                          border: "1px solid rgba(16,185,129,0.25)",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "100px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          marginLeft: "0.5rem",
                        }}>
                          ${Number(job.salary).toLocaleString()}
                        </span>
                      </div>
                      {company && (
                        <p style={{ fontSize: "0.82rem", color: "var(--accent-2)", fontWeight: 500, margin: "0 0 0.75rem" }}>
                          🏢 {company.name}
                        </p>
                      )}
                      <p style={{ fontSize: "0.875rem", color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                        {(job.description || "").slice(0, 120)}{(job.description || "").length > 120 ? "…" : ""}
                      </p>
                    </div>
                    {isAuthorized && (
                      <div className="action-buttons" style={{ marginTop: "1.25rem" }}>
                        <button
                          onClick={() => {
                            setEditId(job.id);
                            setEditForm({ title: job.title, description: job.description || "", salary: job.salary, company_id: job.company_id });
                          }}
                          style={{ flex: 1 }}
                        >
                          Edit
                        </button>
                        <button className="btn-danger" onClick={() => onDelete(job.id)} style={{ flex: 1 }}>Delete</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}