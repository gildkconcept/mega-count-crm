'use client';

import { useState, useEffect } from 'react';
import { settingsService } from '../../../services/api';
import toast from 'react-hot-toast';

interface Settings {
  app_name: string;
  timezone: string;
  default_language: string;
  session_timeout: number;
  max_login_attempts: number;
  min_password_length: number;
  require_special_chars: boolean;
  sync_interval: number;
  confidence_threshold: number;
  max_count_duration: number;
  auto_lock_after_days: number;
}

interface SettingMetadata {
  key: string;
  description: string;
  category: string;
  is_editable: boolean;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    app_name: 'MEGA COUNT',
    timezone: 'Africa/Abidjan',
    default_language: 'fr',
    session_timeout: 3600,
    max_login_attempts: 5,
    min_password_length: 8,
    require_special_chars: true,
    sync_interval: 300,
    confidence_threshold: 0.7,
    max_count_duration: 7200,
    auto_lock_after_days: 7
  });
  const [metadata, setMetadata] = useState<SettingMetadata[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getAll();
      if (data.success) {
        setSettings(data.data.settings);
        setMetadata(data.data.metadata || []);
      }
    } catch (error) {
      toast.error('Erreur de chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof Settings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.update(settings);
      toast.success('Paramètres sauvegardés avec succès');
      loadSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Voulez-vous vraiment réinitialiser tous les paramètres ?')) return;
    try {
      await settingsService.reset();
      toast.success('Paramètres réinitialisés');
      loadSettings();
    } catch (error) {
      toast.error('Erreur de réinitialisation');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ Paramètres du système</h1>
        <p className="page-subtitle">Configuration globale de MEGA COUNT</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Général */}
        <div className="section">
          <h2 className="section-title" style={{ marginBottom: '16px' }}>📌 Général</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Nom de l'application</label>
              <input
                type="text"
                className="form-control"
                value={settings.app_name}
                onChange={(e) => handleChange('app_name', e.target.value)}
              />
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Nom affiché dans l'application
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Fuseau horaire</label>
              <select
                className="form-control"
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
              >
                <option value="Africa/Abidjan">Africa/Abidjan</option>
                <option value="Africa/Dakar">Africa/Dakar</option>
                <option value="Africa/Lagos">Africa/Lagos</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Langue par défaut</label>
            <select
              className="form-control"
              value={settings.default_language}
              onChange={(e) => handleChange('default_language', e.target.value)}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Sécurité */}
        <div className="section">
          <h2 className="section-title" style={{ marginBottom: '16px' }}>🔐 Sécurité</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Délai d'expiration (secondes)</label>
              <input
                type="number"
                className="form-control"
                value={settings.session_timeout}
                onChange={(e) => handleChange('session_timeout', parseInt(e.target.value) || 0)}
              />
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Durée avant expiration de la session
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tentatives max de connexion</label>
              <input
                type="number"
                className="form-control"
                value={settings.max_login_attempts}
                onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value) || 0)}
              />
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Nombre de tentatives avant blocage
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Longueur min du mot de passe</label>
              <input
                type="number"
                className="form-control"
                value={settings.min_password_length}
                onChange={(e) => handleChange('min_password_length', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '8px' }}>
              <input
                type="checkbox"
                checked={settings.require_special_chars}
                onChange={(e) => handleChange('require_special_chars', e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                Exiger des caractères spéciaux (!@#$%^&*)
              </label>
            </div>
          </div>
        </div>

        {/* Comptage */}
        <div className="section">
          <h2 className="section-title" style={{ marginBottom: '16px' }}>📊 Comptage</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Intervalle de synchronisation (secondes)</label>
              <input
                type="number"
                className="form-control"
                value={settings.sync_interval}
                onChange={(e) => handleChange('sync_interval', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Seuil de confiance IA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                className="form-control"
                value={settings.confidence_threshold}
                onChange={(e) => handleChange('confidence_threshold', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Durée max d'une session (secondes)</label>
              <input
                type="number"
                className="form-control"
                value={settings.max_count_duration}
                onChange={(e) => handleChange('max_count_duration', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Verrouillage automatique après (jours)</label>
              <input
                type="number"
                className="form-control"
                value={settings.auto_lock_after_days}
                onChange={(e) => handleChange('auto_lock_after_days', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ padding: '12px 32px' }}
          >
            {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder les paramètres'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleReset}
          >
            🔄 Restaurer les défauts
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadSettings}
          >
            🔄 Recharger
          </button>
        </div>
      </form>
    </div>
  );
}