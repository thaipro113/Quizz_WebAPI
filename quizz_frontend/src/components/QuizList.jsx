import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../services/quiz';
import { authService } from '../services/auth';

export default function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDesc, setSearchDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      // Gọi song song danh sách đề thi và lịch sử làm bài
      const [quizzesData, resultsData] = await Promise.all([
        quizService.getQuizzes(filters),
        quizService.getResults()
      ]);
      setQuizzes(quizzesData);
      setResults(resultsData);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu từ hệ thống. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchData({});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData({ title: searchQuery, description: searchDesc });
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchDesc('');
    fetchData({});
  };

  // Kết quả đã được backend lọc chính xác (bao gồm phân trang)
  const filteredQuizzes = quizzes;

  const isTeacherOrAdmin = currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin');

  // Tính toán thống kê học tập
  const totalAttempts = results.length;
  const averageScore = totalAttempts > 0 
    ? (results.reduce((acc, curr) => acc + (curr.score / curr.total_questions) * 10, 0) / totalAttempts).toFixed(1)
    : '0.0';
  const highestScore = totalAttempts > 0 
    ? Math.max(...results.map(r => (r.score / r.total_questions) * 10)).toFixed(1)
    : '0.0';

  // Map quiz ID sang quiz title để hiển thị trong lịch sử làm bài
  const quizMap = quizzes.reduce((acc, q) => {
    acc[q.id] = q.title;
    return acc;
  }, {});

  const formatCompletedTime = (seconds) => {
    if (!seconds) return '0 giây';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} phút ${secs} giây`;
    }
    return `${secs} giây`;
  };

  // Danh sách các gradient cover cho card để giao diện phong phú
  const cardGradients = [
    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue
    'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Green
    'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple
    'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', // Orange
    'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Pink
    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', // Cyan
  ];

  return (
    <div className="quiz-list-container">
      {/* Thông báo cho Giáo viên/Admin truy cập vào đây */}
      {isTeacherOrAdmin && (
        <div className="alert-success" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%', padding: '16px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-circle-info" style={{ fontSize: '1.2rem' }}></i>
            <span>Bạn đang đăng nhập với quyền <strong>{currentUser.role === 'admin' ? 'Admin' : 'Giáo viên'}</strong>. Bạn có quyền truy cập trang quản lý.</span>
          </div>
          <button 
            onClick={() => navigate('/admin')} 
            className="btn-header-primary" 
            style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <i className="fa-solid fa-gauge"></i> Đi tới Trang Quản Trị
          </button>
        </div>
      )}

      {/* 1. Banner chào mừng học tập */}
      <div className="student-hero-banner">
        <h2>Chào mừng quay trở lại, {currentUser?.username || 'Người dùng'}!</h2>
        <p>Lựa chọn một đề thi tiếng Anh trong danh mục dưới đây để bắt đầu kiểm tra và nâng cao năng lực ngôn ngữ của bạn ngay hôm nay. Chúc bạn đạt kết quả thật cao!</p>
      </div>

      {/* 2. Thống kê học tập cá nhân */}
      <div className="student-stats-container">
        <div className="student-stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalAttempts}</span>
            <span className="stat-label">LƯỢT LÀM BÀI</span>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <i className="fa-solid fa-star"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{averageScore} <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>/ 10</span></span>
            <span className="stat-label">ĐIỂM TRUNG BÌNH</span>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <i className="fa-solid fa-trophy"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{highestScore} <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>/ 10</span></span>
            <span className="stat-label">ĐIỂM CAO NHẤT</span>
          </div>
        </div>
      </div>

      {/* 3. Bộ lọc tìm kiếm đề thi */}
      <form onSubmit={handleSearchSubmit} className="search-bar-form">
        <div className="search-input-group">
          <div className="search-field">
            <label htmlFor="search-title">Tiêu đề đề thi</label>
            <input
              id="search-title"
              type="text"
              placeholder="Tìm theo tiêu đề đề thi..."
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
              placeholder="Tìm theo mô tả chi tiết..."
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

      {/* 4. Danh sách đề thi dạng Thẻ lưới (Grid Cards) */}
      <div style={{ marginTop: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '16px' }}>
          Danh Sách Đề Thi Trắc Nghiệm Tiếng Anh
        </h3>

        {loading ? (
          <div className="loading-spinner">Đang tải danh sách đề thi...</div>
        ) : error ? (
          <div className="alert-error">
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="empty-state">Không tìm thấy đề thi nào khớp với từ khóa tìm kiếm.</div>
        ) : (
          <div className="quiz-grid">
            {filteredQuizzes.map((quiz, idx) => {
              const gradient = cardGradients[idx % cardGradients.length];
              const qCount = quiz.questions ? quiz.questions.length : 0;
              return (
                <div key={quiz.id} className="quiz-card">
                  {/* Card Header Cover */}
                  <div className="quiz-card-cover" style={{ '--card-gradient': gradient }}>
                    <i className="fa-solid fa-graduation-cap"></i>
                    <span className="quiz-badge-time">
                      ⏱️ {quiz.time_limit} phút
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div className="quiz-card-content">
                    <h4 className="quiz-card-title">{quiz.title}</h4>
                    <p className="quiz-card-desc">
                      {quiz.description || 'Không có mô tả chi tiết cho đề thi này. Hãy thử sức để củng cố kiến thức của bạn.'}
                    </p>

                    <div className="quiz-card-meta">
                      <span>
                        <i className="fa-solid fa-circle-question" style={{ color: 'var(--primary)' }}></i>
                        <strong>{qCount} câu hỏi</strong>
                      </span>
                      <span>
                        <i className="fa-solid fa-user-pen"></i>
                        {quiz.created_by_detail?.username || 'Hệ thống'}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="quiz-card-footer">
                    <button
                      onClick={() => navigate(`/quizzes/${quiz.id}/exam`)}
                      className="btn-start-quiz"
                    >
                      <i className="fa-solid fa-play"></i> Bắt đầu làm bài
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Lịch sử làm bài thi gần đây */}
      <div className="history-section">
        <h3>
          <i className="fa-solid fa-clock-rotate-left"></i> Lịch Sử Làm Bài Gần Đây
        </h3>

        {loading ? (
          <div className="loading-spinner">Đang tải lịch sử học tập...</div>
        ) : results.length === 0 ? (
          <div className="empty-state" style={{ padding: '16px' }}>Bạn chưa thực hiện bài kiểm tra nào. Hãy làm thử một bài thi bên trên nhé!</div>
        ) : (
          <div className="table-responsive">
            <table className="quiz-table">
              <thead>
                <tr>
                  <th>ĐỀ THI ĐÃ LÀM</th>
                  <th>ĐIỂM SỐ</th>
                  <th>THỜI GIAN HOÀN THÀNH</th>
                  <th>THỜI GIAN NỘP BÀI</th>
                  <th>CHI TIẾT</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 8).map((result) => {
                  const scoreOutOf10 = result.total_questions > 0 
                    ? ((result.score / result.total_questions) * 10).toFixed(1)
                    : '0.0';
                  return (
                    <tr key={result.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-dark)' }}>
                        {quizMap[result.quiz] || `Đề thi #${result.quiz}`}
                      </td>
                      <td style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.95rem' }}>
                        {scoreOutOf10} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>/ 10</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          ({result.score}/{result.total_questions} câu)
                        </span>
                      </td>
                      <td>{formatCompletedTime(result.completed_time)}</td>
                      <td>{new Date(result.created_at).toLocaleString('vi-VN')}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/results/${result.id}`)}
                          className="btn-view-detail"
                        >
                          <i className="fa-solid fa-eye"></i> Xem lại
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
