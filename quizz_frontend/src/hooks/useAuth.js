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
    const userInfo = await authService.login(username, password);
    setUser(userInfo);
    return userInfo;
  };

  const register = async (username, email, password, role) => {
    return await authService.register(username, email, password, role);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
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
