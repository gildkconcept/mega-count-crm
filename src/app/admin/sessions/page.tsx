'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sessionService } from '../../../services/api';
import toast from 'react-hot-toast';

export default function AdminSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      console.log('📤 Chargement des sessions avec paramètres:', params);

      const data = await sessionService.getAll(params);
      console.log('📥 Réponse du serveur:', data);

      if (data.success) {
        setSessions(data.data || []);
      } else {
        setError(data.message || 'Erreur de chargement');
        toast.error(data.message || 'Erreur de chargement');
      }
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      setError(error.response?.data?.message || 'Erreur de connexion au serveur');
      toast.error(error.response?.data?.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: '✅ Terminée',
      started: '🔄 En cours',
      validated: '✔️ Validée',
      locked: '🔒 Verrouillée',
      cancelled: '❌ Annulée',
      pending_validation: '⏳ En attente',
      planned: '📅 Planifiée',
      interrupted: '⏹️ Interrompue',
      paused: '⏸️ Pausée',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'badge-green',
      started: 'badge-blue',
      validated: 'badge-green',
      locked: 'badge-gray',
      cancelled: 'badge-red',
      pending_validation: 'badge-yellow',
      planned: 'badge-gray',
      interrupted: 'badge-red',
      paused: 'badge-purple',
    };
    return colors[status] || 'badge-gray';
  };

  const applyFilters = () => {
    loadSessions();
  };

  const resetFilters = () => {
    setFilters({ status: '', date_from: '', date_to: '' });
    setTimeout(loadSessions, 100);
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
          <h1 className="page-title">📋 Toutes les sessions</h1>
          <p className="page-subtitle">Erreur de chargement</p>
        </div>
        <div className="section" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ color: '#dc2626', fontSize: '16px' }}>{error}</p>
          <button
            onClick={loadSessions}
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 Toutes les sessions</h1>
        <p className="page-subtitle">{sessions.length} session(s)</p>
      </div>

      {/* Filtres */}
      <div className="section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Statut</label>
            <select
              className="form-control"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Tous</option>
              <option value="started">En cours</option>
              <option value="completed">Terminée</option>
              <option value="validated">Validée</option>
              <option value="locked">Verrouillée</option>
              <option value="pending_validation">En attente</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date de début</label>
            <input
              type="date"
              className="form-control"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date de fin</label>
            <input
              type="date"
              className="form-control"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button onClick={applyFilters} className="btn btn-primary">
            Appliquer les filtres
          </button>
          <button onClick={resetFilters} className="btn btn-outline">
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Liste des sessions */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Assemblée</th>
              <th>Compteur</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Aucune session enregistrée
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr
                  key={session.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/admin/sessions/${session.id}`)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td>
                    <code style={{ fontSize: '14px', color: '#64748b' }}>{session.session_identifier}</code>
                  </td>
                  <td>{session.assembly_name || '-'}</td>
                  <td>{session.user_name || '-'}</td>
                  <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{session.total_count}</td>
                  <td>
                    <span className={`badge ${getStatusColor(session.status)}`}>
                      {getStatusLabel(session.status)}
                    </span>
                  </td>
                  <td style={{ fontSize: '14px', color: '#94a3b8' }}>
                    {new Date(session.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}