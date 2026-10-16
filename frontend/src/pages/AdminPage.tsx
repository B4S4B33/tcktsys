// src/pages/AdminPage.tsx
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

type Developer = {
  id: string;
  name: string;
  current_ticket_count: number;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignSelect, setAssignSelect] = useState<{ ticketId: string; devId: string | '' } | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [tRes, dRes, uRes] = await Promise.all([
      supabase.from('tickets').select('*').order('created_at', { ascending: false }),
      supabase.from('developers').select('*').order('name'),
      supabase.from('users').select('id, name, email, role').order('name'),
    ]);

    if (tRes.error) setError(tRes.error.message);
    else setTickets(tRes.data ?? []);

    if (dRes.error) setError(dRes.error.message);
    else setDevelopers(dRes.data ?? []);

    if (uRes.error) setError(uRes.error.message);
    else setUsers(uRes.data ?? []);

    setLoading(false);
  }

  async function assignTicket(ticketId: string, devId: string) {
    const { error: err } = await supabase
      .from('tickets')
      .update({ status: 'assigned', assignee_id: devId })
      .eq('id', ticketId);

    if (err) {
      setError(err.message);
    } else {
      setAssignSelect(null);
      fetchAll();
    }
  }

  async function closeTicket(ticketId: string) {
    const { error: err } = await supabase
      .from('tickets')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (err) {
      setError(err.message);
    } else {
      fetchAll();
    }
  }

  async function forceCloseTicket(ticketId: string, reason: string) {
    const { error: err } = await supabase
      .from('tickets')
      .update({
        status: 'force_closed',
        closed_at: new Date().toISOString(),
        force_close_reason: reason,
      })
      .eq('id', ticketId);

    if (err) {
      setError(err.message);
    } else {
      fetchAll();
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

  if (loading) return <div style={styles.loading}>Loading admin data...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Manage tickets, developers, and users</p>
        </div>

        {error && <div style={{ ...styles.error, marginBottom: 16 }}>{error}</div>}

        <div style={styles.summaryRow}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryValue}>{tickets.length}</div>
            <div style={styles.summaryLabel}>Total Tickets</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryValue}>{developers.length}</div>
            <div style={styles.summaryLabel}>Developers</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryValue}>{users.filter((u) => u.role === 'user').length}</div>
            <div style={styles.summaryLabel}>Users</div>
          </div>
        </div>

        <h2 style={styles.sectionTitle}>All Tickets</h2>
        {tickets.length === 0 ? (
          <p style={styles.empty}>No tickets in the system.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableRow}>
                <th style={styles.tableCell}>Title</th>
                <th style={styles.tableCell}>Severity</th>
                <th style={styles.tableCell}>Status</th>
                <th style={styles.tableCell}>Assignee</th>
                <th style={styles.tableCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const dev = developers.find((d) => d.id === t.assignee_id);
                const isAssigning = assignSelect?.ticketId === t.id;
                return (
                  <tr key={t.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={{ fontWeight: 600 }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{t.description}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{ ...styles.badge, backgroundColor: severityColor[t.severity] ?? '#64748b' }}>{t.severity}</span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{ ...styles.badge, backgroundColor: statusColor[t.status] ?? '#64748b' }}>{t.status}</span>
                    </td>
                    <td style={styles.tableCell}>
                      {dev ? dev.name : <em style={{ color: '#94a3b8' }}>Unassigned</em>}
                    </td>
                    <td style={styles.tableCell} style={{ minWidth: 200 }}>
                      {isAssigning ? (
                        <div style={styles.assignRow}>
                          <select
                            value={assignSelect.devId}
                            onChange={(e) => setAssignSelect({ ticketId: t.id, devId: e.target.value })}
                            style={styles.select}
                          >
                            <option value="">Select developer</option>
                            {developers.map((d) => (
                              <option key={d.id} value={d.id}>{d.name} ({d.current_ticket_count})</option>
                            ))}
                          </select>
                          <button onClick={() => assignTicket(t.id, assignSelect.devId)} style={styles.assignButton}>Assign</button>
                          <button onClick={() => setAssignSelect(null)} style={styles.cancelButton}>Cancel</button>
                        </div>
                      ) : (
                        <div style={styles.actionRow}>
                          {t.status !== 'assigned' && (
                            <button
                              onClick={() => setAssignSelect({ ticketId: t.id, devId: '' })}
                              style={styles.assignButton}
                            >
                              Assign Developer
                            </button>
                          )}
                          {t.status === 'resolved' && (
                            <button onClick={() => closeTicket(t.id)} style={styles.closeButton}>Close</button>
                          )}
                          <button
                            onClick={() => {
                              const reason = prompt('Force close reason:');
                              if (reason) forceCloseTicket(t.id, reason);
                            }}
                            style={styles.forceCloseButton}
                          >
                            Force Close
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <h2 style={styles.sectionTitle}>Developers</h2>
        {developers.length === 0 ? (
          <p style={styles.empty}>No developers registered.</p>
        ) : (
          <div style={styles.developerList}>
            {developers.map((d) => (
              <div key={d.id} style={styles.developerCard}>
                <div style={styles.developerInfo}>
                  <div style={styles.developerName}>{d.name}</div>
                  <div style={styles.developerCount}>{d.current_ticket_count} ticket(s) working on</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 style={styles.sectionTitle}>Users</h2>
        {users.length === 0 ? (
          <p style={styles.empty}>No users registered.</p>
        ) : (
          <div style={styles.userList}>
            {users.map((u) => (
              <div key={u.id} style={styles.userCard}>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{u.email}</div>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: u.role === 'admin' ? '#dc2626' : u.role === 'developer' ? '#2563eb' : '#64748b',
                  }}
                >
                  {u.role}
                </span>
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
    maxWidth: 1100,
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
  summaryRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  summaryLabel: {
    margin: 0,
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: 24,
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
  },
  tableCell: {
    padding: 12,
    fontSize: 13,
    color: '#334155',
    verticalAlign: 'top',
  },
  badge: {
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    color: '#ffffff',
    textTransform: 'uppercase',
    display: 'inline-block',
  },
  actionRow: { display: 'flex', gap: 6 },
  assignRow: { display: 'flex', gap: 6, alignItems: 'center' },
  select: {
    padding: 6,
    fontSize: 12,
    border: '1px solid #cbd5e1',
    borderRadius: 4,
  },
  assignButton: {
    padding: '6px 10px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '6px 10px',
    backgroundColor: '#e2e8f0',
    color: '#475569',
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  closeButton: {
    padding: '6px 10px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  forceCloseButton: {
    padding: '6px 10px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  developerList: { display: 'flex', flexDirection: 'column', gap: 8 },
  developerCard: {
    padding: 12,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  developerInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  developerName: { fontWeight: 600, color: '#0f172a' },
  developerCount: { fontSize: 12, color: '#64748b' },
  userList: { display: 'flex', flexDirection: 'column', gap: 8 },
  userCard: {
    padding: 12,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
