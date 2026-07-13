import { useState } from 'react';
import { login } from '../Services/AuthService';

type Props = {
  onNavigate?: (page: string) => void;
  onLogin?: (token: string) => void;
};

export default function AdminLogin({ onNavigate, onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      const { access_token } = response;

      // Decode JWT to check role
      const base64Url = access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
      const payload = JSON.parse(atob(paddedBase64));

      if (payload.role !== 'Admin') {
        setError('Access denied. Admin privileges required.');
        return;
      }

      localStorage.setItem('token', access_token);
      localStorage.setItem('user_role', payload.role);

      if (onLogin) onLogin(access_token);
      if (onNavigate) onNavigate('admindashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <form onSubmit={handleLogin} style={{ maxWidth: '420px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Admin Portal</h2>
        <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '2rem' }}>
          Sign in to access the admin dashboard
        </p>

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
          Email Address
        </label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          required
        />

        <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: 'var(--accent-gradient)',
            color: 'white',
            border: 'none',
            padding: '0.75rem',
            marginTop: '0.5rem',
            fontSize: '1rem',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {onNavigate && (
          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent)', padding: 0, fontSize: '0.9rem' }}
            >
              ← Back to Login
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
