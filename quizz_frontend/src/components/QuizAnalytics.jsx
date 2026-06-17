import React, { useState, useEffect } from 'react';
import { quizService } from '../services/quiz';

export default function QuizAnalytics({ quiz, onBack }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await quizService.getQuizAnalytics(quiz.id);
        setAnalytics(data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Không thể tải thống kê phân tích cho đề thi này. Chỉ có Giáo viên mới được quyền truy cập.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [quiz]);

  return (
    <div className="quiz-list-container">
      {/* Header Area */}
      <div className="exam-header">
        <h2 className="exam-title-header">
          <i className="fa-solid fa-chart-line"></i> PHÂN TÍCH KẾT QUẢ
        </h2>
        <h3 className="exam-quiz-title">{quiz.title}</h3>
      </div>

      {loading ? (
        <div className="loading-spinner">Đang tải số liệu thống kê...</div>
      ) : error ? (
        <div className="loading-spinner" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div className="alert-error" style={{ maxWidth: '500px' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
          <button onClick={onBack} className="btn-reset" style={{ padding: '10px 20px' }}>
            <i className="fa-solid fa-arrow-left"></i> Quay lại trang chủ
          </button>
        </div>
      ) : analytics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary Cards */}
          <div className="quiz-list-hero">
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">TỔNG LƯỢT LÀM BÀI</div>
                <div className="stat-value">{analytics.total_attempts}</div>
              </div>
              <div className="stat-icon icon-blue">
                <i className="fa-solid fa-users"></i>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">ĐIỂM TRUNG BÌNH</div>
                <div className="stat-value">{analytics.average_score}</div>
              </div>
              <div className="stat-icon icon-green">
                <i className="fa-solid fa-calculator"></i>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">ĐIỂM CAO NHẤT</div>
                <div className="stat-value">{analytics.highest_score}</div>
              </div>
              <div className="stat-icon icon-orange">
                <i className="fa-solid fa-arrow-trend-up"></i>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">ĐIỂM THẤP NHẤT</div>
                <div className="stat-value">{analytics.lowest_score}</div>
              </div>
              <div className="stat-icon icon-red">
                <i className="fa-solid fa-arrow-trend-down"></i>
              </div>
            </div>
          </div>

          {/* Details Section Card */}
          <div className="quiz-grid-section" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ borderBottom: 'none', paddingBottom: '0', margin: '0' }}>Đánh Giá Sơ Bộ</h3>
              <button onClick={onBack} className="btn-reset" style={{ padding: '8px 16px' }}>
                <i className="fa-solid fa-arrow-left"></i> Quay lại
              </button>
            </div>

            {analytics.total_attempts === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Chưa ghi nhận dữ liệu làm bài nào để thống kê phân tích.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-main)' }}>
                <p>
                  Đề thi <strong>{quiz.title}</strong> hiện đã có <strong>{analytics.total_attempts}</strong> học sinh tham gia hoàn thành bài thi.
                </p>
                <p>
                  Điểm trung bình của lớp là <strong>{analytics.average_score}</strong> câu trả lời đúng trên tổng số câu hỏi. Lượt thi tốt nhất đạt được điểm số cao nhất là <strong>{analytics.highest_score}</strong>, trong khi lượt làm bài thấp nhất là <strong>{analytics.lowest_score}</strong>.
                </p>
                <div style={{ padding: '16px', backgroundColor: 'var(--input-bg)', borderRadius: '8px', borderLeft: '4px solid var(--primary)', marginTop: '8px' }}>
                  <h4 style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '6px', fontSize: '0.9rem' }}>
                    <i className="fa-solid fa-circle-info"></i> Gợi ý Sư phạm:
                  </h4>
                  <p style={{ fontSize: '0.85rem' }}>
                    {analytics.average_score >= 8 
                      ? 'Kết quả lớp học rất xuất sắc. Đề thi có độ khó phù hợp hoặc học sinh đã nắm rất chắc kiến thức. Có thể tăng dần độ thách thức ở các bài tiếp theo.'
                      : analytics.average_score >= 5
                      ? 'Học sinh đạt kết quả trung bình khá. Khuyến nghị củng cố lại các câu hỏi có tỷ lệ sai nhiều để nâng cao độ đồng đều.'
                      : 'Điểm số trung bình khá thấp. Cần ôn tập lại kiến thức trọng tâm của chủ đề này và hỗ trợ các bạn học sinh có điểm thi thấp.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
