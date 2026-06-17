import React from 'react';

export default function QuizResult({ result, questions, userAnswers, onBack }) {
  // `result` format: { result_id, score, total_questions, percentage, completed_time }
  // `questions` is the array of all questions
  // `userAnswers` format: { question_id: selected_answer_id }

  const scoreOutOf10 = result.total_questions > 0 
    ? ((result.score / result.total_questions) * 10).toFixed(1)
    : '0.0';

  const choicePrefixes = ['A', 'B', 'C', 'D', 'E', 'F'];

  const checkQuestionCorrect = (q) => {
    const selectedAnsId = userAnswers[q.id];
    if (!selectedAnsId) return false;
    
    const selectedAnswer = q.answers.find(a => a.id === selectedAnsId);
    return selectedAnswer ? selectedAnswer.is_correct === 1 || selectedAnswer.is_correct === true : false;
  };

  return (
    <div className="result-container">
      {/* Top Title */}
      <div className="result-title-section">
        <h2 className="result-main-title">Kết Quả Bài Làm</h2>
      </div>

      {/* Score Box Card */}
      <div className="result-score-card">
        <div className="score-label">Điểm số đạt được</div>
        <div className="score-value">{scoreOutOf10} / 10</div>
        <div className="score-details">
          Số câu trả lời đúng: <strong>{result.score} / {result.total_questions}</strong>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="result-layout">
        {/* Left Column: Sơ đồ câu hỏi and Back button */}
        <aside className="result-sidebar">
          <div className="sidebar-card">
            <h4>Sơ đồ câu hỏi</h4>
            <div className="question-grid">
              {questions.map((q, idx) => {
                const isCorrect = checkQuestionCorrect(q);
                
                return (
                  <div
                    key={q.id}
                    className={`question-number-badge ${isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={onBack}
              className="btn-back-to-course"
            >
              <i className="fa-solid fa-house"></i> Quay lại trang chủ
            </button>
          </div>
        </aside>

        {/* Right Column: Detailed question review cards */}
        <main className="result-main-content">
          <div className="results-list">
            {questions.map((q, idx) => {
              const isCorrect = checkQuestionCorrect(q);
              const selectedAnsId = userAnswers[q.id];

              return (
                <div
                  key={q.id}
                  className={`result-question-card ${isCorrect ? 'border-correct' : 'border-incorrect'}`}
                >
                  <div className="result-question-title">
                    Câu {idx + 1}: {q.content}
                  </div>
                  
                  <div className="result-answers-list">
                    {q.answers && q.answers.map((answer, ansIdx) => {
                      const prefix = choicePrefixes[ansIdx] || '';
                      const isSelected = selectedAnsId === answer.id;
                      const isAnswerCorrect = answer.is_correct === 1 || answer.is_correct === true;

                      let optionClass = '';
                      let suffix = null;

                      if (isAnswerCorrect) {
                        optionClass = 'option-correct';
                        suffix = (
                          <span className="choice-correct-suffix">
                            <i className="fa-solid fa-circle-check"></i> Đáp án đúng
                          </span>
                        );
                      } else if (isSelected && !isAnswerCorrect) {
                        optionClass = 'option-incorrect';
                        suffix = (
                          <span className="choice-incorrect-suffix">
                            <i className="fa-solid fa-circle-xmark"></i> Bạn chọn sai
                          </span>
                        );
                      }

                      return (
                        <div
                          key={answer.id}
                          className={`result-answer-option ${optionClass}`}
                        >
                          <span className="choice-prefix">{prefix}.</span>
                          <span className="choice-text">{answer.content}</span>
                          {suffix}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
