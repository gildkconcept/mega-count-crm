'use client';

import { useState, useEffect } from 'react';
import { userService } from '../../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'COMPTEUR'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      if (data.success) setUsers(data.data || []);
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = [];
    if (!formData.username || formData.username.trim() === '') missingFields.push('Nom d\'utilisateur');
    if (!formData.password || formData.password.trim() === '') missingFields.push('Mot de passe');
    if (!formData.first_name || formData.first_name.trim() === '') missingFields.push('Prénom');
    if (!formData.last_name || formData.last_name.trim() === '') missingFields.push('Nom');

    if (missingFields.length > 0) {
      toast.error(`Champs manquants: ${missingFields.join(', ')}`);
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      const dataToSend = {
        username: formData.username.trim(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone?.trim() || null,
        role: formData.role || 'COMPTEUR'
      };

      if (editingId) {
        await userService.update(editingId, dataToSend);
        toast.success('Utilisateur modifié avec succès');
      } else {
        await userService.create(dataToSend);
        toast.success('Utilisateur créé avec succès');
      }
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Erreur lors de l\'enregistrement';
      toast.error(errorMsg);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'COMPTEUR'
    });
    setEditingId(null);
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      password: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      role: user.roles?.[0] || 'COMPTEUR'
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
    try {
      await userService.delete(id);
      toast.success('Utilisateur supprimé avec succès');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de suppression');
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
        <h1 className="page-title">👥 Utilisateurs</h1>
        <p className="page-subtitle">{users.length} utilisateur(s)</p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          + Ajouter un utilisateur
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Nom d'utilisateur</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ fontWeight: '500', color: '#0f172a' }}>{user.first_name} {user.last_name}</div>
                </td>
                <td>
                  <code style={{ fontSize: '13px', color: '#64748b' }}>@{user.username}</code>
                </td>
                <td>{user.phone || '-'}</td>
                <td>
                  <span className={`badge ${
                    user.roles?.includes('SUPER_ADMIN') ? 'badge-yellow' :
                    user.roles?.includes('ADMIN') ? 'badge-blue' :
                    'badge-gray'
                  }`}>
                    {user.roles?.join(', ') || 'Utilisateur'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>
                    {user.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn btn-primary btn-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? 'Modifier' : 'Ajouter'} un utilisateur
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom d'utilisateur *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  placeholder="ex: jean.martin"
                  required
                />
              </div>

              {!editingId && (
                <div className="form-group">
                  <label className="form-label">Mot de passe *</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 8 caractères"
                    required
                    minLength={8}
                  />
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    Le mot de passe doit contenir au moins 8 caractères
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Prénom *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="ex: Jean"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="ex: Martin"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="ex: +225 07 89 10 11"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rôle</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="COMPTEUR">Compteur</option>
                  <option value="AUDITEUR">Auditeur</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingId ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}