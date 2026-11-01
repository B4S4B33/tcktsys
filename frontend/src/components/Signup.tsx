// src/components/Signup.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';

type Role = 'user' | 'developer' | 'admin';

export default function Signup({ onLogin }: { onLogin: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (err) {
        setError(err.message);
        return;
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join the Bug Tracker</p>

        {error && (
          <div style={{ ...styles.error, marginBottom: 12 }}>{error}</div>
        )}

        {success && (
          <div style={{ ...styles.success, marginBottom: 16 }}>
            Account created! Please check your email to confirm, then sign in.
          </div>
        )}

        {!success && (
          <form onSubmit={handleSignup}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                style={styles.select}
              >
                <option value="user">User (creates tickets)</option>
                <option value="developer">Developer (fixes tickets)</option>
                <option value="admin">Admin (manages everything)</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}

        <p style={styles.hint}>
          Already have an account?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onLogin(); }} style={styles.link}>
            Sign in
          </a>
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
  select: {
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
  success: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
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
    cursor: 'pointer',
  },
};
