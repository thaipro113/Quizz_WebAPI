import api from './api';

export const authService = {
  async login(username, password) {
    const response = await api.post('/auth/login/', { username, password });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      // Lưu thông tin người dùng từ response.data.user
      const userData = response.data.user || {};
      const userInfo = {
        username: userData.username || username,
        email: userData.email || '',
        role: userData.role || 'student',
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      return userInfo;
    }
    throw new Error('Đăng nhập thất bại. Không nhận được Token.');
  },

  async register(username, email, password, role = 'student') {
    const response = await api.post('/auth/register/', {
      username,
      email,
      password,
      role,
    });
    return response.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (err) {
        console.error('Lỗi khi gọi API đăng xuất ở backend:', err);
      }
    }
    // Xóa bộ nhớ local dù API thành công hay thất bại
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  async getCurrentUserProfile() {
    const response = await api.get('/users/me/');
    return response.data;
  },

  async getUsersList(params = {}) {
    const response = await api.get('/users/', { params });
    return response.data;
  },

  async createUser(userData) {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  async updateUser(userId, userData) {
    const response = await api.put(`/users/${userId}/`, userData);
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/users/${userId}/`);
    return response.data;
  }
};
