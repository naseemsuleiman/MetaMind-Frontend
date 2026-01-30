// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import PrivateRoute from './components/PrivateRoute';
import PrivateLayout from './components/PrivateLayout';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudySession from './pages/StudySession';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import CourseSelection from './pages/CourseSelection';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import Debug from './pages/Debug';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MetaMindProvider>
          <div className="min-h-screen bg-background-light">
            <Routes>
              {/* --- PUBLIC ROUTES --- */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/debug" element={<Debug />} />
              <Route path="/register" element={<Register />} />

              {/* --- ROUTES WITHOUT SIDEBAR (Original structure) --- */}
              <Route path="/session-summary" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/course-selection" element={<CourseSelection />} />
              
              {/* ADDED :sessionId HERE to match your specific study sessions */}
              <Route path="/study/:sessionId" element={<StudySession />} />
              <Route path="/study" element={<StudySession />} />

              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />

              {/* --- ROUTES WITH SIDEBAR / PRIVATE WRAPPER --- */}
              <Route element={<PrivateRoute />}>
                <Route element={<PrivateLayout />}>
                   {/* If you have specific routes that NEED the sidebar, put them here */}
                </Route>
              </Route>

              {/* --- ADMIN --- */}
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />

              {/* --- THE CATCH-ALL (The thing causing the "logout") --- */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </MetaMindProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
