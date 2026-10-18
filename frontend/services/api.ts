import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'OPERATOR';
    department?: string;
    machineGroup?: string;
    lastLogin?: string;
  };
}

interface ApiError {
  error: string;
}

let refreshRequest: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshRequest) {
    return refreshRequest;
  }

  refreshRequest = (async () => {
    const { refreshToken, setAccessToken, logout } = useAuthStore.getState();

    if (!refreshToken) {
      logout();
      throw new Error('Session expired');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      logout();
      throw new Error('Session expired');
    }

    const data: { accessToken: string } = await response.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
  })().finally(() => {
    refreshRequest = null;
  });

  return refreshRequest;
}

async function authenticatedFetch(url: string, token: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  let response = await fetch(url, { ...init, headers });
  if (response.status !== 401) {
    return response;
  }

  const newAccessToken = await refreshAccessToken();
  headers.set('Authorization', `Bearer ${newAccessToken}`);
  response = await fetch(url, { ...init, headers });
  return response;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || 'An error occurred');
  }
  return response.json();
}

export const authService = {
  async login(email: string, password: string, role: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    return handleResponse<LoginResponse>(response);
  },

  async register(email: string, password: string, name: string, role: string, department?: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role, department }),
    });
    return handleResponse<LoginResponse>(response);
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(response);
  },

  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });
    return handleResponse<{ message: string }>(response);
  },

  async getProfile(token: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/auth/profile`, token);
    return handleResponse<any>(response);
  },

  async logout(token: string): Promise<{ message: string }> {
    const response = await authenticatedFetch(`${API_BASE_URL}/auth/logout`, token, {
      method: 'POST',
    });
    return handleResponse<{ message: string }>(response);
  },
};

export const machineService = {
  async getMachines(token: string): Promise<any[]> {
    const response = await authenticatedFetch(`${API_BASE_URL}/machines`, token);
    return handleResponse<any[]>(response);
  },

  async getMachine(token: string, id: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/machines/${id}`, token);
    return handleResponse<any>(response);
  },

  async getMachineStats(token: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/machines/stats`, token);
    return handleResponse<any>(response);
  },

  async createMachine(token: string, data: any): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/machines`, token, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  async updateMachine(token: string, id: string, data: any): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/machines/${id}`, token, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },
};

export const sensorService = {
  async getSensors(token: string, machineId?: string): Promise<any[]> {
    const url = machineId 
      ? `${API_BASE_URL}/sensors?machineId=${machineId}`
      : `${API_BASE_URL}/sensors`;
    const response = await authenticatedFetch(url, token);
    return handleResponse<any[]>(response);
  },
};

export const alertService = {
  async getAlerts(token: string, status?: string): Promise<any[]> {
    const url = status 
      ? `${API_BASE_URL}/alerts?status=${status}`
      : `${API_BASE_URL}/alerts`;
    const response = await authenticatedFetch(url, token);
    return handleResponse<any[]>(response);
  },

  async getAlertStats(token: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/alerts/stats`, token);
    return handleResponse<any>(response);
  },

  async acknowledgeAlert(token: string, id: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/alerts/${id}/acknowledge`, token, {
      method: 'PUT',
    });
    return handleResponse<any>(response);
  },

  async resolveAlert(token: string, id: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/alerts/${id}/resolve`, token, {
      method: 'PUT',
    });
    return handleResponse<any>(response);
  },
};

export const predictionService = {
  async getPredictions(token: string): Promise<any[]> {
    const response = await authenticatedFetch(`${API_BASE_URL}/predictions`, token);
    return handleResponse<any[]>(response);
  },

  async getPredictionStats(token: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/predictions/stats`, token);
    return handleResponse<any>(response);
  },
};

export const maintenanceService = {
  async getTasks(token: string, status?: string): Promise<any[]> {
    const url = status 
      ? `${API_BASE_URL}/maintenance?status=${status}`
      : `${API_BASE_URL}/maintenance`;
    const response = await authenticatedFetch(url, token);
    return handleResponse<any[]>(response);
  },

  async createTask(token: string, data: any): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/maintenance`, token, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  async updateTask(token: string, id: string, data: any): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/maintenance/${id}`, token, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },
};

export const analyticsService = {
  async getDashboardStats(token: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/analytics/dashboard`, token);
    return handleResponse<any>(response);
  },

  async getAnalytics(token: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/analytics`, token);
    return handleResponse<any>(response);
  },
};

export const userService = {
  async getUsers(token: string): Promise<any[]> {
    const response = await authenticatedFetch(`${API_BASE_URL}/users`, token);
    return handleResponse<any[]>(response);
  },

  async createOperator(token: string, data: any): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/users/operator`, token, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  async updateUser(token: string, id: string, data: any): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, token, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  async deleteUser(token: string, id: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, token, {
      method: 'DELETE',
    });
    return handleResponse<any>(response);
  },

  async resetPassword(token: string, id: string, newPassword: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}/reset-password`, token, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword }),
    });
    return handleResponse<any>(response);
  },

  async getOperatorNumbers(token: string): Promise<any[]> {
    const response = await authenticatedFetch(`${API_BASE_URL}/users/operators/numbers`, token);
    return handleResponse<any[]>(response);
  },

  async createOperatorNumber(token: string, number: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/users/operators/numbers`, token, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ number }),
    });
    return handleResponse<any>(response);
  },
};

export const systemService = {
  async getSystemHealth(token: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/system/health`, token);
    return handleResponse<any>(response);
  },

  async getSystemLogs(token: string): Promise<any[]> {
    const response = await authenticatedFetch(`${API_BASE_URL}/system/logs`, token);
    return handleResponse<any[]>(response);
  },
};

export const agentService = {
  async getAgents(token: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/agents`, token);
    return handleResponse<any>(response);
  },

  async diagnoseMachine(token: string, machineId: string, autoCreateAlert = true): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/agents/diagnose/${machineId}`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoCreateAlert }),
    });
    return handleResponse<any>(response);
  },

  async forecastMachineRul(token: string, machineId: string, persistPrediction = true): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/agents/predict-rul/${machineId}`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persistPrediction }),
    });
    return handleResponse<any>(response);
  },

  async dispatchMaintenance(token: string, machineId?: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/agents/dispatch-maintenance`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(machineId ? { machineId } : {}),
    });
    return handleResponse<any>(response);
  },

  async getFleetBriefing(token: string): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/agents/fleet-briefing`, token);
    return handleResponse<any>(response);
  },

  async chatWithCopilot(
    token: string,
    message: string,
    previousInteractionId?: string
  ): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/agents/copilot/chat`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, previousInteractionId }),
    });
    return handleResponse<any>(response);
  },
};

