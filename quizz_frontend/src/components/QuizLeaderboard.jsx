import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quiz';

export default function QuizLeaderboard() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizAndLeaderboard = async () => {
      setLoading(true);
      try {
        const [quizData, leaderboardData] = await Promise.all([
          quizService.getQuizDetail(quizId),
          quizService.getQuizLeaderboard(quizId)
        ]);
        setQuiz(quizData);
        setLeaderboard(leaderboardData);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Không thể tải bảng xếp hạng cho đề thi này.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAndLeaderboard();
  }, [quizId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return <i className="fa-solid fa-trophy" style={{ color: '#fbbf24', fontSize: '1.25rem' }} title="Vô địch"></i>;
    } else if (rank === 2) {
      return <i className="fa-solid fa-trophy" style={{ color: '#cbd5e1', fontSize: '1.15rem' }} title="Á quân"></i>;
    } else if (rank === 3) {
      return <i className="fa-solid fa-trophy" style={{ color: '#d97706', fontSize: '1.05rem' }} title="Hạng ba"></i>;
    }
    return <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{rank}</span>;
  };

  if (loading && !quiz) {
    return <div className="loading-spinner">Đang tải bảng xếp hạng...</div>;
  }

  if (error) {
    return (
      <div className="loading-spinner" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <div className="alert-error" style={{ maxWidth: '450px' }}>
          <i className="fa-solid fa-triangle-exclamation"></i> {error}
        </div>
        <button onClick={() => navigate('/quizzes')} className="btn-reset" style={{ padding: '10px 20px' }}>
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="quiz-list-container">
      {/* Title Header Section */}
      <div className="exam-header" style={{ marginBottom: '10px' }}>
        <h2 className="exam-title-header" style={{ color: 'var(--warning)', letterSpacing: '1px' }}>
          <i className="fa-solid fa-crown"></i> BẢNG XẾP HẠNG
        </h2>
        <h3 className="exam-quiz-title">{quiz.title}</h3>
      </div>

      <div className="quiz-grid-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ borderBottom: 'none', paddingBottom: '0', margin: '0' }}>Top 10 Lượt Thi Cao Nhất</h3>
          <button onClick={() => navigate('/quizzes')} className="btn-reset" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <i className="fa-solid fa-arrow-left"></i> Quay lại
          </button>
        </div>

        {leaderboard.length === 0 ? (
          <div className="empty-state">Chưa có lượt thi nào cho đề thi này. Hãy là người đầu tiên làm bài!</div>
        ) : (
          <div className="table-responsive">
            <table className="quiz-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>HẠNG</th>
                  <th>NGƯỜI DÙNG</th>
                  <th>ĐIỂM SỐ</th>
                  <th>TỶ LỆ</th>
                  <th>THỜI GIAN LÀM</th>
                  <th>NGÀY THI</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, idx) => {
                  const rank = idx + 1;
                  const pct = item.total_questions > 0 
                    ? Math.round((item.score / item.total_questions) * 100) 
                    : 0;

                  return (
                    <tr key={item.id} style={rank <= 3 ? { backgroundColor: 'rgba(245, 158, 11, 0.03)' } : {}}>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{getRankBadge(rank)}</td>
                      <td style={{ fontWeight: '700', color: 'var(--text-dark)' }}>
                        {item.user_detail?.username || item.user?.username || 'Người dùng ẩn danh'}
                      </td>
                      <td style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary)' }}>
                        {item.score} / {item.total_questions}
                      </td>
                      <td>
                        <span className={`badge-status ${pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger'}`}>
                          {pct}%
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{formatTime(item.completed_time)}</td>
                      <td>{formatDate(item.created_at)}</td>
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
