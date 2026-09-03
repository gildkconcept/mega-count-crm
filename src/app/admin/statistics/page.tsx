'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { statisticsService } from '../../../services/api';
import toast from 'react-hot-toast';

export default function AdminStatisticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [assemblyStats, setAssemblyStats] = useState<any[]>([]);
  const [topCounters, setTopCounters] = useState<any[]>([]);
  const [evolution, setEvolution] = useState<any[]>([]);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('📤 Chargement des statistiques...');
      
      const globalRes = await statisticsService.getGlobal();
      console.log('📥 Réponse globale:', globalRes);

      if (globalRes.success) {
        setGlobalStats(globalRes.data.stats || {});
        setAssemblyStats(globalRes.data.top_assemblies || []);
        setTopCounters(globalRes.data.top_counters || []);
        setEvolution(globalRes.data.evolution || []);
      } else {
        setError(globalRes.message || 'Erreur de chargement des statistiques');
        toast.error(globalRes.message || 'Erreur de chargement des statistiques');
      }
    } catch (error: any) {
      console.error('❌ Erreur détaillée:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Erreur de connexion au serveur';
      setError(errorMsg);
      toast.error(errorMsg);
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

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">📈 Statistiques avancées</h1>
          <p className="page-subtitle">Erreur de chargement</p>
        </div>
        <div className="section" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ color: '#dc2626', fontSize: '16px' }}>{error}</p>
          <button
            onClick={loadData}
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total sessions', 
      value: globalStats?.total_sessions || 0, 
      icon: '📋', 
      color: '#4f46e5' 
    },
    { 
      title: 'Total personnes', 
      value: globalStats?.total_count || 0, 
      icon: '👤', 
      color: '#22c55e' 
    },
    { 
      title: 'Moyenne par session', 
      value: Math.round(globalStats?.average_count || 0), 
      icon: '📊', 
      color: '#8b5cf6' 
    },
    { 
      title: 'Compteurs uniques', 
      value: globalStats?.unique_counters || 0, 
      icon: '👥', 
      color: '#06b6d4' 
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📈 Statistiques avancées</h1>
        <p className="page-subtitle">Analyse détaillée du système</p>
      </div>

      {/* Période */}
      <div className="section" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '600', color: '#334155' }}>Période :</span>
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`btn ${period === p ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Top Assemblées */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">🏛️ Top Assemblées</h2>
          </div>
          {assemblyStats.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>
              Aucune donnée disponible
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {assemblyStats.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#4f46e5',
                      fontSize: '14px',
                      minWidth: '24px'
                    }}>
                      #{index + 1}
                    </span>
                    <span style={{ fontWeight: '500', color: '#0f172a' }}>
                      {item.name || 'Assemblée'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>
                      {item.total_count || 0}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>
                      personnes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Compteurs */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">🏆 Top Compteurs</h2>
          </div>
          {topCounters.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>
              Aucune donnée disponible
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topCounters.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#4f46e5',
                      fontSize: '14px',
                      minWidth: '24px'
                    }}>
                      #{index + 1}
                    </span>
                    <span style={{ fontWeight: '500', color: '#0f172a' }}>
                      {item.first_name || 'Compteur'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>
                      {item.total_count || 0}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>
                      personnes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Évolution */}
      <div className="section" style={{ marginTop: '16px' }}>
        <div className="section-header">
          <h2 className="section-title">📊 Évolution des comptages</h2>
        </div>
        {evolution && evolution.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '12px', minWidth: '600px', padding: '8px 0' }}>
              {evolution.slice(0, 14).map((item: any, index: number) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.min((item.count / 50) * 100, 150)}px`,
                      background: '#4f46e5',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '10px',
                      transition: 'all 0.5s',
                      opacity: 0.7 + (item.count / 200)
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                    {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>
            Aucune donnée d'évolution disponible
          </p>
        )}
      </div>
    </div>
  );
}