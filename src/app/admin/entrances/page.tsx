'use client';

import { useState, useEffect } from 'react';
import { entranceService, assemblyService } from '../../../services/api';
import toast from 'react-hot-toast';

export default function AdminEntrancesPage() {
  const [entrances, setEntrances] = useState<any[]>([]);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    assembly_id: '',
    name: '',
    code: '',
    description: '',
    type: 'main',
    capacity: '',
    priority: '0'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [entrancesData, assembliesData] = await Promise.all([
        entranceService.getAll(),
        assemblyService.getAll()
      ]);
      if (entrancesData.success) setEntrances(entrancesData.data || []);
      if (assembliesData.success) setAssemblies(assembliesData.data || []);
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Générer un code automatique à partir du nom
      const autoCode = formData.name
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z]/g, '')
        .slice(0, 5) || 'ENT';

      const data = {
        assembly_id: formData.assembly_id,
        name: formData.name,
        code: formData.code || autoCode,
        description: formData.description || null,
        type: formData.type || 'main',
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        priority: parseInt(formData.priority) || 0
      };

      console.log('📤 Envoi des données:', data);

      if (editingId) {
        await entranceService.update(editingId, data);
        toast.success('Entrée modifiée');
      } else {
        await entranceService.create(data);
        toast.success('Entrée créée');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const resetForm = () => {
    setFormData({
      assembly_id: '',
      name: '',
      code: '',
      description: '',
      type: 'main',
      capacity: '',
      priority: '0'
    });
    setEditingId(null);
  };

  const handleEdit = (entrance: any) => {
    setEditingId(entrance.id);
    setFormData({
      assembly_id: entrance.assembly_id,
      name: entrance.name,
      code: entrance.code || '',
      description: entrance.description || '',
      type: entrance.type || 'main',
      capacity: entrance.capacity?.toString() || '',
      priority: entrance.priority?.toString() || '0'
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette entrée ?')) return;
    try {
      await entranceService.delete(id);
      toast.success('Entrée supprimée');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
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
        <h1 className="page-title">🚪 Entrées</h1>
        <p className="page-subtitle">{entrances.length} entrée(s)</p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          + Ajouter une entrée
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Code</th>
              <th>Assemblée</th>
              <th>Type</th>
              <th>Capacité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entrances.map((entrance) => {
              const assembly = assemblies.find(a => a.id === entrance.assembly_id);
              return (
                <tr key={entrance.id}>
                  <td style={{ fontWeight: '500', color: '#0f172a' }}>{entrance.name}</td>
                  <td><code style={{ fontSize: '14px', color: '#64748b' }}>{entrance.code}</code></td>
                  <td>{assembly?.name || '-'}</td>
                  <td>
                    <span className="badge badge-blue">
                      {entrance.type}
                    </span>
                  </td>
                  <td>{entrance.capacity || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(entrance)}
                        className="btn btn-primary btn-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(entrance.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? 'Modifier' : 'Ajouter'} une entrée
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Assemblée *</label>
                <select
                  className="form-control"
                  value={formData.assembly_id}
                  onChange={(e) => setFormData({ ...formData, assembly_id: e.target.value })}
                  required
                >
                  <option value="">Sélectionner une assemblée</option>
                  {assemblies.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Généré automatiquement"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-control"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="main">Principale</option>
                    <option value="north">Nord</option>
                    <option value="south">Sud</option>
                    <option value="east">Est</option>
                    <option value="west">Ouest</option>
                    <option value="children">Enfants</option>
                    <option value="vip">VIP</option>
                    <option value="secondary">Secondaire</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Capacité</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priorité</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  />
                </div>
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