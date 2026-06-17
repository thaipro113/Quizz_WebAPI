import React, { useState, useEffect } from 'react';
import { quizService } from '../services/quiz';

export default function QuizExam({ quiz, onCancel, onSubmitSuccess }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTimeLimit, setInitialTimeLimit] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const data = await quizService.getQuizQuestions(quiz.id);
        const sortedQuestions = data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setQuestions(sortedQuestions);
        setError('');
        
        const limitInSeconds = (quiz.time_limit || 30) * 60;
        setTimeLeft(limitInSeconds);
        setInitialTimeLimit(limitInSeconds);
      } catch (err) {
        console.error(err);
        setError('Không thể tải câu hỏi của đề thi này.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quiz]);

  useEffect(() => {
    if (loading || error || questions.length === 0) return;
    
    if (timeLeft <= 0) {
      autoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, error, questions]);

  const autoSubmit = async () => {
    alert('Hết giờ làm bài! Hệ thống đang tự động nộp bài của bạn.');
    const formattedAnswers = Object.entries(answers).map(([qId, ansId]) => ({
      question_id: parseInt(qId),
      selected_answer_id: ansId,
    }));
    
    try {
      const result = await quizService.submitQuiz(quiz.id, formattedAnswers, initialTimeLimit);
      onSubmitSuccess(result, questions);
    } catch (err) {
      console.error(err);
      alert('Gặp lỗi khi tự động nộp bài làm.');
    }
  };

  const handleSubmit = async () => {
    const totalQuestionsCount = questions.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestionsCount) {
      alert(`[CẢNH BÁO] Vui lòng hoàn thành tất cả các câu hỏi trước khi nộp bài! \nBạn mới chỉ làm ${answeredCount}/${totalQuestionsCount} câu hỏi.`);
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn nộp bài thi này?')) {
      return;
    }

    const formattedAnswers = Object.entries(answers).map(([qId, ansId]) => ({
      question_id: parseInt(qId),
      selected_answer_id: ansId,
    }));

    const completedTime = initialTimeLimit - timeLeft;

    try {
      setLoading(true);
      const result = await quizService.submitQuiz(quiz.id, formattedAnswers, completedTime);
      onSubmitSuccess(result, questions);
    } catch (err) {
      console.error(err);
      alert('Nộp bài thất bại. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, answerId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && questions.length === 0) {
    return <div className="loading-spinner">Đang chuẩn bị đề thi...</div>;
  }

  if (error) {
    return (
      <div className="loading-spinner" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <div className="alert-error" style={{ maxWidth: '400px' }}>
          <i className="fa-solid fa-triangle-exclamation"></i> {error}
        </div>
        <button onClick={onCancel} className="btn-reset" style={{ padding: '10px 20px' }}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const choicePrefixes = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="exam-container">
      {/* Top Header Section */}
      <div className="exam-header">
        <h2 className="exam-title-header">BÀI THI TRẮC NGHIỆM</h2>
        <h3 className="exam-quiz-title">{quiz.title}</h3>
        <div className="exam-timer">
          <i className="fa-regular fa-clock"></i> Thời gian còn lại:{' '}
          <span className="timer-countdown">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Main Layout Split */}
      <div className="exam-layout">
        {/* Left Column: Sơ đồ câu hỏi */}
        <aside className="exam-sidebar">
          <div className="sidebar-card">
            <h4>Sơ đồ câu hỏi</h4>
            <div className="question-grid">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isActive = idx === currentIndex;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`question-number-btn ${isAnswered ? 'answered' : ''} ${isActive ? 'active' : ''}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={handleSubmit}
              className="btn-submit-exam"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i> Nộp bài
            </button>
          </div>
        </aside>

        {/* Right Column: Chi tiết Câu hỏi hiện tại */}
        <main className="exam-main-content">
          {currentQuestion && (
            <div className="question-card">
              <div className="question-card-title">
                <strong>Câu {currentIndex + 1}:</strong> {currentQuestion.content}
              </div>
              
              <div className="answers-list">
                {currentQuestion.answers && currentQuestion.answers.map((answer, index) => {
                  const prefix = choicePrefixes[index] || '';
                  const isSelected = answers[currentQuestion.id] === answer.id;
                  
                  return (
                    <div
                      key={answer.id}
                      onClick={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                      className={`answer-option-item ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        id={`ans-${answer.id}`}
                        name={`question-${currentQuestion.id}`}
                        checked={isSelected}
                        onChange={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                        className="sr-only"
                      />
                      <label htmlFor={`ans-${answer.id}`} className="answer-option-label">
                        <span className="choice-prefix">{prefix}.</span>
                        <span className="choice-text">{answer.content}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Buttons at Bottom */}
          <div className="exam-navigation">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="btn-nav-prev"
            >
              <i className="fa-solid fa-angle-left"></i> Câu trước
            </button>
            
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="btn-nav-next"
            >
              Câu tiếp theo <i className="fa-solid fa-angle-right"></i>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
