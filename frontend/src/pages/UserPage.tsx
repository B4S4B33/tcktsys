// src/pages/UserPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type Ticket = {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  creator_id: string;
  assignee_id: string | null;
  created_at: string;
};

type Severity = 'low' | 'medium' | 'high' | 'critical';

export default function UserPage({ user }: { user: { id: string; email: string } }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    const { data, error: err } = await supabase
      .from('tickets')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setTickets(data ?? []);
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setCreating(true);

    const { error: err } = await supabase.from('tickets').insert({
      title,
      description,
      severity,
      creator_id: user.id,
      status: 'open',
    });

    if (err) {
      setError(err.message);
    } else {
      setTitle('');
      setDescription('');
      setSeverity('medium');
      fetchTickets();
    }
    setCreating(false);
  }

  async function handleConfirm(ticketId: string) {
    const { error: err } = await supabase
      .from('tickets')
      .update({ confirmed_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (err) {
      setError(err.message);
    } else {
      fetchTickets();
    }
  }

  const severityColor: Record<string, string> = {
    low: '#16a34a',
    medium: '#ca8a04',
    high: '#dc2626',
    critical: '#be123c',
  };

  if (loading) return <div style={styles.loading}>Loading your tickets...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome, {user.email}</h1>
          <p style={styles.subtitle}>User Dashboard</p>
        </div>

        <h2 style={styles.sectionTitle}>Create a Ticket</h2>
        {error && <div style={{ ...styles.error, marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleCreate}>
          <div style={styles.field}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the problem"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened? Steps to reproduce?"
              style={styles.textarea}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              style={styles.select}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <button type="submit" style={styles.button} disabled={creating}>
            {creating ? 'Creating...' : 'Create Ticket'}
          </button>
        </form>

        <h2 style={styles.sectionTitle}>Your Tickets</h2>
        {tickets.length === 0 ? (
          <p style={styles.empty}>No tickets yet.</p>
        ) : (
          <div style={styles.ticketList}>
            {tickets.map((t) => (
              <div key={t.id} style={styles.ticketCard}>
                <div style={styles.ticketHeader}>
                  <h3 style={styles.ticketTitle}>{t.title}</h3>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: severityColor[t.severity] ?? '#64748b',
                    }}
                  >
                    {t.severity}
                  </span>
                </div>
                <p style={styles.ticketDesc}>{t.description}</p>
                <div style={styles.ticketMeta}>
                  <span style={styles.meta}>Status: <b>{t.status}</b></span>
                  <span style={styles.meta}>Created: {new Date(t.created_at).toLocaleDateString()}</span>
                </div>
                {t.status === 'resolved' && (
                  <button
                    onClick={() => handleConfirm(t.id)}
                    style={styles.confirmButton}
                  >
                    Confirm Fix
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: 24,
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxSizing: 'border-box',
  },
  card: {
    maxWidth: 720,
    margin: '0 auto',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { margin: 0, fontSize: 24, color: '#0f172a' },
  subtitle: { margin: 0, color: '#64748b', fontSize: 14 },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: 600,
    color: '#1e293b',
  },
  field: { marginBottom: 16 },
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
  },
  textarea: {
    width: '100%',
    padding: 10,
    fontSize: 14,
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    boxSizing: 'border-box',
    minHeight: 100,
  },
  select: {
    width: '100%',
    padding: 10,
    fontSize: 14,
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: 10,
    marginTop: 8,
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
  empty: {
    color: '#64748b',
    fontStyle: 'italic',
  },
  ticketList: { display: 'flex', flexDirection: 'column', gap: 12 },
  ticketCard: {
    padding: 16,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  ticketHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  ticketTitle: { margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' },
  badge: {
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  ticketDesc: { margin: '8px 0 0 0', color: '#475569', fontSize: 14 },
  ticketMeta: {
    marginTop: 10,
    display: 'flex',
    gap: 16,
    fontSize: 12,
    color: '#64748b',
  },
  meta: { display: 'flex', gap: 4 },
  confirmButton: {
    marginTop: 12,
    padding: '8px 14px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: 40,
    color: '#64748b',
  },
};
