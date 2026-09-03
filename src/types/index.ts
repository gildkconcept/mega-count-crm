export interface User {
  id: string;
  username: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  roles: string[];
  permissions?: string[];
  created_at: string;
  last_login?: string;
}

export interface Assembly {
  id: string;
  code: string;
  name: string;
  address?: string;
  zone?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  pastor_name?: string;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Entrance {
  id: string;
  assembly_id: string;
  name: string;
  code: string;
  description?: string;
  type: 'main' | 'north' | 'south' | 'east' | 'west' | 'children' | 'vip' | 'secondary';
  is_active: boolean;
  capacity?: number;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface WorshipService {
  id: string;
  assembly_id: string;
  service_type_id: string;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time?: string;
  expected_duration?: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled' | 'postponed';
  max_capacity?: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CountingSession {
  id: string;
  session_identifier: string;
  user_id: string;
  assembly_id: string;
  worship_service_id: string;
  entrance_id: string;
  user_name?: string;
  assembly_name?: string;
  entrance_name?: string;
  service_title?: string;
  status: 'planned' | 'started' | 'paused' | 'interrupted' | 'completed' | 'cancelled' | 'pending_validation' | 'validated' | 'locked';
  start_time: string;
  end_time?: string;
  duration?: number;
  method: 'auto' | 'manual' | 'mixed';
  counting_data?: any;
  total_count: number;
  men_count: number;
  women_count: number;
  children_count: number;
  device_info?: any;
  is_synced: boolean;
  synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  today: {
    count: number;
    sessions: number;
  };
  active_assemblies: number;
  active_counters: number;
  pending_validations: number;
  total: {
    assemblies: number;
    users: number;
    sessions: number;
    count: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}