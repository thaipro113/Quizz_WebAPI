import api from './api';

export const quizService = {
  // Lấy danh sách toàn bộ đề thi
  async getQuizzes(searchQuery = '') {
    const url = searchQuery ? `/quizzes/?title=${searchQuery}` : '/quizzes/';
    const response = await api.get(url);
    // DRF trả về kết quả phân trang ở trường `results` hoặc mảng trực tiếp tùy theo phân trang
    return response.data.results || response.data;
  },

  // Lấy danh sách câu hỏi và đáp án của một đề thi cụ thể
  async getQuizQuestions(quizId) {
    const response = await api.get(`/quizzes/${quizId}/questions/`);
    return response.data;
  },

  // Nộp bài làm trắc nghiệm
  async submitQuiz(quizId, answers, completedTime) {
    const response = await api.post(`/quizzes/${quizId}/submit/`, {
      completed_time: completedTime,
      answers: answers, // Mảng định dạng: [{"question_id": X, "selected_answer_id": Y}]
    });
    return response.data;
  },

  // Lấy chi tiết lịch sử bài làm sau khi đã nộp (gồm cả đáp án đúng/sai để review)
  async getResultDetail(resultId) {
    const response = await api.get(`/results/${resultId}/`);
    return response.data;
  },

  // Lấy bảng xếp hạng Top 10 học sinh làm bài thi nhanh nhất và điểm cao nhất
  async getQuizLeaderboard(quizId) {
    const response = await api.get(`/quizzes/${quizId}/leaderboard/`);
    return response.data;
  },

  // Lấy dữ liệu phân tích / thống kê của giáo viên cho đề thi
  async getQuizAnalytics(quizId) {
    const response = await api.get(`/quizzes/${quizId}/analytics/`);
    return response.data;
  }
};
