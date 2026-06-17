import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../services/quiz';
import { authService } from '../services/auth';

export default function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDesc, setSearchDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // States dành riêng cho Quản lý của Giáo viên / Admin
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' | 'users'
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const fetchQuizzes = async (query = '') => {
    setLoading(true);
    try {
      const data = await quizService.getQuizzes(query);
      setQuizzes(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách đề thi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await authService.getUsersList();
      setUsers(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchQuizzes();
    
    // Nếu là Giáo viên hoặc Admin thì tải danh sách người dùng để quản lý
    if (user && (user.role === 'teacher' || user.role === 'admin')) {
      fetchUsers();
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuizzes(searchQuery);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchDesc('');
    fetchQuizzes('');
  };

  const isTeacherOrAdmin = currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin');

  // Lọc đề thi
  const filteredQuizzes = quizzes.filter(quiz => {
    if (!searchDesc) return true;
    return (quiz.description || '').toLowerCase().includes(searchDesc.toLowerCase());
  });

  // Lọc người dùng
  const filteredUsers = users.filter(user => {
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (user.username || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="quiz-list-container">
      {/* 1. Header Section: Thống kê dành cho Giáo viên, hoặc Lời chào chào đón cho Học sinh */}
      {isTeacherOrAdmin ? (
        <div className="quiz-list-hero">
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">TỔNG ĐỀ THI</div>
              <div className="stat-value">{quizzes.length}</div>
            </div>
            <div className="stat-icon icon-blue">
              <i className="fa-solid fa-book"></i>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">ĐÃ HOÀN THÀNH</div>
              <div className="stat-value">12</div>
            </div>
            <div className="stat-icon icon-green">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">ĐIỂM TRUNG BÌNH</div>
              <div className="stat-value">8.5</div>
            </div>
            <div className="stat-icon icon-orange">
              <i className="fa-solid fa-star"></i>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">HẾT HẠN</div>
              <div className="stat-value">0</div>
            </div>
            <div className="stat-icon icon-red">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
        </div>
      ) : (
        <div className="quiz-list-hero" style={{ display: 'block' }}>
          <div className="stat-card" style={{ padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center' }}>
            <div className="stat-icon icon-blue" style={{ width: '48px', height: '48px', fontSize: '1.4rem', flexShrink: 0 }}>
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                Chào mừng bạn quay trở lại, {currentUser?.username || 'Học sinh'}!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Lựa chọn một đề thi tiếng Anh trong danh mục dưới đây để bắt đầu kiểm tra và cải thiện trình độ của bạn ngay hôm nay.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Menu Điều hướng Quản lý dành riêng cho Giáo viên / Admin */}
      {isTeacherOrAdmin && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button 
            type="button"
            className={activeTab === 'quizzes' ? 'btn-header-primary' : 'btn-header-action'}
            onClick={() => setActiveTab('quizzes')}
            style={{ borderRadius: '8px', padding: '10px 18px' }}
          >
            <i className="fa-solid fa-book"></i> Danh Sách Đề Thi
          </button>
          <button 
            type="button"
            className={activeTab === 'users' ? 'btn-header-primary' : 'btn-header-action'}
            onClick={() => setActiveTab('users')}
            style={{ borderRadius: '8px', padding: '10px 18px' }}
          >
            <i className="fa-solid fa-users"></i> Danh Sách Người Dùng
          </button>
        </div>
      )}

      {/* 3. Render View Động theo Tab */}
      {activeTab === 'quizzes' ? (
        <>
          {/* Search Bar cho Đề thi */}
          <form onSubmit={handleSearchSubmit} className="search-bar-form">
            <div className="search-input-group">
              <div className="search-field">
                <label htmlFor="search-title">Tiêu đề đề thi</label>
                <input
                  id="search-title"
                  type="text"
                  placeholder="Tìm theo tiêu đề..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="search-field">
                <label htmlFor="search-desc">Mô tả chi tiết</label>
                <input
                  id="search-desc"
                  type="text"
                  placeholder="Tìm theo mô tả..."
                  value={searchDesc}
                  onChange={(e) => setSearchDesc(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="btn-search">
                <i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm
              </button>
              <button type="button" onClick={handleReset} className="btn-reset">
                <i className="fa-solid fa-rotate-left"></i> Làm mới
              </button>
            </div>
          </form>

          {/* Bảng danh sách đề thi */}
          <div className="quiz-grid-section">
            <h3>{isTeacherOrAdmin ? 'Quản Lý Đề Thi Trắc Nghiệm' : 'Danh Sách Đề Thi Trắc Nghiệm'}</h3>
            
            {loading ? (
              <div className="loading-spinner">Đang tải danh sách đề thi...</div>
            ) : error ? (
              <div className="alert-error">
                <i className="fa-solid fa-triangle-exclamation"></i> {error}
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="empty-state">Không tìm thấy đề thi nào khớp với từ khóa tìm kiếm.</div>
            ) : (
              <div className="table-responsive">
                <table className="quiz-table">
                  <thead>
                    <tr>
                      <th>TÊN ĐỀ THI</th>
                      <th>MÔ TẢ CHI TIẾT</th>
                      <th>THỜI GIAN LÀM BÀI</th>
                      <th>SỐ CÂU HỎI</th>
                      <th>TRẠNG THÁI</th>
                      <th>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuizzes.map((quiz) => (
                      <tr key={quiz.id}>
                        <td style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{quiz.title}</td>
                        <td>{quiz.description || 'Không có mô tả cho đề thi này.'}</td>
                        <td>{quiz.time_limit} phút</td>
                        <td style={{ fontWeight: '600' }}>10 câu</td>
                        <td>
                          <span className="badge-status success">
                            <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem', marginRight: '5px' }}></i> Sẵn sàng
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            {/* Nút Làm bài chỉ hiển thị cho Học sinh */}
                            {!isTeacherOrAdmin ? (
                              <button
                                onClick={() => navigate(`/quizzes/${quiz.id}/exam`)}
                                className="btn-start-table"
                                title="Làm bài thi"
                              >
                                <i className="fa-solid fa-play"></i> Làm bài
                              </button>
                            ) : (
                              /* Nút xem Bảng xếp hạng và Thống kê chỉ hiển thị cho Giáo viên / Admin */
                              <>
                                <button
                                  onClick={() => navigate(`/quizzes/${quiz.id}/leaderboard`)}
                                  className="btn-action"
                                  title="Bảng xếp hạng"
                                  style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}
                                >
                                  <i className="fa-solid fa-trophy"></i>
                                </button>
                                <button
                                  onClick={() => navigate(`/quizzes/${quiz.id}/analytics`)}
                                  className="btn-action"
                                  title="Thống kê phân tích"
                                  style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                                >
                                  <i className="fa-solid fa-chart-pie"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* View dành cho Quản lý Người dùng */
        <>
          {/* Ô tìm kiếm tài khoản người dùng */}
          <form onSubmit={(e) => e.preventDefault()} className="search-bar-form">
            <div className="search-input-group" style={{ gridTemplateColumns: '1fr auto', alignItems: 'end' }}>
              <div className="search-field">
                <label htmlFor="search-user">Tìm kiếm người dùng</label>
                <input
                  id="search-user"
                  type="text"
                  placeholder="Tìm theo tên đăng nhập hoặc email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <button 
                type="button" 
                onClick={() => setUserSearchQuery('')} 
                className="btn-reset" 
                style={{ height: '38px', padding: '0 16px' }}
              >
                <i className="fa-solid fa-rotate-left"></i> Làm mới
              </button>
            </div>
          </form>

          {/* Bảng danh sách người dùng */}
          <div className="quiz-grid-section">
            <h3>Danh Sách Tài Khoản Người Dùng</h3>
            {loadingUsers ? (
              <div className="loading-spinner">Đang tải danh sách tài khoản...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">Không tìm thấy tài khoản người dùng nào khớp với bộ lọc.</div>
            ) : (
              <div className="table-responsive">
                <table className="quiz-table">
                  <thead>
                    <tr>
                      <th>TÊN ĐĂNG NHẬP</th>
                      <th>ĐỊA CHỈ EMAIL</th>
                      <th>VAI TRÒ</th>
                      <th>NGÀY TẠO TÀI KHOẢN</th>
                      <th>TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{u.username}</td>
                        <td>{u.email || 'Chưa thiết lập'}</td>
                        <td>
                          <span className={`badge-status ${u.role === 'teacher' ? 'warning' : 'success'}`} style={{ textTransform: 'capitalize' }}>
                            {u.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                          </span>
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                        <td>
                          {u.is_active ? (
                            <span className="badge-status success">
                              <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem', marginRight: '5px' }}></i> Đang hoạt động
                            </span>
                          ) : (
                            <span className="badge-status danger">
                              <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem', marginRight: '5px' }}></i> Tạm khóa
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
