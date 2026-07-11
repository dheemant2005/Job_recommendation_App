import { useState } from "react";
import { login } from "../Services/AuthService";

type Props = {
  onLogin: (token: string) => void;
  onSwitchToRegister: () => void;
};

export default function Login({ onLogin, onSwitchToRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await login({ email, password });
      try {
        const payload = JSON.parse(atob(response.access_token.split(".")[1]));
        if (payload.role) localStorage.setItem("user_role", payload.role);
      } catch {}
      onLogin(response.access_token);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Invalid credentials. Please try again."
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
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "none", border: "none", boxShadow: "none", padding: 0, margin: 0, maxWidth: "none" }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{ marginBottom: "1.5rem" }}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "0.85rem", fontSize: "0.95rem" }}
          >
            {loading ? (
              <>
                <span className="animate-spin" style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }} />
                Signing in…
              </>
            ) : "Sign In →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
          <span style={{ fontSize: "0.88rem", color: "var(--text-dim)" }}>
            No account?{" "}
            <button
              onClick={onSwitchToRegister}
              style={{ background: "none", border: "none", color: "var(--accent-2)", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              Create one →
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}