// src/components/Login.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (err) {
        setError(err.message);
        return;
      }

      // Successful login — redirect logic should be handled by the parent (App.tsx)
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Bug Tracker</h2>
        <p style={styles.subtitle}>Sign in to continue</p>

        {error && (
          <div style={{ ...styles.error, marginBottom: 12 }}>{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.hint}>
          Don't have an account? <a href="/signup" style={styles.link}>Sign up</a>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 12,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    width: 360,
    boxSizing: 'border-box',
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    width: '100%',
    padding: 10,
    fontSize: 14,
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: 10,
    marginTop: 4,
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: 10,
    borderRadius: 6,
    fontSize: 13,
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 0,
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    marginLeft: 4,
  },
};
