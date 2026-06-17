import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import QuizList from './components/QuizList';
import QuizExam from './components/QuizExam';
import QuizResult from './components/QuizResult';
import Profile from './components/Profile';
import QuizLeaderboard from './components/QuizLeaderboard';
import QuizAnalytics from './components/QuizAnalytics';

function App() {
  const { user, loading, login, register, logout } = useAuth();
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Các view: 'login' | 'register' | 'list' | 'exam' | 'result'
  const [activeView, setActiveView] = useState('login');
  
  // Trạng thái dữ liệu thi
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [examUserAnswers, setExamUserAnswers] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);

  // Cập nhật view dựa vào trạng thái đăng nhập
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Nếu đã đăng nhập và đang ở màn login/register thì nhảy sang list
        if (activeView === 'login' || activeView === 'register') {
          setActiveView('list');
        }
      } else {
        // Nếu chưa đăng nhập, chỉ cho phép ở màn login hoặc register
        if (activeView !== 'register') {
          setActiveView('login');
        }
      }
    }
  }, [user, loading]);

  const handleLogin = async (username, password) => {
    await login(username, password);
    setActiveView('list');
  };

  const handleRegister = async (username, email, password, role) => {
    await register(username, email, password, role);
  };

  const handleLogout = async () => {
    await logout();
    setSelectedQuiz(null);
    setExamQuestions([]);
    setExamUserAnswers({});
    setSubmissionResult(null);
    setActiveView('login');
  };

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setActiveView('exam');
  };

  const handleSubmitSuccess = (result, questions) => {
    setSubmissionResult(result);
    setExamQuestions(questions);
    
    // Convert answers từ array nộp lên database thành object lưu local để review
    const answersObj = {};
    result.user_answers.forEach((ua) => {
      answersObj[ua.question] = ua.selected_answer;
    });
    setExamUserAnswers(answersObj);
    
    setActiveView('result');
  };

  const handleGoHome = () => {
    if (user) {
      setSelectedQuiz(null);
      setExamQuestions([]);
      setExamUserAnswers({});
      setSubmissionResult(null);
      setActiveView('list');
    } else {
      setActiveView('login');
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ marginTop: '100px', fontSize: '1.2rem' }}>
        Đang khởi động hệ thống trắc nghiệm...
      </div>
    );
  }

  return (
    <div id="root">
      {/* Navbar luôn ở trên cùng */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onGoHome={handleGoHome} 
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onGoProfile={() => setActiveView('profile')}
      />

      <main className="main-content">
        {/* Render View động */}
        {activeView === 'login' && (
          <Login 
            onLogin={handleLogin} 
            onSwitchToRegister={() => setActiveView('register')} 
          />
        )}
        
        {activeView === 'register' && (
          <Register 
            onRegister={handleRegister} 
            onSwitchToLogin={() => setActiveView('login')} 
          />
        )}
        
        {activeView === 'list' && (
          <QuizList 
            onSelectQuiz={handleSelectQuiz} 
            onSelectLeaderboard={(quiz) => {
              setSelectedQuiz(quiz);
              setActiveView('leaderboard');
            }}
            onSelectAnalytics={(quiz) => {
              setSelectedQuiz(quiz);
              setActiveView('analytics');
            }}
          />
        )}
        
        {activeView === 'exam' && selectedQuiz && (
          <QuizExam 
            quiz={selectedQuiz} 
            onCancel={handleGoHome} 
            onSubmitSuccess={handleSubmitSuccess} 
          />
        )}
        
        {activeView === 'result' && submissionResult && (
          <QuizResult 
            result={submissionResult} 
            questions={examQuestions} 
            userAnswers={examUserAnswers} 
            onBack={handleGoHome} 
          />
        )}

        {activeView === 'profile' && (
          <Profile 
            onBack={handleGoHome} 
          />
        )}

        {activeView === 'leaderboard' && selectedQuiz && (
          <QuizLeaderboard 
            quiz={selectedQuiz}
            onBack={handleGoHome} 
          />
        )}

        {activeView === 'analytics' && selectedQuiz && (
          <QuizAnalytics 
            quiz={selectedQuiz}
            onBack={handleGoHome} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
