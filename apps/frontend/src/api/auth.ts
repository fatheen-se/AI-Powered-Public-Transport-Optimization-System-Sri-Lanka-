import { apiClient, setTokens } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  refresh: string;
  access: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// Valid demo credentials
const DEMO_CREDENTIALS: Record<string, string> = {
  'admin@srilankatransit.com': 'admin123',
  'driver1@srilankatransit.com': 'driver123',
  'driver2@srilankatransit.com': 'driver123',
  'passenger1@srilankatransit.com': 'passenger123',
};

const deriveRole = (email: string): string => {
  if (email.includes('admin') || email.includes('authority')) return 'Admin';
  if (email.includes('driver')) return 'Driver';
  return 'Passenger';
};

const generateMockResponse = (email: string): AuthResponse => {
  const mockToken = `mock_access_${Date.now()}`;
  const mockRefresh = `mock_refresh_${Date.now()}`;
  return {
    access: mockToken,
    refresh: mockRefresh,
    user: {
      id: `user-${email.split('@')[0]}`,
      email,
      role: deriveRole(email),
    },
  };
};

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // First, try the real backend
    try {
      const response = await apiClient.post<AuthResponse>('/auth/token/', credentials);
      const { access, refresh } = response.data;

      setTokens(access, refresh);

      return {
        access,
        refresh,
        user: {
          id: 'backend-uuid',
          email: credentials.email,
          role: deriveRole(credentials.email),
        },
      };
    } catch (backendError) {
      // Backend is unreachable — fall back to demo auth
      console.warn('Backend unreachable, using demo authentication.');

      const validPassword = DEMO_CREDENTIALS[credentials.email];
      if (!validPassword || validPassword !== credentials.password) {
        throw new Error('Invalid email or password.');
      }

      const mockResponse = generateMockResponse(credentials.email);
      setTokens(mockResponse.access, mockResponse.refresh);
      return mockResponse;
    }
  },
};
