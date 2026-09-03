'use client';

import { useState, useEffect } from 'react';
import { worshipService, assemblyService } from '../../../services/api';
import toast from 'react-hot-toast';

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    assembly_id: '',
    service_type_id: '',
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    expected_duration: '',
    max_capacity: '',
    status: 'planned'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesData, assembliesData, typesData] = await Promise.all([
        worshipService.getAll(),
        assemblyService.getAll(),
        worshipService.getTypes()
      ]);
      if (servicesData.success) setServices(servicesData.data || []);
      if (assembliesData.success) setAssemblies(assembliesData.data || []);
      if (typesData.success) setServiceTypes(typesData.data || []);
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        assembly_id: formData.assembly_id,
        service_type_id: formData.service_type_id,
        title: formData.title,
        description: formData.description || null,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time || null,
        expected_duration: formData.expected_duration ? parseInt(formData.expected_duration) : null,
        max_capacity: formData.max_capacity ? parseInt(formData.max_capacity) : null,
        status: formData.status || 'planned'
      };

      console.log('📤 Envoi des données:', data);

      if (editingId) {
        await worshipService.update(editingId, data);
        toast.success('Culte modifié');
      } else {
        await worshipService.create(data);
        toast.success('Culte créé');
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
      service_type_id: '',
      title: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      expected_duration: '',
      max_capacity: '',
      status: 'planned'
    });
    setEditingId(null);
  };

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setFormData({
      assembly_id: service.assembly_id,
      service_type_id: service.service_type_id,
      title: service.title,
      description: service.description || '',
      date: service.date?.split('T')[0] || '',
      start_time: service.start_time?.slice(0, 5) || '',
      end_time: service.end_time?.slice(0, 5) || '',
      expected_duration: service.expected_duration?.toString() || '',
      max_capacity: service.max_capacity?.toString() || '',
      status: service.status || 'planned'
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce culte ?')) return;
    try {
      await worshipService.delete(id);
      toast.success('Culte supprimé');
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
        <h1 className="page-title">📅 Cultes</h1>
        <p className="page-subtitle">{services.length} culte(s)</p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          + Ajouter un culte
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Assemblée</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              const assembly = assemblies.find(a => a.id === service.assembly_id);
              const type = serviceTypes.find(t => t.id === service.service_type_id);
              return (
                <tr key={service.id}>
                  <td style={{ fontWeight: '500', color: '#0f172a' }}>{service.title}</td>
                  <td>{assembly?.name || '-'}</td>
                  <td>{new Date(service.date).toLocaleDateString()}</td>
                  <td>{service.start_time?.slice(0, 5)}</td>
                  <td>
                    <span className={`badge ${
                      service.status === 'active' ? 'badge-green' :
                      service.status === 'completed' ? 'badge-blue' :
                      service.status === 'cancelled' ? 'badge-red' :
                      'badge-gray'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(service)}
                        className="btn btn-primary btn-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
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
                {editingId ? 'Modifier' : 'Ajouter'} un culte
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

              <div className="form-group">
                <label className="form-label">Type de culte *</label>
                <select
                  className="form-control"
                  value={formData.service_type_id}
                  onChange={(e) => setFormData({ ...formData, service_type_id: e.target.value })}
                  required
                >
                  <option value="">Sélectionner un type</option>
                  {serviceTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Titre *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Heure début *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Heure fin</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Durée (min)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.expected_duration}
                    onChange={(e) => setFormData({ ...formData, expected_duration: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacité max</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
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
                  <option value="planned">Planifié</option>
                  <option value="active">Actif</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                  <option value="postponed">Reporté</option>
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