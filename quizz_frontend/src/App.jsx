import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import AdminDashboard from './components/AdminDashboard';

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

  if (loading) {
    return (
      <div className="loading-spinner" style={{ marginTop: '100px', fontSize: '1.2rem' }}>
        Đang khởi động hệ thống trắc nghiệm...
      </div>
    );
  }

  // Component bảo vệ các Route yêu cầu Đăng nhập
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Component bảo vệ các Route yêu cầu quyền Giáo viên / Admin
  const AdminRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return <Navigate to="/quizzes" replace />;
    }
    return children;
  };

  // Component bảo vệ các Route không cho truy cập khi đã Đăng nhập
  const PublicRoute = ({ children }) => {
    if (user) {
      if (user.role === 'admin' || user.role === 'teacher') {
        return <Navigate to="/admin" replace />;
      }
      return <Navigate to="/quizzes" replace />;
    }
    return children;
  };


  return (
    <BrowserRouter>
      <div id="root">
        {/* Navbar hiển thị trên mọi trang */}
        <Navbar 
          user={user} 
          onLogout={logout} 
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(!darkMode)}
        />

        <main className="main-content">
          <Routes>
            {/* Chuyển hướng trang chủ sang /quizzes */}
            <Route path="/" element={<Navigate to="/quizzes" replace />} />

            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login onLogin={login} />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register onRegister={register} />
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/quizzes" element={
              <ProtectedRoute>
                <QuizList />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            <Route path="/quizzes/:quizId/exam" element={
              <ProtectedRoute>
                <QuizExam />
              </ProtectedRoute>
            } />

            <Route path="/quizzes/:quizId/leaderboard" element={
              <ProtectedRoute>
                <QuizLeaderboard />
              </ProtectedRoute>
            } />

            <Route path="/quizzes/:quizId/analytics" element={
              <ProtectedRoute>
                <QuizAnalytics />
              </ProtectedRoute>
            } />

            <Route path="/results/:resultId" element={
              <ProtectedRoute>
                <QuizResult />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Fallback chuyển hướng về trang chủ */}
            <Route path="*" element={<Navigate to="/quizzes" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
