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
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setSession({ id: data.session.user.id, email: data.session.user.email });
      }
      setLoading(false);
    });

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

  const role = getRoleFromEmail(session.email);

  if (role === 'admin') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Bug Tracker — Admin</span>
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>Logout</a>
        </nav>
        <AdminPage />
      </div>
    );
  }

  if (role === 'developer') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Bug Tracker — Developer</span>
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>Logout</a>
        </nav>
        <DeveloperPage user={session} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Bug Tracker — User</span>
        <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>Logout</a>
      </nav>
      <UserPage user={session} />
    </div>
  );
}

function logout() {
  supabase.auth.signOut();
  window.location.href = '/';
}

function getRoleFromEmail(email: string): 'admin' | 'developer' | 'user' {
  const prefix = email.split('@')[0].toLowerCase();
  if (prefix.includes('admin')) return 'admin';
  if (prefix.includes('dev')) return 'developer';
  return 'user';
}
