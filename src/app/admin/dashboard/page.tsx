'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const statsRes = await fetch('https://floors-amino-steel-nine.trycloudflare.com/api/statistics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.data);

      const sessionsRes = await fetch('https://floors-amino-steel-nine.trycloudflare.com/api/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sessionsData = await sessionsRes.json();
      if (sessionsData.success) setRecentSessions(sessionsData.data || []);

    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Utilisateurs', value: stats?.total?.users || 0, icon: '👥', color: '#4f46e5' },
    { title: 'Assemblées', value: stats?.total?.assemblies || 0, icon: '⛪', color: '#8b5cf6' },
    { title: 'Sessions', value: stats?.total?.sessions || 0, icon: '📋', color: '#06b6d4' },
    { title: 'Personnes comptées', value: stats?.total?.count || 0, icon: '👤', color: '#22c55e' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Tableau de bord Admin</h1>
        <p className="page-subtitle">Vue d'ensemble du système MEGA COUNT</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-content">
              <div>
                <div className="stat-card-label">{card.title}</div>
                <div className="stat-card-value">{card.value}</div>
              </div>
              <div className="stat-card-icon" style={{ background: `${card.color}15` }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">📋 Sessions récentes</h2>
          <button
            onClick={() => router.push('/admin/sessions')}
            style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            Voir tout →
          </button>
        </div>
        
        {recentSessions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0' }}>
            Aucune session enregistrée
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentSessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                onClick={() => router.push(`/admin/sessions/${session.id}`)}
              >
                <div>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>
                    {session.session_identifier}
                  </span>
                  <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '12px' }}>
                    {session.total_count} personnes
                  </span>
                </div>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}