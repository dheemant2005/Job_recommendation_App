import type { Company, CompanyPayload } from "../types/company";
import type { Job } from "../types/job";
import { useState } from "react";

type Props = {
  companies: Company[];
  jobs: Job[];
  onEdit: (id: number, company: CompanyPayload) => void;
  onDelete: (id: number) => void;
  onAdd: (company: CompanyPayload) => void;
};

const emptyForm: CompanyPayload = { name: "", email: "", phone: "", location: "" };

export default function CompanyCard({ companies, jobs, onAdd, onEdit, onDelete }: Props) {
  const [editId, setEditId] = useState<number | null>(null);
  const [addForm, setAddForm] = useState<CompanyPayload>(emptyForm);
  const [editForm, setEditForm] = useState<CompanyPayload>(emptyForm);
  const [showAdd, setShowAdd] = useState(false);

  const handleSave = () => {
    if (editId !== null) onEdit(editId, editForm);
    setEditId(null);
    setEditForm(emptyForm);
  };

  return (
    <div style={{ marginBottom: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>Companies</h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "var(--text-dim)" }}>
            {companies.length} registered
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ fontSize: "0.875rem" }}>
          {showAdd ? "✕ Cancel" : "+ Add Company"}
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="card animate-fadein" style={{ marginBottom: "1.5rem", borderColor: "rgba(124,58,237,0.25)" }}>
          <h3 style={{ marginBottom: "1.25rem" }}>New Company</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            <div>
              <label>Company Name</label>
              <input type="text" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="Acme Corp" />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} placeholder="hr@acme.com" />
            </div>
            <div>
              <label>Phone</label>
              <input type="text" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} placeholder="+1 555 000" />
            </div>
            <div>
              <label>Location</label>
              <input type="text" value={addForm.location} onChange={e => setAddForm({ ...addForm, location: e.target.value })} placeholder="New York, NY" />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              className="btn-primary"
              onClick={() => { onAdd(addForm); setAddForm(emptyForm); setShowAdd(false); }}
              disabled={!addForm.name.trim()}
            >
              Create Company
            </button>
            <button onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Company Grid */}
      {companies.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-dim)", border: "1px dashed var(--border)", borderRadius: "var(--radius)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🏢</div>
          <p style={{ margin: 0 }}>No companies yet — add the first one!</p>
        </div>
      ) : (
        <div className="grid-layout stagger">
          {companies.map(company => (
            <div key={company.id} className="card" style={{ margin: 0 }}>
              {editId === company.id ? (
                <>
                  <h3 style={{ marginBottom: "1rem" }}>Edit Company</h3>
                  <label>Name</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                  <label>Email</label>
                  <input type="text" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                  <label>Phone</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                  <label>Location</label>
                  <input type="text" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} style={{ marginBottom: "1rem" }} />
                  <div className="action-buttons">
                    <button className="btn-primary" onClick={handleSave}>Save</button>
                    <button onClick={() => { setEditId(null); setEditForm(emptyForm); }}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <h3 style={{ margin: 0 }}>{company.name}</h3>
                    <span style={{
                      background: "var(--accent-bg)",
                      color: "var(--accent-2)",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "100px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}>
                      {jobs.filter(j => j.company_id === company.id).length} jobs
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.875rem" }}>
                      <span style={{ color: "var(--text-dim)" }}>✉</span>
                      <span style={{ color: "var(--text)" }}>{company.email}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.875rem" }}>
                      <span style={{ color: "var(--text-dim)" }}>☏</span>
                      <span style={{ color: "var(--text)" }}>{company.phone}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.875rem" }}>
                      <span style={{ color: "var(--text-dim)" }}>⌖</span>
                      <span style={{ color: "var(--text)" }}>{company.location}</span>
                    </div>
                  </div>
                  <div className="action-buttons" style={{ marginTop: "auto" }}>
                    <button
                      onClick={() => { setEditId(company.id); setEditForm({ name: company.name, email: company.email, phone: company.phone, location: company.location }); }}
                      style={{ flex: 1 }}
                    >
                      Edit
                    </button>
                    <button className="btn-danger" onClick={() => onDelete(company.id)} style={{ flex: 1 }}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}