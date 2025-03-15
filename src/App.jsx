import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeProvider';
import ProtectedRoute from './context/ProtectedRoute';
import RedirectIfAuthenticated from './context/RedirectIfAuthenticated';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import RegistrationPage from './pages/RegistrationPage';
import MainPage from './pages/MainPage';
import CronJobManager from './pages/CronJobs';
import UserManagement from './pages/UserDetailPage';
import CustomModeCanvas from './pages/CustomMode';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={
                <RedirectIfAuthenticated>
                  <LoginPage />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <RedirectIfAuthenticated>
                  <ForgotPasswordPage />
                </RedirectIfAuthenticated>
              }
            />
              <Route path="/main" element={<ProtectedRoute><MainPage /></ProtectedRoute>} >
          <Route path="dash" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="customMode" element={<ProtectedRoute><CustomModeCanvas /></ProtectedRoute>} />

          <Route path="cronJobs" element={
            <ProtectedRoute adminOnly={true}>
              <CronJobManager />
            </ProtectedRoute>
          } />

          <Route path="userManagement" element={
            <ProtectedRoute adminOnly={true}>
              <UserManagement />
            </ProtectedRoute>
          } />   
        </Route>
            <Route
              path="/register"
              element={
                <RedirectIfAuthenticated>
                  <RegistrationPage />
                </RedirectIfAuthenticated>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

