import { useState, useEffect } from 'react';
import { authService } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    // Lắng nghe sự kiện đăng xuất từ Axios Interceptor khi refresh token hết hạn
    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('auth_logout_redirect', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth_logout_redirect', handleLogoutEvent);
    };
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const userInfo = await authService.login(username, password);
      setUser(userInfo);
      return userInfo;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, role) => {
    setLoading(true);
    try {
      return await authService.register(username, email, password, role);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
}
