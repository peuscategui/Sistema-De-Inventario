import { useAuth } from '@/contexts/AuthContext';

export function useAuthenticatedFetch() {
  const { logout } = useAuth();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      logout();
      throw new Error('No authentication token found');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Si el token expiró, hacer logout
    if (response.status === 401) {
      logout();
      throw new Error('Session expired');
    }

    return response;
  };

  return { authenticatedFetch };
} 