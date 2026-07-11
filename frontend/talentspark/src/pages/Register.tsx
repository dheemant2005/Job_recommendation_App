import { useState } from "react";
import { register } from "../Services/AuthService";

type Props = { onSwitchToLogin: () => void };

export default function Register({ onSwitchToLogin }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register({ name, email, password, role });
      alert("Account created! Please sign in.");
      onSwitchToLogin();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="wordmark">⚡ TalentSpark</div>
          <p>Create your account</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "none", border: "none", boxShadow: "none", padding: 0, margin: 0, maxWidth: "none" }}>
          <label>Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required autoFocus />

          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />

          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ marginBottom: "1.5rem" }}>
            <option value="user">Job Seeker</option>
            <option value="hr">HR / Recruiter</option>
            <option value="Admin">Admin</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "0.85rem", fontSize: "0.95rem" }}
          >
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
          <span style={{ fontSize: "0.88rem", color: "var(--text-dim)" }}>
            Have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              style={{ background: "none", border: "none", color: "var(--accent-2)", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              Sign in →
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
