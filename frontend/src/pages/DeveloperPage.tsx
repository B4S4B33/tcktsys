// src/pages/DeveloperPage.tsx
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

type Status = 'in_progress' | 'resolved';

export default function DeveloperPage({ user }: { user: { id: string; email: string } }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    const { data, error: err } = await supabase
      .from('tickets')
      .select('*')
      .eq('assignee_id', user.id)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setTickets(data ?? []);
    }
    setLoading(false);
  }

  async function handleStatus(ticketId: string, status: Status) {
    const { error: err } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId);

    if (err) {
      setError(err.message);
    } else {
      fetchTickets();
    }
  }

  const statusColor: Record<string, string> = {
    open: '#64748b',
    assigned: '#2563eb',
    in_progress: '#0891b2',
    resolved: '#16a34a',
    closed: '#475569',
    force_closed: '#dc2626',
  };

  if (loading) return <div style={styles.loading}>Loading your assigned tickets...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Developer Dashboard</h1>
          <p style={styles.subtitle}>Signed in as {user.email}</p>
        </div>

        {error && <div style={{ ...styles.error, marginBottom: 16 }}>{error}</div>}

        <h2 style={styles.sectionTitle}>My Assigned Tickets</h2>
        {tickets.length === 0 ? (
          <p style={styles.empty}>No tickets assigned to you yet.</p>
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
                <div style={styles.actionRow}>
                  {t.status !== 'in_progress' && t.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatus(t.id, 'in_progress')}
                      style={styles.statusButton}
                    >
                      Start Working
                    </button>
                  )}
                  {t.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatus(t.id, 'resolved')}
                      style={styles.resolveButton}
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const severityColor: Record<string, string> = {
  low: '#16a34a',
  medium: '#ca8a04',
  high: '#dc2626',
  critical: '#be123c',
};

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
  actionRow: { marginTop: 12, display: 'flex', gap: 8 },
  statusButton: {
    padding: '8px 14px',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  resolveButton: {
    padding: '8px 14px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
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
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: 40,
    color: '#64748b',
  },
};
