import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout, darkMode, onToggleTheme }) {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Left Branding matching image */}
        <div className="brand" onClick={() => navigate('/quizzes')} style={{ cursor: 'pointer' }}>
          <div className="logo-box">
            <i className="fa-solid fa-book"></i>
          </div>
          <div className="brand-info">
            <span className="logo-text">TLENGLISH</span>
            <span className="logo-subtitle">Hệ thống trắc nghiệm thông minh</span>
          </div>
        </div>

        {/* Right side controls matching image */}
        <div className="header-controls">
          {/* Light/Dark mode toggler */}
          <button 
            className="btn-theme-toggle" 
            onClick={onToggleTheme} 
            title="Chuyển chế độ sáng/tối"
            aria-label="Toggle theme"
          >
            <i className={darkMode ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
          </button>

          {user ? (
            <>
              {/* Nút Đi tới Trang Quản Trị cho Giáo viên/Admin */}
              {(user.role === 'teacher' || user.role === 'admin') && (
                <button 
                  className="btn-header-primary" 
                  onClick={() => navigate('/admin')} 
                  title="Đi tới Trang Quản Trị"
                  style={{ marginRight: '4px' }}
                >
                  <i className="fa-solid fa-gauge"></i> Quản trị
                </button>
              )}

              {/* Profile Badge matching user tag in image */}
              <div className="user-badge" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} title="Trang cá nhân">
                <i className="fa-regular fa-user"></i>
                <span>{user.username}</span>
              </div>
              
              <button className="btn-header-action" onClick={onLogout}>
                <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
              </button>
            </>
          ) : (
            <div className="user-badge" style={{ fontStyle: 'italic', opacity: 0.8 }}>
              Chưa đăng nhập
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
