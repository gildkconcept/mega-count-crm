import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://floors-amino-steel-nine.trycloudflare.com';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Erreur réponse:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =============================================
// AUTH SERVICE
// =============================================
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
  me: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// =============================================
// USER SERVICE
// =============================================
export const userService = {
  getAll: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    try {
      console.log('📤 Création utilisateur - Données reçues:', data);
      
      const cleanData = {
        username: data.username?.trim(),
        password: data.password,
        first_name: data.first_name?.trim(),
        last_name: data.last_name?.trim(),
        phone: data.phone?.trim() || null,
        role: data.role || 'COMPTEUR'
      };

      if (!cleanData.username || !cleanData.password || !cleanData.first_name || !cleanData.last_name) {
        throw new Error('Tous les champs requis doivent être remplis');
      }

      console.log('📤 Envoi des données nettoyées (sans email):', cleanData);
      
      const response = await api.post('/api/users', cleanData);
      console.log('✅ Utilisateur créé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur create user:', error);
      throw error;
    }
  },
  update: async (id: string, data: any) => {
    const cleanData = {
      first_name: data.first_name?.trim(),
      last_name: data.last_name?.trim(),
      phone: data.phone?.trim() || null,
      is_active: data.is_active
    };
    const response = await api.put(`/api/users/${id}`, cleanData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
  assignRole: async (id: string, roleCode: string) => {
    const response = await api.post(`/api/users/${id}/roles`, { roleCode });
    return response.data;
  },
  removeRole: async (id: string, roleCode: string) => {
    const response = await api.delete(`/api/users/${id}/roles/${roleCode}`);
    return response.data;
  },
};

// =============================================
// ASSEMBLY SERVICE
// =============================================
export const assemblyService = {
  getAll: async () => {
    const response = await api.get('/api/assemblies');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/assemblies/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const cleanData = {
      name: data.name?.trim(),
      zone: data.zone?.trim() || null,
      city: data.city?.trim() || null,
      country: data.country?.trim() || "Côte d'Ivoire",
      phone: data.phone?.trim() || null,
      pastor_name: data.pastor_name?.trim() || null,
      status: data.status || 'active'
    };
    const response = await api.post('/api/assemblies', cleanData);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const cleanData = {
      name: data.name?.trim(),
      zone: data.zone?.trim() || null,
      city: data.city?.trim() || null,
      country: data.country?.trim() || "Côte d'Ivoire",
      phone: data.phone?.trim() || null,
      pastor_name: data.pastor_name?.trim() || null,
      status: data.status || 'active'
    };
    const response = await api.put(`/api/assemblies/${id}`, cleanData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/assemblies/${id}`);
    return response.data;
  },
};

// =============================================
// ENTRANCE SERVICE
// =============================================
export const entranceService = {
  getAll: async (assembly_id?: string) => {
    const params = assembly_id ? { assembly_id } : {};
    const response = await api.get('/api/entrances', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/entrances/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const cleanData = {
      assembly_id: data.assembly_id,
      name: data.name?.trim(),
      code: data.code?.trim() || data.name?.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'ENT',
      description: data.description?.trim() || null,
      type: data.type || 'main',
      capacity: data.capacity ? parseInt(data.capacity) : null,
      priority: parseInt(data.priority) || 0
    };
    const response = await api.post('/api/entrances', cleanData);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const cleanData = {
      name: data.name?.trim(),
      code: data.code?.trim(),
      description: data.description?.trim() || null,
      type: data.type || 'main',
      capacity: data.capacity ? parseInt(data.capacity) : null,
      priority: parseInt(data.priority) || 0
    };
    const response = await api.put(`/api/entrances/${id}`, cleanData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/entrances/${id}`);
    return response.data;
  },
};

// =============================================
// WORSHIP SERVICE
// =============================================
export const worshipService = {
  getAll: async (params?: any) => {
    const response = await api.get('/api/services', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/services/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const cleanData = {
      assembly_id: data.assembly_id,
      service_type_id: data.service_type_id,
      title: data.title?.trim(),
      description: data.description?.trim() || null,
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time || null,
      expected_duration: data.expected_duration ? parseInt(data.expected_duration) : null,
      max_capacity: data.max_capacity ? parseInt(data.max_capacity) : null,
      status: data.status || 'planned'
    };
    const response = await api.post('/api/services', cleanData);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const cleanData = {
      title: data.title?.trim(),
      description: data.description?.trim() || null,
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time || null,
      expected_duration: data.expected_duration ? parseInt(data.expected_duration) : null,
      max_capacity: data.max_capacity ? parseInt(data.max_capacity) : null,
      status: data.status || 'planned'
    };
    const response = await api.put(`/api/services/${id}`, cleanData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/services/${id}`);
    return response.data;
  },
  getTypes: async () => {
    const response = await api.get('/api/service-types');
    return response.data;
  },
};

// =============================================
// SESSION SERVICE
// =============================================
export const sessionService = {
  getAll: async (params?: any) => {
    try {
      console.log('📤 Récupération des sessions avec params:', params);
      const response = await api.get('/api/sessions', { params });
      console.log('📥 Réponse des sessions:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur sessionService.getAll:', error);
      throw error;
    }
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/sessions/${id}`);
    return response.data;
  },
  start: async (data: any) => {
    const response = await api.post('/api/sessions/start', data);
    return response.data;
  },
  end: async (id: string, data: any) => {
    const response = await api.put(`/api/sessions/${id}/end`, data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/api/sessions/${id}`, data);
    return response.data;
  },
  validate: async (id: string, data: any) => {
    const response = await api.post(`/api/sessions/${id}/validate`, data);
    return response.data;
  },
  lock: async (id: string, data: any) => {
    const response = await api.post(`/api/sessions/${id}/lock`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/sessions/${id}`);
    return response.data;
  },
  getStats: async (params?: any) => {
    const response = await api.get('/api/sessions/stats', { params });
    return response.data;
  },
};

// =============================================
// STATISTICS SERVICE
// =============================================
export const statisticsService = {
  getDashboard: async () => {
    try {
      console.log('📤 Appel API: /api/statistics/dashboard');
      const response = await api.get('/api/statistics/dashboard');
      console.log('📥 Réponse dashboard:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getDashboard:', error);
      throw error;
    }
  },
  getGlobal: async () => {
    try {
      console.log('📤 Appel API: /api/statistics/global');
      const response = await api.get('/api/statistics/global');
      console.log('📥 Réponse global:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getGlobal:', error);
      throw error;
    }
  },
  getAssemblyStats: async (id: string) => {
    try {
      console.log(`📤 Appel API: /api/statistics/assembly/${id}`);
      const response = await api.get(`/api/statistics/assembly/${id}`);
      console.log('📥 Réponse assembly stats:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAssemblyStats:', error);
      throw error;
    }
  },
  getUserStats: async (id: string) => {
    try {
      console.log(`📤 Appel API: /api/statistics/user/${id}`);
      const response = await api.get(`/api/statistics/user/${id}`);
      console.log('📥 Réponse user stats:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getUserStats:', error);
      throw error;
    }
  },
};

// =============================================
// SETTINGS SERVICE
// =============================================
export const settingsService = {
  getAll: async () => {
    try {
      console.log('📤 Appel API: /api/settings');
      const response = await api.get('/api/settings');
      console.log('📥 Réponse settings:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur settingsService.getAll:', error);
      throw error;
    }
  },
  update: async (settings: any) => {
    const response = await api.put('/api/settings', settings);
    return response.data;
  },
  reset: async () => {
    const response = await api.post('/api/settings/reset');
    return response.data;
  },
};