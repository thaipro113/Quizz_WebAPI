import api from './api';

export const quizService = {
  // Lấy danh sách toàn bộ đề thi
  async getQuizzes(filters = {}) {
    let url = '/quizzes/';
    if (typeof filters === 'string') {
      url = filters ? `/quizzes/?title=${filters}` : '/quizzes/';
    } else if (filters && typeof filters === 'object') {
      const params = new URLSearchParams();
      if (filters.title) params.append('title', filters.title);
      if (filters.description) params.append('description', filters.description);
      const queryString = params.toString();
      url = queryString ? `/quizzes/?${queryString}` : '/quizzes/';
    }
    const response = await api.get(url);
    // DRF trả về kết quả phân trang ở trường `results` hoặc mảng trực tiếp tùy theo phân trang
    return response.data.results || response.data;
  },

  // Lấy chi tiết đề thi cụ thể
  async getQuizDetail(quizId) {
    const response = await api.get(`/quizzes/${quizId}/`);
    return response.data;
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
  },

  // Lấy lịch sử làm bài của người dùng hiện tại
  async getResults() {
    const response = await api.get('/results/');
    return response.data.results || response.data;
  },

  // === CÁC API CRUD CHO GIÁO VIÊN / ADMIN ===

  // CRUD Quiz
  async createQuiz(quizData) {
    const response = await api.post('/quizzes/', quizData);
    return response.data;
  },
  async updateQuiz(quizId, quizData) {
    const response = await api.put(`/quizzes/${quizId}/`, quizData);
    return response.data;
  },
  async deleteQuiz(quizId) {
    const response = await api.delete(`/quizzes/${quizId}/`);
    return response.data;
  },

  // CRUD Question
  async createQuestion(quizId, questionData) {
    const response = await api.post(`/quizzes/${quizId}/questions/`, questionData);
    return response.data;
  },
  async updateQuestion(questionId, questionData) {
    const response = await api.put(`/questions/${questionId}/`, questionData);
    return response.data;
  },
  async deleteQuestion(questionId) {
    const response = await api.delete(`/questions/${questionId}/`);
    return response.data;
  },

  // CRUD Answer
  async createAnswer(questionId, answerData) {
    const response = await api.post(`/questions/${questionId}/answers/`, answerData);
    return response.data;
  },
  async updateAnswer(answerId, answerData) {
    const response = await api.put(`/answers/${answerId}/`, answerData);
    return response.data;
  },
  async deleteAnswer(answerId) {
    const response = await api.delete(`/answers/${answerId}/`);
    return response.data;
  }
};


