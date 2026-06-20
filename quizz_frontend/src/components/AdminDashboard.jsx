import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../services/quiz';
import { authService } from '../services/auth';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Search & Navigation States
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' | 'users'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDesc, setSearchDesc] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Pagination states
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [quizzesPage, setQuizzesPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const PAGE_SIZE = 10;

  // Active Quiz for Question/Answer management
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // --- Modal States for CRUD ---
  // 1. Quiz Modal
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null); // null if creating, else quiz object
  const [quizForm, setQuizForm] = useState({ title: '', description: '', time_limit: 30 });

  // 2. Question Modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // null if creating, else question object
  const [questionForm, setQuestionForm] = useState({ content: '', order: 1 });

  // 3. Answer Modal
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [activeQuestionForAnswer, setActiveQuestionForAnswer] = useState(null); // parent question
  const [editingAnswer, setEditingAnswer] = useState(null); // null if creating, else answer object
  const [answerForm, setAnswerForm] = useState({ content: '', is_correct: false });

  // 4. User Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null if creating, else user object
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'student', is_active: true });

  const [modalError, setModalError] = useState('');

  // 5. Confirm Modal
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: 'Xác nhận',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  const triggerConfirm = (message, onConfirm, title = 'Xác nhận hành động', type = 'danger') => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  const formatValidationError = (errorObj) => {
    if (!errorObj) return 'Thao tác thất bại. Vui lòng kiểm tra lại.';
    if (typeof errorObj === 'string') return errorObj;
    if (typeof errorObj === 'object') {
      if (errorObj.detail) return errorObj.detail;
      const keys = Object.keys(errorObj);
      if (keys.length > 0) {
        const firstKey = keys[0];
        let fieldName = firstKey;
        if (firstKey === 'username') fieldName = 'Tên tài khoản';
        else if (firstKey === 'email') fieldName = 'Email';
        else if (firstKey === 'password') fieldName = 'Mật khẩu';
        else if (firstKey === 'title') fieldName = 'Tiêu đề';
        else if (firstKey === 'content') fieldName = 'Nội dung';
        else if (firstKey === 'time_limit') fieldName = 'Thời gian làm bài';
        
        const errors = errorObj[firstKey];
        let errorMsg = Array.isArray(errors) ? errors[0] : errors;
        
        if (typeof errorMsg === 'string') {
          if (errorMsg.includes('Enter a valid email address') || errorMsg.includes('email không hợp lệ')) {
            errorMsg = 'Địa chỉ email không đúng định dạng.';
          } else if (errorMsg.includes('This field may not be blank')) {
            errorMsg = 'Trường này không được để trống.';
          }
        }
        return `${fieldName}: ${errorMsg}`;
      }
    }
    return 'Thao tác thất bại. Vui lòng kiểm tra lại.';
  };

  const fetchQuizzes = async (page = 1, query = searchQuery) => {
    setLoading(true);
    try {
      const data = await quizService.getQuizzes({
        title: query,
        page
      });
      if (data && data.results) {
        setQuizzes(data.results);
        setTotalQuizzes(data.count || 0);
      } else {
        setQuizzes(Array.isArray(data) ? data : []);
        setTotalQuizzes(Array.isArray(data) ? data.length : 0);
      }
      setQuizzesPage(page);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách đề thi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1, query = userSearchQuery) => {
    setLoadingUsers(true);
    try {
      const data = await authService.getUsersList({
        page,
        search: query
      });
      if (data && data.results) {
        setUsers(data.results);
        setTotalUsers(data.count || 0);
      } else {
        setUsers(Array.isArray(data) ? data : []);
        setTotalUsers(Array.isArray(data) ? data.length : 0);
      }
      setUsersPage(page);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // Kiểm tra quyền hạn Giáo viên / Admin
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      navigate('/quizzes', { replace: true });
      return;
    }

    fetchQuizzes(1);
    if (user.role === 'admin') {
      fetchUsers(1);
    }
  }, [navigate]);

  // Load questions for selected quiz
  const fetchQuestionsForQuiz = async (quizId) => {
    setLoadingQuestions(true);
    try {
      const data = await quizService.getQuizQuestions(quizId);
      // Sắp xếp thứ tự order tăng dần
      setQuestions(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err) {
      console.error("Lỗi khi tải câu hỏi:", err);
      alert('Không thể tải danh sách câu hỏi của đề thi.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (selectedQuizForQuestions) {
      fetchQuestionsForQuiz(selectedQuizForQuestions.id);
    }
  }, [selectedQuizForQuestions]);

  const handleQuizPageChange = async (newPage) => {
    await fetchQuizzes(newPage);
  };

  const handleUsersPageChange = async (newPage) => {
    await fetchUsers(newPage);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuizzes(1, searchQuery);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchDesc('');
    fetchQuizzes(1, '');
  };

  const handleUserSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1, userSearchQuery);
  };

  const handleUserReset = () => {
    setUserSearchQuery('');
    fetchUsers(1, '');
  };

  // --- CRUD QUIZ ACTIONS ---
  const openQuizModal = (quiz = null) => {
    setModalError('');
    if (quiz) {
      setEditingQuiz(quiz);
      setQuizForm({
        title: quiz.title || '',
        description: quiz.description || '',
        time_limit: quiz.time_limit || 30
      });
    } else {
      setEditingQuiz(null);
      setQuizForm({ title: '', description: '', time_limit: 30 });
    }
    setShowQuizModal(true);
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!quizForm.title) {
      setModalError('Vui lòng nhập tên đề thi.');
      return;
    }
    try {
      const payload = {
        title: quizForm.title,
        description: quizForm.description,
        time_limit: parseInt(quizForm.time_limit) || 30,
        is_active: true
      };

      if (editingQuiz) {
        await quizService.updateQuiz(editingQuiz.id, payload);
        alert('Cập nhật đề thi thành công!');
      } else {
        await quizService.createQuiz(payload);
        alert('Tạo đề thi mới thành công!');
      }
      setShowQuizModal(false);
      fetchQuizzes(searchQuery);
    } catch (err) {
      console.error(err);
      setModalError(formatValidationError(err.response?.data));
    }
  };

  const handleDeleteQuiz = (quizId, quizTitle) => {
    triggerConfirm(
      `Bạn có chắc chắn muốn xóa đề thi "${quizTitle}"?\nHành động này cũng sẽ xóa tất cả câu hỏi và đáp án liên quan.`,
      async () => {
        try {
          await quizService.deleteQuiz(quizId);
          alert('Xóa đề thi thành công!');
          fetchQuizzes(searchQuery);
        } catch (err) {
          console.error(err);
          alert('Xóa đề thi thất bại. Vui lòng thử lại.');
        }
      },
      'Xóa Đề Thi',
      'danger'
    );
  };

  // --- CRUD QUESTION ACTIONS ---
  const openQuestionModal = (question = null) => {
    setModalError('');
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        content: question.content || '',
        order: question.order || 1
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        content: '',
        order: questions.length > 0 ? Math.max(...questions.map(q => q.order || 1)) + 1 : 1
      });
    }
    setShowQuestionModal(true);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!questionForm.content) {
      setModalError('Vui lòng nhập nội dung câu hỏi.');
      return;
    }
    try {
      const payload = {
        content: questionForm.content,
        order: parseInt(questionForm.order) || 1
      };

      if (editingQuestion) {
        await quizService.updateQuestion(editingQuestion.id, payload);
        alert('Cập nhật câu hỏi thành công!');
      } else {
        await quizService.createQuestion(selectedQuizForQuestions.id, payload);
        alert('Tạo câu hỏi mới thành công!');
      }
      setShowQuestionModal(false);
      fetchQuestionsForQuiz(selectedQuizForQuestions.id);
    } catch (err) {
      console.error(err);
      setModalError(formatValidationError(err.response?.data));
    }
  };

  const handleDeleteQuestion = (questionId) => {
    triggerConfirm(
      'Bạn có chắc chắn muốn xóa câu hỏi này cùng các đáp án lựa chọn tương ứng?',
      async () => {
        try {
          await quizService.deleteQuestion(questionId);
          alert('Xóa câu hỏi thành công!');
          fetchQuestionsForQuiz(selectedQuizForQuestions.id);
        } catch (err) {
          console.error(err);
          alert('Xóa câu hỏi thất bại.');
        }
      },
      'Xóa Câu Hỏi',
      'danger'
    );
  };

  // --- CRUD ANSWER ACTIONS ---
  const openAnswerModal = (question, answer = null) => {
    setModalError('');
    setActiveQuestionForAnswer(question);
    if (answer) {
      setEditingAnswer(answer);
      setAnswerForm({
        content: answer.content || '',
        is_correct: answer.is_correct === 1 || answer.is_correct === true
      });
    } else {
      setEditingAnswer(null);
      setAnswerForm({ content: '', is_correct: false });
    }
    setShowAnswerModal(true);
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerForm.content) {
      setModalError('Vui lòng nhập nội dung đáp án.');
      return;
    }
    try {
      const payload = {
        content: answerForm.content,
        is_correct: answerForm.is_correct ? 1 : 0
      };

      if (editingAnswer) {
        await quizService.updateAnswer(editingAnswer.id, payload);
        alert('Cập nhật đáp án thành công!');
      } else {
        await quizService.createAnswer(activeQuestionForAnswer.id, payload);
        alert('Tạo đáp án mới thành công!');
      }
      setShowAnswerModal(false);
      fetchQuestionsForQuiz(selectedQuizForQuestions.id);
    } catch (err) {
      console.error(err);
      setModalError(formatValidationError(err.response?.data));
    }
  };

  const handleDeleteAnswer = (answerId) => {
    triggerConfirm(
      'Bạn có chắc chắn muốn xóa đáp án lựa chọn này?',
      async () => {
        try {
          await quizService.deleteAnswer(answerId);
          alert('Xóa đáp án thành công!');
          fetchQuestionsForQuiz(selectedQuizForQuestions.id);
        } catch (err) {
          console.error(err);
          alert('Xóa đáp án thất bại.');
        }
      },
      'Xóa Đáp Án',
      'danger'
    );
  };

  // --- CRUD USER ACTIONS ---
  const openUserModal = (user = null) => {
    setModalError('');
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username || '',
        email: user.email || '',
        password: '',
        role: user.role || 'student',
        is_active: user.is_active !== false
      });
    } else {
      setEditingUser(null);
      setUserForm({ username: '', email: '', password: '', role: 'student', is_active: true });
    }
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.username || !userForm.email) {
      setModalError('Vui lòng nhập tên tài khoản và email.');
      return;
    }

    // Kiểm tra định dạng tên đăng nhập
    if (userForm.username.length < 3) {
      setModalError('Tên đăng nhập phải chứa ít nhất 3 ký tự.');
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9_@.+-]+$/;
    if (!usernameRegex.test(userForm.username)) {
      setModalError('Tên đăng nhập không hợp lệ. Chỉ chấp nhận chữ cái, số và các ký tự: _, @, ., +, -');
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      setModalError('Địa chỉ email không đúng định dạng.');
      return;
    }

    // Kiểm tra độ dài mật khẩu khi tạo mới hoặc khi nhập mật khẩu mới để đổi
    if (!editingUser || userForm.password) {
      if (userForm.password.length < 6) {
        setModalError('Mật khẩu phải chứa ít nhất 6 ký tự.');
        return;
      }
    }

    try {
      const payload = {
        username: userForm.username,
        email: userForm.email,
        role: userForm.role,
        is_active: userForm.is_active
      };
      if (userForm.password) {
        payload.password = userForm.password;
      }

      if (editingUser) {
        await authService.updateUser(editingUser.id, payload);
        alert('Cập nhật người dùng thành công!');
      } else {
        await authService.createUser(payload);
        alert('Thêm người dùng mới thành công!');
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setModalError(formatValidationError(err.response?.data));
    }
  };

  const handleDeleteUser = (userId, username) => {
    if (currentUser && currentUser.id === userId) {
      alert('Bạn không thể tự xóa tài khoản của chính mình.');
      return;
    }
    triggerConfirm(
      `Bạn có chắc chắn muốn xóa tài khoản "${username}"?`,
      async () => {
        try {
          await authService.deleteUser(userId);
          alert('Xóa tài khoản thành công!');
          fetchUsers();
        } catch (err) {
          console.error(err);
          alert('Xóa tài khoản thất bại. Chỉ có Quản trị viên mới có quyền xóa tài khoản.');
        }
      },
      'Xóa Tài Khoản',
      'danger'
    );
  };

  // Filters for displaying lists
  const filteredQuizzes = quizzes;
  const filteredUsers = users;

  return (
    <div className="quiz-list-container">
      {/* 1. Header Hero Panel */}
    <div className={`quiz-list-hero ${currentUser?.role === 'admin' ? 'admin-cols' : 'teacher-cols'}`}>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">TỔNG ĐỀ THI</div>
            <div className="stat-value">{quizzes.length}</div>
          </div>
          <div className="stat-icon icon-blue">
            <i className="fa-solid fa-book"></i>
          </div>
        </div>
        
        {currentUser?.role === 'admin' && (
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">TỔNG TÀI KHOẢN</div>
              <div className="stat-value">{users.length}</div>
            </div>
            <div className="stat-icon icon-green">
              <i className="fa-solid fa-users"></i>
            </div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">VAI TRÒ CỦA BẠN</div>
            <div className="stat-value" style={{ fontSize: '1.15rem', marginTop: '6px', textTransform: 'capitalize' }}>
              {currentUser?.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}
            </div>
          </div>
          <div className="stat-icon icon-orange">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">TRẠNG THÁI HỆ THỐNG</div>
            <div className="stat-value" style={{ fontSize: '1.2rem', color: 'var(--success)', marginTop: '8px' }}>
              <i className="fa-solid fa-circle-check"></i> Ổn định
            </div>
          </div>
          <div className="stat-icon icon-red" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
            <i className="fa-solid fa-circle-nodes"></i>
          </div>
        </div>
      </div>

      {/* BACK NAVIGATION TO MAIN QUIZ LIST (If editing questions) */}
      {selectedQuizForQuestions ? (
        <div style={{ marginTop: '16px' }}>
          <button 
            onClick={() => setSelectedQuizForQuestions(null)}
            className="btn-reset"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px' }}
          >
            <i className="fa-solid fa-arrow-left"></i> Quay lại danh sách đề thi
          </button>
        </div>
      ) : (
        /* TAB SELECTOR (Only shown in main view) */
        currentUser?.role === 'admin' && (
          <div className="admin-tab-group">
            <button 
              type="button"
              className={activeTab === 'quizzes' ? 'btn-header-primary' : 'btn-header-action'}
              onClick={() => setActiveTab('quizzes')}
              style={{ borderRadius: '8px', padding: '10px 18px' }}
            >
              <i className="fa-solid fa-book"></i> Quản Lý Đề Thi
            </button>
            <button 
              type="button"
              className={activeTab === 'users' ? 'btn-header-primary' : 'btn-header-action'}
              onClick={() => setActiveTab('users')}
              style={{ borderRadius: '8px', padding: '10px 18px' }}
            >
              <i className="fa-solid fa-users"></i> Quản Lý Người Dùng
            </button>
          </div>
        )
      )}

      {/* 2. DYNAMIC WORKSPACE VIEW */}
      {selectedQuizForQuestions ? (
        /* SECTION FOR QUESTIONS & ANSWERS CRUD */
        <div className="quiz-grid-section" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ borderBottom: 'none', paddingBottom: '0', margin: '0' }}>
                Quản Lý Câu Hỏi & Đáp Án
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Đề thi: <strong>{selectedQuizForQuestions.title}</strong> ({selectedQuizForQuestions.time_limit} phút)
              </p>
            </div>
            <button
              onClick={() => openQuestionModal()}
              className="btn-header-primary"
              style={{ borderRadius: '8px', padding: '8px 16px' }}
            >
              <i className="fa-solid fa-plus"></i> Thêm câu hỏi mới
            </button>
          </div>

          <div style={{ padding: '20px' }}>
            {loadingQuestions ? (
              <div className="loading-spinner">Đang tải danh sách câu hỏi...</div>
            ) : questions.length === 0 ? (
              <div className="empty-state">
                Đề thi này chưa có câu hỏi nào. Nhấp vào nút "Thêm câu hỏi mới" ở góc trên bên phải để bắt đầu soạn đề.
              </div>
            ) : (
              <div>
                {questions.map((q, qIdx) => (
                  <div key={q.id} className="question-manage-card">
                    {/* Question Header */}
                    <div className="question-manage-header">
                      <h4>Câu {qIdx + 1} <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>(Thứ tự: {q.order})</span></h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openQuestionModal(q)}
                          className="btn-small-primary"
                          title="Sửa câu hỏi"
                        >
                          <i className="fa-solid fa-pen"></i> Sửa câu hỏi
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="btn-small-danger"
                          title="Xóa câu hỏi"
                        >
                          <i className="fa-solid fa-trash-can"></i> Xóa
                        </button>
                      </div>
                    </div>

                    {/* Question Body */}
                    <div className="question-manage-body">
                      <div className="question-manage-content">
                        {q.content}
                      </div>

                      {/* Answers Sub-list */}
                      <div className="answer-manage-list">
                        {q.answers && q.answers.length > 0 ? (
                          q.answers.map((ans, ansIdx) => {
                            const isCorrect = ans.is_correct === 1 || ans.is_correct === true;
                            const prefix = ['A', 'B', 'C', 'D', 'E', 'F'][ansIdx] || '';
                            return (
                              <div 
                                key={ans.id} 
                                className={`answer-manage-item ${isCorrect ? 'correct' : ''}`}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <div>
                                  <span className="choice-prefix" style={{ marginRight: '8px' }}>{prefix}.</span>
                                  <span className="choice-text">{ans.content}</span>
                                  {isCorrect && (
                                    <span className="badge-status success" style={{ marginLeft: '12px', fontSize: '0.7rem', padding: '2px 8px' }}>
                                      <i className="fa-solid fa-circle-check"></i> Đáp án đúng
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={() => openAnswerModal(q, ans)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    title="Sửa đáp án"
                                  >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAnswer(ans.id)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                                    title="Xóa đáp án"
                                  >
                                    <i className="fa-solid fa-trash"></i>
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)', padding: '8px 0' }}>
                            Chưa soạn thảo các phương án đáp án cho câu hỏi này.
                          </div>
                        )}
                      </div>

                      {/* Add Answer Button */}
                      <button
                        onClick={() => openAnswerModal(q)}
                        className="btn-small-primary"
                        style={{ borderStyle: 'dashed', background: 'transparent', padding: '6px 12px' }}
                      >
                        <i className="fa-solid fa-plus-circle"></i> Thêm phương án đáp án
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (activeTab === 'quizzes' || currentUser?.role !== 'admin') ? (
        /* VIEW 1: QUIZZES MANAGEMENT TABLE & CRUD */
        <>
          {/* Search bar & Create Quiz button */}
          <form onSubmit={handleSearchSubmit} className="search-bar-form" style={{ marginTop: '16px' }}>
            <div className="search-input-group admin-search-group-5">
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
              <button type="submit" className="btn-search" style={{ height: '38px' }}>
                <i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm
              </button>
              <button type="button" onClick={handleReset} className="btn-reset" style={{ height: '38px' }}>
                <i className="fa-solid fa-rotate-left"></i> Làm mới
              </button>
              <button 
                type="button" 
                onClick={() => openQuizModal()} 
                className="btn-header-primary" 
                style={{ height: '38px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="fa-solid fa-plus"></i> Tạo Đề Thi
              </button>
            </div>
          </form>

          {/* Quizzes Table */}
          <div className="quiz-grid-section">
            <h3>Danh Sách Đề Thi Trắc Nghiệm</h3>
            
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
                        <td style={{ fontWeight: '600' }}>{quiz.questions ? quiz.questions.length : 0} câu</td>
                        <td>
                          <span className="badge-status success">
                            <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem', marginRight: '5px' }}></i> Sẵn sàng
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              onClick={() => setSelectedQuizForQuestions(quiz)}
                              className="btn-action"
                              title="Quản lý câu hỏi & đáp án"
                              style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                            >
                              <i className="fa-solid fa-list-check"></i>
                            </button>
                            <button
                              onClick={() => openQuizModal(quiz)}
                              className="btn-action"
                              title="Sửa thông tin đề thi"
                              style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                              className="btn-action"
                              title="Xóa đề thi"
                              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
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
                              style={{ color: '#06b6d4', borderColor: '#06b6d4' }}
                            >
                              <i className="fa-solid fa-chart-pie"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Phân trang đề thi trong Admin */}
            {Math.ceil(totalQuizzes / PAGE_SIZE) > 1 && (
              <div className="pagination-wrapper" style={{ marginTop: '16px', padding: '0 16px 16px' }}>
                <span className="pagination-info">
                  Hiển thị {quizzes.length} / {totalQuizzes} đề thi
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => handleQuizPageChange(quizzesPage - 1)}
                  disabled={quizzesPage === 1}
                >
                  <i className="fa-solid fa-angle-left"></i>
                </button>
                
                {Array.from({ length: Math.ceil(totalQuizzes / PAGE_SIZE) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`pagination-btn ${quizzesPage === p ? 'active' : ''}`}
                    onClick={() => handleQuizPageChange(p)}
                  >
                    {p}
                  </button>
                ))}
                
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => handleQuizPageChange(quizzesPage + 1)}
                  disabled={quizzesPage === Math.ceil(totalQuizzes / PAGE_SIZE)}
                >
                  <i className="fa-solid fa-angle-right"></i>
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* VIEW 2: USERS LIST (Renaming 'Học sinh' to 'Người dùng') */
        <>
          {/* User Search Bar */}
          <form onSubmit={handleUserSearchSubmit} className="search-bar-form" style={{ marginTop: '16px' }}>
            <div className={`search-input-group ${currentUser?.role === 'admin' ? 'admin-search-group-4' : 'admin-search-group-3'}`}>
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
              <button type="submit" className="btn-search" style={{ height: '38px' }}>
                <i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm
              </button>
              <button 
                type="button" 
                onClick={handleUserReset} 
                className="btn-reset" 
                style={{ height: '38px', padding: '0 16px' }}
              >
                <i className="fa-solid fa-rotate-left"></i> Làm mới
              </button>
              {currentUser?.role === 'admin' && (
                <button 
                  type="button" 
                  onClick={() => openUserModal()} 
                  className="btn-header-primary" 
                  style={{ height: '38px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fa-solid fa-user-plus"></i> Thêm Người Dùng
                </button>
              )}
            </div>
          </form>

          {/* Users Table */}
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
                      {currentUser?.role === 'admin' && <th>THAO TÁC</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{u.username}</td>
                        <td>{u.email || 'Chưa thiết lập'}</td>
                        <td>
                          <span className={`badge-status ${u.role === 'teacher' ? 'warning' : u.role === 'admin' ? 'danger' : 'success'}`} style={{ textTransform: 'capitalize' }}>
                            {u.role === 'admin' ? 'Quản trị viên' : u.role === 'teacher' ? 'Giáo viên' : 'Người dùng'}
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
                        {currentUser?.role === 'admin' && (
                          <td>
                            <div className="table-actions">
                              <button
                                onClick={() => openUserModal(u)}
                                className="btn-action"
                                title="Sửa thông tin người dùng"
                                style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="btn-action"
                                title="Xóa người dùng"
                                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Phân trang người dùng trong Admin */}
            {Math.ceil(totalUsers / PAGE_SIZE) > 1 && (
              <div className="pagination-wrapper" style={{ marginTop: '16px', padding: '0 16px 16px' }}>
                <span className="pagination-info">
                  Hiển thị {users.length} / {totalUsers} người dùng
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => handleUsersPageChange(usersPage - 1)}
                  disabled={usersPage === 1}
                >
                  <i className="fa-solid fa-angle-left"></i>
                </button>
                
                {Array.from({ length: Math.ceil(totalUsers / PAGE_SIZE) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`pagination-btn ${usersPage === p ? 'active' : ''}`}
                    onClick={() => handleUsersPageChange(p)}
                  >
                    {p}
                  </button>
                ))}
                
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => handleUsersPageChange(usersPage + 1)}
                  disabled={usersPage === Math.ceil(totalUsers / PAGE_SIZE)}
                >
                  <i className="fa-solid fa-angle-right"></i>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* ======================= POPUP MODALS OVERLAYS =========================== */}
      {/* ========================================================================= */}

      {/* 1. QUIZ MODAL */}
      {showQuizModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingQuiz ? 'Chỉnh Sửa Đề Thi' : 'Tạo Đề Thi Mới'}</h3>
              <button className="modal-close" onClick={() => setShowQuizModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleQuizSubmit} className="modal-body auth-form" style={{ padding: 0 }}>
              {modalError && (
                <div className="alert-error" style={{ marginBottom: '16px' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i> {modalError}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="quiz-title-input">Tên đề thi *</label>
                <input
                  id="quiz-title-input"
                  type="text"
                  placeholder="Nhập tên đề thi trắc nghiệm..."
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="quiz-desc-input">Mô tả đề thi</label>
                <textarea
                  id="quiz-desc-input"
                  placeholder="Nhập mô tả đề thi (chủ đề, nội dung kiểm tra...)"
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-dark)',
                    fontFamily: 'inherit',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="quiz-time-input">Thời gian làm bài (Phút) *</label>
                <input
                  id="quiz-time-input"
                  type="number"
                  min="1"
                  max="180"
                  value={quizForm.time_limit}
                  onChange={(e) => setQuizForm({ ...quizForm, time_limit: e.target.value })}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-reset" onClick={() => setShowQuizModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: 0 }}>
                  <i className="fa-solid fa-circle-check"></i> Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. QUESTION MODAL */}
      {showQuestionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}</h3>
              <button className="modal-close" onClick={() => setShowQuestionModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleQuestionSubmit} className="modal-body auth-form" style={{ padding: 0 }}>
              {modalError && (
                <div className="alert-error" style={{ marginBottom: '16px' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i> {modalError}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="question-content-input">Nội dung câu hỏi *</label>
                <textarea
                  id="question-content-input"
                  placeholder="Nhập nội dung chi tiết câu hỏi..."
                  value={questionForm.content}
                  onChange={(e) => setQuestionForm({ ...questionForm, content: e.target.value })}
                  required
                  style={{
                    padding: '10px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-dark)',
                    fontFamily: 'inherit',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="question-order-input">Thứ tự hiển thị *</label>
                <input
                  id="question-order-input"
                  type="number"
                  min="1"
                  value={questionForm.order}
                  onChange={(e) => setQuestionForm({ ...questionForm, order: e.target.value })}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-reset" onClick={() => setShowQuestionModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: 0 }}>
                  <i className="fa-solid fa-circle-check"></i> Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ANSWER MODAL */}
      {showAnswerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingAnswer ? 'Chỉnh Sửa Phương Án Đáp Án' : 'Thêm Phương Án Đáp Án Mới'}</h3>
              <button className="modal-close" onClick={() => setShowAnswerModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleAnswerSubmit} className="modal-body auth-form" style={{ padding: 0 }}>
              {modalError && (
                <div className="alert-error" style={{ marginBottom: '16px' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i> {modalError}
                </div>
              )}
              <div style={{ backgroundColor: 'var(--input-bg)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Câu hỏi: <strong>"{activeQuestionForAnswer?.content}"</strong>
              </div>
              <div className="form-group">
                <label htmlFor="answer-content-input">Nội dung đáp án *</label>
                <input
                  id="answer-content-input"
                  type="text"
                  placeholder="Nhập nội dung phương án trả lời..."
                  value={answerForm.content}
                  onChange={(e) => setAnswerForm({ ...answerForm, content: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                <input
                  id="answer-iscorrect-input"
                  type="checkbox"
                  checked={answerForm.is_correct}
                  onChange={(e) => setAnswerForm({ ...answerForm, is_correct: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="answer-iscorrect-input" style={{ cursor: 'pointer', userSelect: 'none' }}>Đây là đáp án đúng</label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-reset" onClick={() => setShowAnswerModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: 0 }}>
                  <i className="fa-solid fa-circle-check"></i> Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. USER MODAL */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingUser ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleUserSubmit} className="modal-body auth-form" style={{ padding: 0 }}>
              {modalError && (
                <div className="alert-error" style={{ marginBottom: '16px' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i> {modalError}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="user-username-input">Tên đăng nhập *</label>
                <input
                  id="user-username-input"
                  type="text"
                  placeholder="Nhập tên tài khoản..."
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  required
                  disabled={!!editingUser}
                />
              </div>
              <div className="form-group">
                <label htmlFor="user-email-input">Địa chỉ Email *</label>
                <input
                  id="user-email-input"
                  type="email"
                  placeholder="Nhập email..."
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="user-password-input">Mật khẩu {editingUser ? '(Để trống nếu không đổi)' : '*'}</label>
                <input
                  id="user-password-input"
                  type="password"
                  placeholder={editingUser ? "Nhập mật khẩu mới nếu muốn đổi..." : "Nhập mật khẩu tài khoản..."}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label htmlFor="user-role-input">Vai trò *</label>
                <select
                  id="user-role-input"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  required
                >
                  <option value="student">Người dùng (Học sinh)</option>
                  <option value="teacher">Giáo viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              <div className="form-group" style={{ flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                <input
                  id="user-isactive-input"
                  type="checkbox"
                  checked={userForm.is_active}
                  onChange={(e) => setUserForm({ ...userForm, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="user-isactive-input" style={{ cursor: 'pointer', userSelect: 'none' }}>Tài khoản đang hoạt động</label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-reset" onClick={() => setShowUserModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: 0 }}>
                  <i className="fa-solid fa-circle-check"></i> Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CONFIRMATION MODAL */}
      {confirmConfig.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>{confirmConfig.title}</h3>
              <button className="modal-close" onClick={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body auth-form" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {confirmConfig.message}
              </p>
              <div className="modal-footer" style={{ padding: 0, marginTop: '8px', gap: '12px' }}>
                <button type="button" className="btn-reset" onClick={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} style={{ width: 'auto', marginTop: 0 }}>
                  Hủy bỏ
                </button>
                <button 
                  type="button" 
                  className={confirmConfig.type === 'danger' ? 'btn-danger' : 'btn-primary'} 
                  style={{ width: 'auto', marginTop: 0 }}
                  onClick={() => {
                    if (confirmConfig.onConfirm) {
                      confirmConfig.onConfirm();
                    }
                    setConfirmConfig({ ...confirmConfig, isOpen: false });
                  }}
                >
                  <i className="fa-solid fa-check"></i> Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
