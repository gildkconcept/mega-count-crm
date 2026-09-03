'use client';

import { useState, useEffect } from 'react';
import { assemblyService } from '../../../services/api';
import toast from 'react-hot-toast';

export default function AdminAssembliesPage() {
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    zone: '',
    country: "Côte d'Ivoire",
    phone: '',
    pastor_name: '',
    status: 'active'
  });

  useEffect(() => {
    loadAssemblies();
  }, []);

  const loadAssemblies = async () => {
    try {
      const data = await assemblyService.getAll();
      if (data.success) setAssemblies(data.data);
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier que le nom est présent
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Le nom de l\'assemblée est requis');
      return;
    }

    try {
      // Envoyer uniquement les champs qui existent dans la base
      const dataToSend = {
        name: formData.name.trim(),
        zone: formData.zone || null,
        city: formData.city || null,
        country: formData.country || 'Côte d\'Ivoire',
        phone: formData.phone || null,
        pastor_name: formData.pastor_name || null,
        status: formData.status || 'active'
      };

      console.log('📤 Envoi des données:', dataToSend);

      if (editingId) {
        await assemblyService.update(editingId, dataToSend);
        toast.success('Assemblée modifiée');
      } else {
        await assemblyService.create(dataToSend);
        toast.success('Assemblée créée');
      }
      setShowModal(false);
      resetForm();
      loadAssemblies();
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      zone: '',
      country: "Côte d'Ivoire",
      phone: '',
      pastor_name: '',
      status: 'active'
    });
    setEditingId(null);
  };

  const handleEdit = (assembly: any) => {
    setEditingId(assembly.id);
    setFormData({
      name: assembly.name,
      city: assembly.city || '',
      zone: assembly.zone || '',
      country: assembly.country || "Côte d'Ivoire",
      phone: assembly.phone || '',
      pastor_name: assembly.pastor_name || '',
      status: assembly.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette assemblée ?')) return;
    try {
      await assemblyService.delete(id);
      toast.success('Assemblée supprimée');
      loadAssemblies();
    } catch (error) {
      toast.error('Erreur de suppression');
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
        <h1 className="page-title">⛪ Assemblées</h1>
        <p className="page-subtitle">{assemblies.length} assemblée(s)</p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          + Ajouter une assemblée
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Ville</th>
              <th>Zone</th>
              <th>Pasteur</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assemblies.map((assembly) => (
              <tr key={assembly.id}>
                <td style={{ fontWeight: '500', color: '#0f172a' }}>{assembly.name}</td>
                <td>{assembly.city || '-'}</td>
                <td>{assembly.zone || '-'}</td>
                <td>{assembly.pastor_name || '-'}</td>
                <td>
                  <span className={`badge ${
                    assembly.status === 'active' ? 'badge-green' :
                    assembly.status === 'inactive' ? 'badge-yellow' :
                    'badge-gray'
                  }`}>
                    {assembly.status === 'active' ? 'Active' :
                     assembly.status === 'inactive' ? 'Inactive' : 'Archivée'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(assembly)}
                      className="btn btn-primary btn-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(assembly.id)}
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
                {editingId ? 'Modifier' : 'Ajouter'} une assemblée
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Assemblée d'Abobo"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Ville</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="ex: Abidjan"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Zone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    placeholder="ex: Abobo"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pays</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="ex: Côte d'Ivoire"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="ex: +225 01 23 45 67"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pasteur</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.pastor_name}
                    onChange={(e) => setFormData({ ...formData, pastor_name: e.target.value })}
                    placeholder="ex: Pasteur Jean Kouassi"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Statut</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archivée</option>
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