// src/App.tsx
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import UserPage from './pages/UserPage';
import DeveloperPage from './pages/DeveloperPage';
import AdminPage from './pages/AdminPage';

type SessionUser = { id: string; email: string };

export default function App() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setSession({ id: data.session.user.id, email: data.session.user.email });
      }
      setLoading(false);
    });

    // Listen for auth changes (login / logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setSession({ id: session.user.id, email: session.user.email });
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40, fontFamily: 'system-ui, sans-serif', color: '#64748b' }}>
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  // Route by role
  const role = getRoleFromEmail(session.email);

  const navLinks = (
    <nav style={styles.nav}>
      <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} style={styles.navLink}>Logout</a>
    </nav>
  );

  if (role === 'admin') {
    return (
      <div style={styles.page}>
        <nav style={styles.nav}>
          <span style={styles.brand}>Bug Tracker — Admin</span>
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} style={styles.navLink}>Logout</a>
        </nav>
        <AdminPage />
      </div>
    );
  }

  if (role === 'developer') {
    return (
      <div style={styles.page}>
        <nav style={styles.nav}>
          <span style={styles.brand}>Bug Tracker — Developer</span>
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} style={styles.navLink}>Logout</a>
        </nav>
        <DeveloperPage user={session} />
      </div>
    );
  }

  // default: user
  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.brand}>Bug Tracker — User</span>
        <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} style={styles.navLink}>Logout</a>
      </nav>
      <UserPage user={session} />
    </div>
  );
}

function logout() {
  supabase.auth.signOut();
  window.location.href = '/';
}

// Simple heuristic: derive role from email prefix.
// In production, store role in the `users` table and read it here.
function getRoleFromEmail(email: string): 'admin' | 'developer' | 'user' {
  const prefix = email.split('@')[0].toLowerCase();
  if (prefix.includes('admin')) return 'admin';
  if (prefix.includes('dev')) return 'developer';
  return 'user';
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
  },
  brand: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
  },
  navLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: 14,
    cursor: 'pointer',
  },
};
