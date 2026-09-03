'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      const hasAdminRole = parsed.roles?.includes('SUPER_ADMIN') || parsed.roles?.includes('ADMIN');
      setIsAdmin(hasAdminRole);
      if (!hasAdminRole) {
        router.push('/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Utilisateurs', icon: '👥' },
    { href: '/admin/assemblies', label: 'Assemblées', icon: '⛪' },
    { href: '/admin/entrances', label: 'Entrées', icon: '🚪' },
    { href: '/admin/services', label: 'Cultes', icon: '📅' },
    { href: '/admin/sessions', label: 'Sessions', icon: '📋' },
    { href: '/admin/statistics', label: 'Statistiques', icon: '📈' },
    { href: '/admin/settings', label: 'Paramètres', icon: '⚙️' },
  ];

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Accès non autorisé</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Vous n'avez pas les droits d'administration</p>
          <button
            onClick={() => router.push('/login')}
            style={{ marginTop: '16px', padding: '10px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Desktop */}
      <aside className="sidebar" style={{ display: 'none' }} onMouseEnter={(e) => { e.currentTarget.style.display = 'flex'; }}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>⚙️</span>
            <span>MEGA COUNT CRM</span>
          </div>
          <div className="sidebar-subtitle">Administration</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.first_name?.charAt(0) || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '8px 16px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', borderBottom: '1px solid #f1f5f9', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 'bold', color: '#0f172a' }}>MEGA COUNT CRM</span>
        </div>
        <span style={{ fontSize: '14px', color: '#64748b' }}>{user?.first_name}</span>
      </header>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
            onClick={() => setSidebarOpen(false)}
          />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: 'white', zIndex: 50, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '20px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '18px' }}>MEGA COUNT CRM</span>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
              >
                ✕
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: isActive ? '600' : '400',
                      background: isActive ? '#eef2ff' : 'transparent',
                      color: isActive ? '#4f46e5' : '#475569',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4f46e5' }}>
                  {user?.first_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{user?.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{ width: '100%', padding: '8px 16px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, padding: '16px', paddingTop: '80px', overflowY: 'auto', maxHeight: '100vh' }}>
        {children}
      </main>

      <style>{`
        @media (min-width: 1024px) {
          .sidebar { display: flex !important; }
          header { display: none !important; }
          main { padding-top: 24px !important; padding-left: 24px !important; }
        }
      `}</style>
    </div>
  );
}