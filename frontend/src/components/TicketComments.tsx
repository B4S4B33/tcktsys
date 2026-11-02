// src/components/TicketComments.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type Comment = {
  id: string;
  ticket_id: string;
  user_id: string;
  text: string;
  created_at: string;
  users?: { name: string | null };
};

type TicketCommentsProps = {
  ticketId: string;
  user: { id: string; email: string };
};

export default function TicketComments({ ticketId, user }: TicketCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  async function fetchComments() {
    const { data, error: err } = await supabase
      .from('comments')
      .select('*, users(name)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setComments(data ?? []);
    }
    setLoading(false);
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setAdding(true);

    const { error: err } = await supabase.from('comments').insert({
      ticket_id: ticketId,
      user_id: user.id,
      text: newComment.trim(),
    });

    if (err) {
      setError(err.message);
    } else {
      setNewComment('');
      fetchComments();
    }
    setAdding(false);
  }

  if (loading) return <div style={styles.loading}>Loading comments...</div>;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Comments ({comments.length})</h3>
      {error && <div style={{ ...styles.error, marginBottom: 12 }}>{error}</div>}

      <div style={styles.list}>
        {comments.length === 0 ? (
          <p style={styles.empty}>No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} style={styles.comment}>
              <div style={styles.commentHeader}>
                <strong style={styles.author}>{c.users?.name || 'Unknown user'}</strong>
                <span style={styles.time}>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p style={styles.text}>{c.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddComment} style={styles.form}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          style={styles.textarea}
        />
        <button type="submit" style={styles.submitButton} disabled={adding || !newComment.trim()}>
          {adding ? 'Posting...' : 'Add Comment'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    marginTop: 20,
    padding: 16,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: 18,
    color: '#0f172a',
  },
  list: {
    marginBottom: 12,
    maxHeight: 200,
    overflowY: 'auto',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#f8fafc',
  },
  empty: {
    margin: 0,
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  comment: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: '1px solid #e2e8f0',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    color: '#1e293b',
  },
  time: {
    fontSize: 11,
    color: '#64748b',
  },
  text: {
    margin: 0,
    fontSize: 13,
    color: '#334155',
  },
  form: {
    display: 'flex',
    gap: 8,
  },
  textarea: {
    flex: 1,
    minHeight: 60,
    padding: 8,
    fontSize: 13,
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  submitButton: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  loading: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: 8,
    borderRadius: 6,
    fontSize: 12,
  },
};
