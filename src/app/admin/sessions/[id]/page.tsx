'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { assemblyService } from '../../../../services/api';
import toast from 'react-hot-toast';

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const data = await sessionService.getById(sessionId);
      if (data.success) {
        setSession(data.data);
      } else {
        setError('Session non trouvée');
      }
    } catch (error) {
      setError('Erreur de chargement');
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{error || 'Session non trouvée'}</h2>
        <button
          onClick={() => router.push('/admin/sessions')}
          className="btn btn-primary"
          style={{ marginTop: '16px' }}
        >
          Retour aux sessions
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h1 className="page-title">{session.session_identifier}</h1>
          <span className={`badge ${getStatusColor(session.status)}`}>
            {getStatusLabel(session.status)}
          </span>
        </div>
        <p className="page-subtitle">
          {session.assembly_name} • {session.entrance_name}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-label">Total</div>
          <div className="stat-card-value" style={{ fontSize: '32px' }}>{session.total_count}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Hommes</div>
          <div className="stat-card-value" style={{ fontSize: '32px', color: '#3b82f6' }}>{session.men_count || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Femmes</div>
          <div className="stat-card-value" style={{ fontSize: '32px', color: '#ec4899' }}>{session.women_count || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Enfants</div>
          <div className="stat-card-value" style={{ fontSize: '32px', color: '#22c55e' }}>{session.children_count || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Durée</div>
          <div className="stat-card-value" style={{ fontSize: '24px' }}>
            {session.duration ? `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` : 'N/A'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Méthode</div>
          <div className="stat-card-value" style={{ fontSize: '20px', textTransform: 'capitalize' }}>
            {session.method === 'auto' ? '🤖 Automatique' : '👤 Manuel'}
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title" style={{ marginBottom: '16px' }}>📋 Détails de la session</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Assemblée</div>
            <div style={{ fontWeight: '500', color: '#0f172a' }}>{session.assembly_name}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Entrée</div>
            <div style={{ fontWeight: '500', color: '#0f172a' }}>{session.entrance_name}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Culte</div>
            <div style={{ fontWeight: '500', color: '#0f172a' }}>{session.service_title || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Compteur</div>
            <div style={{ fontWeight: '500', color: '#0f172a' }}>{session.user_name || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Début</div>
            <div style={{ fontWeight: '500', color: '#0f172a' }}>
              {new Date(session.start_time).toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Fin</div>
            <div style={{ fontWeight: '500', color: '#0f172a' }}>
              {session.end_time ? new Date(session.end_time).toLocaleString() : 'En cours'}
            </div>
          </div>
        </div>

        {session.validation_notes && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Notes de validation</div>
            <div style={{ color: '#0f172a' }}>{session.validation_notes}</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button
          onClick={() => router.push('/admin/sessions')}
          className="btn btn-outline"
        >
          ← Retour
        </button>
        {session.status === 'completed' && (
          <>
            <button
              onClick={async () => {
                try {
                  await sessionService.validate(session.id, { validation_notes: 'Validé depuis l\'admin' });
                  toast.success('Session validée');
                  loadSession();
                } catch (error) {
                  toast.error('Erreur de validation');
                }
              }}
              className="btn btn-success"
            >
              ✅ Valider
            </button>
            <button
              onClick={async () => {
                try {
                  await sessionService.lock(session.id, { lock_reason: 'Verrouillé depuis l\'admin' });
                  toast.success('Session verrouillée');
                  loadSession();
                } catch (error) {
                  toast.error('Erreur de verrouillage');
                }
              }}
              className="btn btn-primary"
            >
              🔒 Verrouiller
            </button>
          </>
        )}
        <button
          onClick={async () => {
            if (confirm('Voulez-vous vraiment supprimer cette session ?')) {
              try {
                await sessionService.delete(session.id);
                toast.success('Session supprimée');
                router.push('/admin/sessions');
              } catch (error) {
                toast.error('Erreur de suppression');
              }
            }
          }}
          className="btn btn-danger"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
}