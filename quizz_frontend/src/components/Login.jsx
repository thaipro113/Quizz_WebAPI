import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Top Centered Book Icon Logo */}
        <div className="auth-logo-wrapper">
          <div className="logo-box">
            <i className="fa-solid fa-book"></i>
          </div>
        </div>

        <h2>Đăng Nhập Hệ Thống</h2>
        <p className="auth-subtitle">Hệ thống trắc nghiệm thông minh</p>
        
        {error && (
          <div className="alert-error">
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">
              <i className="fa-regular fa-user"></i> Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên tài khoản..."
              disabled={submitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <i className="fa-solid fa-lock"></i> Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              disabled={submitting}
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={submitting}>
            <i className="fa-solid fa-right-to-bracket"></i>
            {submitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>
        
        <div className="auth-footer">
          Chưa có tài khoản?{' '}
          <span className="auth-link" onClick={() => navigate('/register')}>
            Đăng ký ngay
          </span>
        </div>
      </div>
    </div>
  );
}
