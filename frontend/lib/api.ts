const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ClientRegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface ProviderRegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profession: string;
  description: string;
  booked: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  role?: string;
}

export interface Timeslot {
  id: string;
  workingDays: string;
  startTime: string;
  endTime: string;
  booked?: boolean;
  owner_id?: string;
}

export interface CreateTimeslotData {
  workingDays: string;
  startTime: string;
  endTime: string;
}

export interface Appointment {
  id: string;
  clientid?: string;
  clientId?: string;
  timeslot_id: string;
  appointment_date: string;
  status: string;
  owner_id?: string;
  workingDays?: string;
  startTime?: string;
  endTime?: string;
  booked?: boolean;
  provider_first_name?: string;
  provider_last_name?: string;
  profession?: string;
  client_first_name?: string;
  client_last_name?: string;
  client_email?: string;
}

export interface CreateAppointmentData {
  timeslot_id: string;
  appointment_date: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  client?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  provider?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profession?: string;
    description?: string;
  };
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to make API calls
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response;
  } catch (error: any) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Failed to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  clientRegister: async (data: ClientRegisterData & { role?: string }): Promise<{ message: string; clientId?: { id: string }; clientid?: { id: string } }> => {
    const response = await apiCall('/auth/clientRegister', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await response.json();
    // Handle both clientId and clientid (backend returns clientid)
    return {
      ...result,
      clientId: result.clientId || result.clientid
    };
  },

  clientLogin: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiCall('/auth/clientLogin', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        role: data.role || 'client',
      }),
    });
    return response.json();
  },

  providerRegister: async (data: ProviderRegisterData): Promise<{ message: string; providerId: string }> => {
    const response = await apiCall('/auth/providerRegister', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  providerLogin: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiCall('/auth/providerLogin', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        role: data.role || 'provider',
      }),
    });
    return response.json();
  },
};

// Timeslot API
export const timeslotAPI = {
  getAll: async (): Promise<Timeslot[]> => {
    const response = await apiCall('/timeslot/viewTimeslot', {
      method: 'GET',
    });
    return response.json();
  },

  create: async (data: CreateTimeslotData): Promise<{ message: string; id: string }> => {
    const response = await apiCall('/timeslot/createTimeslot', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: CreateTimeslotData): Promise<{ message: string; updatedTimeslot: Timeslot }> => {
    const response = await apiCall(`/timeslot/${id}/updateTimeslot`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiCall(`/timeslot/${id}/DeleteTimeslot`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Provider API
export interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profession: string;
  description: string;
}

export interface ProviderWithTimeslots {
  provider: Provider;
  timeslots: Timeslot[];
}

export const providerAPI = {
  getAll: async (search?: string, profession?: string): Promise<Provider[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (profession) params.append('profession', profession);
    
    const queryString = params.toString();
    const endpoint = `/users/providers${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiCall(endpoint, {
      method: 'GET',
    });
    return response.json();
  },

  getTimeslots: async (providerId: string): Promise<ProviderWithTimeslots> => {
    const response = await apiCall(`/users/providers/${providerId}/timeslots`, {
      method: 'GET',
    });
    return response.json();
  },
};

// Appointment API
export const appointmentAPI = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await apiCall('/appointment/getAppointments', {
      method: 'GET',
    });
    return response.json();
  },

  getProviderAppointments: async (): Promise<Appointment[]> => {
    const response = await apiCall('/appointment/getProviderAppointments', {
      method: 'GET',
    });
    return response.json();
  },

  create: async (data: CreateAppointmentData): Promise<{ message: string; appointment: Appointment }> => {
    const response = await apiCall('/appointment/createAppointment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  cancel: async (appointmentId: string): Promise<{ message: string }> => {
    const response = await apiCall('/appointment/cancelAppointment', {
      method: 'PATCH',
      body: JSON.stringify({ appointmentId }),
    });
    return response.json();
  },
};

