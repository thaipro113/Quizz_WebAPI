import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await authService.getCurrentUserProfile();
        setProfile(data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Không thể tải thông tin trang cá nhân. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa rõ';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return <div className="loading-spinner">Đang tải thông tin cá nhân...</div>;
  }

  return (
    <div className="auth-container" style={{ minHeight: 'auto', padding: '40px 16px' }}>
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        {/* Top Avatar Circle */}
        <div className="auth-logo-wrapper" style={{ marginBottom: '20px' }}>
          <div className="logo-box" style={{ borderRadius: '50%', width: '64px', height: '64px', fontSize: '1.8rem' }}>
            <i className="fa-regular fa-user"></i>
          </div>
        </div>

        <h2>Trang Cá Nhân</h2>
        <p className="auth-subtitle">Thông tin tài khoản đăng ký trên hệ thống</p>

        {error ? (
          <div className="alert-error">
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        ) : profile && (
          <div className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <label><i className="fa-regular fa-user"></i> Tên tài khoản</label>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-dark)', marginTop: '4px' }}>
                {profile.username}
              </div>
            </div>

            <div className="form-group" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <label><i className="fa-regular fa-envelope"></i> Địa chỉ email</label>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-dark)', marginTop: '4px' }}>
                {profile.email || 'Chưa thiết lập'}
              </div>
            </div>

            <div className="form-group" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <label><i className="fa-solid fa-id-card"></i> Vai trò tài khoản</label>
              <div style={{ marginTop: '4px' }}>
                <span className="badge-status success" style={{ textTransform: 'capitalize' }}>
                  {profile.role === 'teacher' ? 'Giáo viên' : profile.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </span>
              </div>
            </div>

            <div className="form-group" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <label><i className="fa-regular fa-calendar"></i> Ngày tham gia</label>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '4px' }}>
                {formatDate(profile.created_at)}
              </div>
            </div>

            <div className="form-group" style={{ paddingBottom: '12px' }}>
              <label><i className="fa-solid fa-circle-check"></i> Trạng thái</label>
              <div style={{ marginTop: '4px' }}>
                {profile.is_active ? (
                  <span className="badge-status success">
                    <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem', marginRight: '5px' }}></i> Đang hoạt động
                  </span>
                ) : (
                  <span className="badge-status danger">
                    <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem', marginRight: '5px' }}></i> Tạm khóa
                  </span>
                )}
              </div>
            </div>

            <button type="button" className="btn-primary" onClick={() => navigate('/quizzes')} style={{ marginTop: '16px' }}>
              <i className="fa-solid fa-arrow-left"></i> Quay lại trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
