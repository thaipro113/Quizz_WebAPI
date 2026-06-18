import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register({ onRegister }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng nhập lại.');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await onRegister(username, email, password, role);
      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng sang Đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      let errMsg = 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            errMsg = `${keys[0]}: ${data[keys[0]]}`;
          }
        } else {
          errMsg = data;
        }
      }
      setError(errMsg);
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

        <h2>Đăng Ký Tài Khoản</h2>
        <p className="auth-subtitle">Hệ thống trắc nghiệm thông minh</p>
        
        {error && (
          <div className="alert-error">
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        )}
        {success && (
          <div className="alert-success">
            <i className="fa-solid fa-circle-check"></i> {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">
              <i className="fa-regular fa-user"></i> Tên đăng nhập *
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
            <label htmlFor="email">
              <i className="fa-regular fa-envelope"></i> Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email..."
              disabled={submitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <i className="fa-solid fa-lock"></i> Mật khẩu *
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

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <i className="fa-solid fa-lock"></i> Xác nhận mật khẩu *
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu..."
              disabled={submitting}
            />
          </div>

          
          <button type="submit" className="btn-primary" disabled={submitting}>
            <i className="fa-solid fa-user-plus"></i>
            {submitting ? 'Đang tạo tài khoản...' : 'Đăng Ký'}
          </button>
        </form>
        
        <div className="auth-footer">
          Đã có tài khoản?{' '}
          <span className="auth-link" onClick={() => navigate('/login')}>
            Đăng nhập ngay
          </span>
        </div>
      </div>
    </div>
  );
}
