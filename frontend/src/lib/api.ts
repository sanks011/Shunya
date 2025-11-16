const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ApiSettings {
  provider: string;
  model: string;
  apiKey: string;
}

export interface SaveSettingsResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    apiSettings: {
      provider: string;
      model: string;
    };
  };
}

export interface GetSettingsResponse {
  success: boolean;
  data: {
    userId: string;
    apiSettings: ApiSettings;
  };
}

// Generate or get a unique user ID (can be replaced with Firebase auth UID later)
export const getUserId = (): string => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
};

export const saveApiSettings = async (apiSettings: ApiSettings): Promise<SaveSettingsResponse> => {
  const userId = getUserId();
  
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, apiSettings }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save settings');
  }

  return response.json();
};

export const getApiSettings = async (): Promise<ApiSettings | null> => {
  const userId = getUserId();

  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/${userId}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    const data: GetSettingsResponse = await response.json();
    return data.data.apiSettings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};
