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

  const formatValidationError = (errorObj) => {
    if (!errorObj) return 'Đăng ký thất bại. Vui lòng kiểm tra lại.';
    if (typeof errorObj === 'string') return errorObj;
    if (typeof errorObj === 'object') {
      if (errorObj.detail) return errorObj.detail;
      const keys = Object.keys(errorObj);
      if (keys.length > 0) {
        const firstKey = keys[0];
        let fieldName = firstKey;
        if (firstKey === 'username') fieldName = 'Tên tài khoản';
        else if (firstKey === 'email') fieldName = 'Email';
        else if (firstKey === 'password') fieldName = 'Mật khẩu';
        
        const errors = errorObj[firstKey];
        let errorMsg = Array.isArray(errors) ? errors[0] : errors;
        
        if (typeof errorMsg === 'string') {
          if (errorMsg.includes('Enter a valid email address') || errorMsg.includes('email không hợp lệ')) {
            errorMsg = 'Địa chỉ email không đúng định dạng.';
          } else if (errorMsg.includes('This field may not be blank')) {
            errorMsg = 'Trường này không được để trống.';
          }
        }
        return `${fieldName}: ${errorMsg}`;
      }
    }
    return 'Đăng ký thất bại. Vui lòng kiểm tra lại.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
      return;
    }
    
    // Kiểm tra tên đăng nhập (độ dài và định dạng)
    if (username.length < 3) {
      setError('Tên đăng nhập phải chứa ít nhất 3 ký tự.');
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9_@.+-]+$/;
    if (!usernameRegex.test(username)) {
      setError('Tên đăng nhập không hợp lệ. Chỉ chấp nhận chữ cái, số và các ký tự: _, @, ., +, -');
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Địa chỉ email không đúng định dạng.');
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
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
        errMsg = formatValidationError(err.response.data);
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
