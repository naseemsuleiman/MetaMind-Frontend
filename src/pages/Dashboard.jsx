// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiBarChart2, FiTrendingUp, FiClock, FiTarget,
  FiBookOpen, FiActivity, FiMenu,
  FiGrid, FiLogOut, FiSettings, FiBell,
  FiBook, FiCheckCircle, FiRefreshCw,
  FiPlay, FiPause, FiStopCircle, FiAlertCircle
} from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';
import { GiThink, GiBrain, GiBookshelf, GiHourglass } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeStudySession, setActiveStudySession] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [stats, setStats] = useState({
    totalStudyTime: { hours: 0, minutes: 0 },
    sessionsCompleted: 0,
    interventionsTriggered: 0,
    averageFocusScore: 0,
    streakDays: 0,
    todayStudyTime: { hours: 0, minutes: 0 },
  });

  const subjects = ['Mathematics', 'Physics', 'Computer Science', 'Literature', 'Biology', 'Chemistry'];

  // Real-time clock update
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Fetch modules on component mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await api.get('modules/'); 
        setModules(response.data);
      } catch (err) {
        console.error('Error fetching modules:', err);
        if (err.response?.status === 401) {
          setError('Please login to view modules.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Find and set active study session
  const findActiveSession = useCallback((sessions) => {
    const activeSession = sessions?.find(session => 
      session.end_time === null && session.start_time !== null
    );
    
    if (activeSession) {
      setActiveStudySession(activeSession);
      
      // Calculate elapsed time for active session
      if (activeSession.start_time) {
        const startTime = new Date(activeSession.start_time);
        const now = new Date();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setSessionTimer(elapsedSeconds);
        setIsTimerRunning(true);
      }
    } else {
      setActiveStudySession(null);
      setSessionTimer(0);
      setIsTimerRunning(false);
    }
  }, []);

  // Timer for active study session
  useEffect(() => {
    let interval;
    if (isTimerRunning && activeStudySession) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeStudySession]);

  // Fetch real dashboard data with real-time updates
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [profileRes, sessionsRes, metricsRes, interventionsRes] = await Promise.all([
        api.get('profiles/'),
        api.get('sessions/'),
        api.get('metrics/'),
        api.get('interventions/'),
      ]);

      const sessions = sessionsRes.data || [];
      const profile = profileRes.data[0] || {};
      const interventions = interventionsRes.data || [];
      const metrics = metricsRes.data || [];

      setDashboardData({ 
        profile: profile, 
        sessions: sessions, 
        metrics: metrics, 
        interventions: interventions 
      });

      // Find active session
      findActiveSession(sessions);

      // Calculate total study time
      const totalSeconds = sessions.reduce((acc, s) => {
        return acc + (parseFloat(s.total_duration) || 0);
      }, 0);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      // Calculate today's study time
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = sessions.filter(s => 
        s.start_time && s.start_time.startsWith(today)
      );
      
      const todaySeconds = todaySessions.reduce((acc, s) => {
        return acc + (parseFloat(s.total_duration) || 0);
      }, 0);
      
      const todayHours = Math.floor(todaySeconds / 3600);
      const todayMinutes = Math.floor((todaySeconds % 3600) / 60);

      // Calculate average focus score from completed sessions
      const completedSessions = sessions.filter(s => s.end_time !== null);
      const sessionsWithFocus = completedSessions.filter(s => (s.focus_score || 0) > 0);
      const avgFocus = sessionsWithFocus.length > 0 
        ? Math.round(sessionsWithFocus.reduce((acc, s) => acc + (s.focus_score || 0), 0) / sessionsWithFocus.length)
        : 0;

      // Get streak from profile or calculate from consecutive study days
      let streakDays = profile.streak_days || 0;
      
      // If no streak in profile, calculate from sessions
      if (streakDays === 0 && sessions.length > 0) {
        const sessionDates = [...new Set(sessions
          .filter(s => s.start_time)
          .map(s => s.start_time.split('T')[0])
          .sort()
        )];
        
        // Check for consecutive days
        let currentStreak = 1;
        for (let i = 1; i < sessionDates.length; i++) {
          const prevDate = new Date(sessionDates[i-1]);
          const currDate = new Date(sessionDates[i]);
          const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak++;
          } else if (diffDays > 1) {
            currentStreak = 1;
          }
        }
        
        // Check if last session was today or yesterday
        if (sessionDates.length > 0) {
          const lastSessionDate = new Date(sessionDates[sessionDates.length - 1]);
          const today = new Date();
          const diffDays = Math.floor((today - lastSessionDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1) {
            currentStreak = 0;
          }
        }
        
        streakDays = currentStreak;
      }

      setStats({
        totalStudyTime: { hours, minutes },
        todayStudyTime: { hours: todayHours, minutes: todayMinutes },
        sessionsCompleted: completedSessions.length,
        interventionsTriggered: interventions.length,
        averageFocusScore: avgFocus,
        streakDays: streakDays,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to load dashboard statistics. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [findActiveSession, logout, navigate]);

  // Initial fetch and polling for real-time updates
  useEffect(() => {
    fetchDashboardData();
    
    // Set up polling for real-time updates every 30 seconds
    const pollInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(pollInterval);
  }, [fetchDashboardData]);

  // Start a new study session
  const startStudySession = async (sessionId = null) => {
    setError('');
    
    // If no modules, show error
    if (!modules || modules.length === 0) {
      setError('No learning modules available. Please contact your instructor.');
      return;
    }
    
    const resolvedModuleId = modules[0].id;
    
    try {
      let response;
      if (sessionId) {
        // Resume existing session
        response = await api.post(`/sessions/${sessionId}/start/`, {
          module_id: resolvedModuleId,
          subject: selectedSubject
        });
      } else {
        // Start new session
        response = await api.post('/sessions/start/', {
          module_id: resolvedModuleId,
          subject: selectedSubject
        });
      }

      const data = response.data;
      
      if (response.status === 200) {
        // Update local state immediately
        const newSession = {
          id: data.session_id || data.id,
          start_time: data.start_time || new Date().toISOString(),
          subject: selectedSubject,
          module: modules[0],
          student: user?.id
        };
        
        setActiveStudySession(newSession);
        setIsTimerRunning(true);
        setSessionTimer(0);
        
        // Refresh dashboard data
        await fetchDashboardData();
        
        // Navigate to study page
        navigate(`/study/${newSession.id}`);
      }
    } catch (err) {
      console.error('Error starting session:', err);
      
      if (err.response) {
        const status = err.response.status;
        
        if (status === 400) {
          setError(err.response.data.error || 'Missing required information.');
        } else if (status === 401) {
          setError('Session expired. Please login again.');
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 1500);
        } else if (status === 404) {
          setError('Module not found. Please select another subject.');
        } else if (status === 405) {
          setError('Action not allowed. Please try again.');
        } else {
          setError(err.response.data.error || 'Failed to start study session.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  const stopStudySession = async () => {
    if (!activeStudySession) return;
    
    try {
      const response = await api.post(`/sessions/${activeStudySession.id}/complete/`, {
        total_duration: sessionTimer,
        focus_score: Math.min(10, Math.max(1, Math.floor(Math.random() * 10) + 1)) // Temporary placeholder
      });
      
      if (response.status === 200) {
        setActiveStudySession(null);
        setIsTimerRunning(false);
        setSessionTimer(0);
        
        // Refresh dashboard data
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Error stopping session:', err);
      setError('Failed to stop session. Please try again.');
    }
  };

  const pauseStudySession = async () => {
    if (!activeStudySession) return;
    
    try {
      const response = await api.post(`/sessions/${activeStudySession.id}/pause/`);
      if (response.status === 200) {
        setIsTimerRunning(false);
      }
    } catch (err) {
      console.error('Error pausing session:', err);
      setError('Failed to pause session.');
    }
  };

  const resumeStudySession = async () => {
    if (!activeStudySession) return;
    
    try {
      const response = await api.post(`/sessions/${activeStudySession.id}/resume/`);
      if (response.status === 200) {
        setIsTimerRunning(true);
      }
    } catch (err) {
      console.error('Error resuming session:', err);
      setError('Failed to resume session.');
    }
  };

  // Format timer display
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Process data for focus chart (last 7 days)
  const getFocusChartData = () => {
    if (!dashboardData?.sessions?.length) return null;
    
    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    // Group sessions by date and calculate average focus score per day
    const dailyAverages = last7Days.map(date => {
      const daySessions = dashboardData.sessions.filter(s => 
        s.start_time && s.start_time.startsWith(date) && s.focus_score
      );
      
      if (daySessions.length === 0) return 0;
      
      const totalScore = daySessions.reduce((sum, session) => sum + (session.focus_score || 0), 0);
      return Math.round(totalScore / daySessions.length);
    });
    
    // Format labels
    const labels = last7Days.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Daily Focus Score',
          data: dailyAverages,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#8B5CF6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };

  // Process data for subject distribution chart
  const getSubjectChartData = () => {
    if (!dashboardData?.sessions?.length) return null;
    
    // Count sessions by subject
    const subjectCounts = {};
    dashboardData.sessions.forEach(session => {
      const subject = session.subject || 'General';
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });
    
    const subjects = Object.keys(subjectCounts);
    const counts = Object.values(subjectCounts);
    
    if (subjects.length === 0) return null;
    
    // Color palette
    const colors = [
      'rgba(139, 92, 246, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(20, 184, 166, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(99, 102, 241, 0.8)',
    ];
    
    return {
      labels: subjects,
      datasets: [
        {
          data: counts,
          backgroundColor: colors.slice(0, subjects.length),
          borderColor: '#fff',
          borderWidth: 2,
          hoverOffset: 15
        }
      ]
    };
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setLoading(true);
    await fetchDashboardData();
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-light to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mindful-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metacognitive-gray">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const focusChartData = getFocusChartData();
  const subjectChartData = getSubjectChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light to-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-metacognitive-gray hover:bg-gray-100"
              >
                <FiMenu className="w-6 h-6" />
              </button>
              
              <div className="flex items-center ml-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-mindful-blue to-cognitive-teal flex items-center justify-center">
                  <GiThink className="text-white text-xl" />
                </div>
                <span className="ml-3 text-xl font-bold text-metacognitive-gray">MetaMind</span>
              </div>

              <div className="hidden md:block ml-8">
                <select 
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-metacognitive-gray rounded-lg focus:ring-2 focus:ring-mindful-blue focus:border-mindful-blue px-4 py-2"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg text-metacognitive-gray hover:bg-gray-100"
                title="Refresh Data"
              >
                <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Active Session Timer */}
              {activeStudySession && (
                <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-green-50 rounded-lg">
                  <GiHourglass className="text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-green-700">
                      {formatTime(sessionTimer)}
                    </div>
                    <div className="text-xs text-green-600">Active session</div>
                  </div>
                </div>
              )}
              
              {/* Current Time */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <FiClock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-metacognitive-gray">
                    {dashboardData?.profile?.user?.username || user?.username || 'Learner'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Streak: {stats.streakDays} days
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-mindful-blue to-cognitive-teal flex items-center justify-center text-white font-bold">
                  {((dashboardData?.profile?.user?.username || user?.username || 'L').charAt(0)).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
            <FiAlertCircle className="text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-mindful-blue to-cognitive-teal flex items-center justify-center">
                    <GiThink className="text-white text-xl" />
                  </div>
                  <span className="ml-3 text-xl font-bold text-metacognitive-gray">MetaMind</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-metacognitive-gray">
                  ✕
                </button>
              </div>
              
              <div className="space-y-2">
                <Link to="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg bg-mindful-blue/10 text-mindful-blue">
                  <FiGrid />
                  <span>Dashboard</span>
                </Link>
                <Link to="/study" className="flex items-center space-x-3 p-3 rounded-lg text-metacognitive-gray hover:bg-gray-100">
                  <FiBookOpen />
                  <span>Study Sessions</span>
                </Link>
                <Link to="/analytics" className="flex items-center space-x-3 p-3 rounded-lg text-metacognitive-gray hover:bg-gray-100">
                  <FiBarChart2 />
                  <span>Analytics</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-3 p-3 rounded-lg text-metacognitive-gray hover:bg-gray-100 w-full">
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-mindful-blue to-cognitive-teal rounded-2xl p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {dashboardData?.profile?.user?.username || user?.username || 'Learner'}!
              </h1>
              <p className="opacity-90">
                {activeStudySession ? 
                  `Currently studying ${selectedSubject}` : 
                  `Ready to learn ${selectedSubject}?`}
              </p>
              <div className="mt-2 text-sm opacity-75">
                Today's date: {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              {stats.streakDays > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium text-lg">
                    🔥 {stats.streakDays} day streak
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subject Selection (Mobile) */}
        <div className="md:hidden mb-6">
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-white border border-gray-300 text-metacognitive-gray rounded-lg focus:ring-2 focus:ring-mindful-blue focus:border-mindful-blue px-4 py-3"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Active Study Session Card */}
        {activeStudySession && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-200 mb-8 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="p-3 rounded-xl bg-green-100 mr-4">
                  <FiPlay className="text-2xl text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Active Study Session</h3>
                  <p className="text-gray-600">
                    Subject: {activeStudySession.subject || selectedSubject}
                    {activeStudySession.module && ` • Module: ${activeStudySession.module.name}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Started: {formatDate(activeStudySession.start_time)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800 font-mono">
                    {formatTime(sessionTimer)}
                  </div>
                  <div className="text-sm text-gray-500">Elapsed time</div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={isTimerRunning ? pauseStudySession : resumeStudySession}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      isTimerRunning ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {isTimerRunning ? <FiPause /> : <FiPlay />}
                    <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
                  </button>
                  
                  <button
                    onClick={stopStudySession}
                    className="px-4 py-2 rounded-lg bg-red-100 text-red-700 flex items-center space-x-2"
                  >
                    <FiStopCircle />
                    <span>End Session</span>
                  </button>
                  
                  <Link
                    to={`/study/${activeStudySession.id}`}
                    className="px-4 py-2 rounded-lg bg-mindful-blue text-white"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Study Time</p>
                <p className="text-3xl font-bold text-metacognitive-gray">
                  {stats.totalStudyTime.hours}h {stats.totalStudyTime.minutes}m
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Today: {stats.todayStudyTime.hours}h {stats.todayStudyTime.minutes}m
                </p>
                <p className="text-sm text-gray-500">{stats.sessionsCompleted} session{stats.sessionsCompleted !== 1 ? 's' : ''}</p>
              </div>
              <div className="p-3 rounded-xl bg-mindful-blue/10">
                <FiClock className="text-2xl text-mindful-blue" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Focus Score</p>
                <p className="text-3xl font-bold text-metacognitive-gray">
                  {stats.averageFocusScore}/10
                </p>
                <p className="text-sm text-gray-500 mt-1">Average across sessions</p>
                <p className="text-xs text-gray-400">
                  {stats.averageFocusScore >= 8 ? 'Excellent focus!' : 
                   stats.averageFocusScore >= 6 ? 'Good focus!' : 
                   'Room for improvement'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-cognitive-teal/10">
                <FiTarget className="text-2xl text-cognitive-teal" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">AI Interventions</p>
                <p className="text-3xl font-bold text-metacognitive-gray">
                  {stats.interventionsTriggered}
                </p>
                <p className="text-sm text-gray-500 mt-1">Learning guidance received</p>
                <p className="text-xs text-gray-400">
                  {stats.interventionsTriggered > 5 ? 'Active learner!' : 'Getting started'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-insight-purple/10">
                <GiThink className="text-2xl text-insight-purple" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Learning Streak</p>
                <p className="text-3xl font-bold text-metacognitive-gray">
                  {stats.streakDays} days
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.streakDays > 7 ? 'Amazing consistency! 🔥' : 
                   stats.streakDays > 3 ? 'Great consistency!' : 
                   stats.streakDays > 0 ? 'Keep it up!' : 'Start your streak today!'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-calm-green/10">
                <FiTrendingUp className="text-2xl text-calm-green" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Study Start */}
        {!activeStudySession && (
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Start a Study Session</h3>
                <p className="opacity-90">Study {selectedSubject} with AI monitoring and real-time feedback</p>
                {modules.length > 0 && (
                  <p className="text-sm opacity-75 mt-1">
                    Available modules: {modules.length}
                  </p>
                )}
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => startStudySession()}
                  className="px-8 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition flex items-center space-x-2"
                  disabled={modules.length === 0}
                >
                  <FiPlay />
                  <span>{modules.length === 0 ? 'No Modules Available' : 'Start Now'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Focus Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-metacognitive-gray flex items-center">
                <FiActivity className="mr-3 text-mindful-blue" />
                Focus Progression (Last 7 Days)
              </h3>
              <button 
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Refresh chart"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="h-72">
              {focusChartData ? (
                <Line 
                  data={focusChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => `Focus: ${context.parsed.y}/10`
                        }
                      }
                    },
                    scales: {
                      y: {
                        min: 0,
                        max: 10,
                        ticks: {
                          stepSize: 2
                        },
                        title: {
                          display: true,
                          text: 'Focus Score'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Date'
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <FiActivity className="text-4xl mb-2 text-gray-300" />
                  <p>No focus data available</p>
                  <p className="text-sm mt-1">Complete study sessions to see your progress</p>
                </div>
              )}
            </div>
          </div>

          {/* Subject Distribution */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-metacognitive-gray flex items-center">
                <GiBookshelf className="mr-3 text-cognitive-teal" />
                Study Subjects Distribution
              </h3>
              <span className="text-sm text-gray-500">
                Total: {dashboardData?.sessions?.length || 0} sessions
              </span>
            </div>
            <div className="h-72">
              {subjectChartData ? (
                <Doughnut 
                  data={subjectChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                          pointStyle: 'circle'
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.raw / total) * 100);
                            return `${context.label}: ${context.raw} sessions (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <GiBookshelf className="text-4xl mb-2 text-gray-300" />
                  <p>No study sessions yet</p>
                  <p className="text-sm mt-1">Start studying to see subject distribution</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Sessions & Interventions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Study Sessions */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-metacognitive-gray flex items-center">
                <FiBookOpen className="mr-3 text-insight-purple" />
                Recent Sessions
              </h3>
              <Link to="/study" className="text-sm text-mindful-blue hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData?.sessions?.slice(0, 5).map((session, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => navigate(`/study/${session.id}`)}
                >
                  <div>
                    <p className="font-medium text-metacognitive-gray">{session.subject || 'Study Session'}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(session.start_time)} • 
                      {session.total_duration ? ` ${Math.round(session.total_duration / 60)} min` : ' Ongoing'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (session.focus_score || 0) >= 8 ? 'bg-green-100 text-green-800' :
                    (session.focus_score || 0) >= 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {session.focus_score ? `Focus: ${session.focus_score}/10` : 'No score'}
                  </div>
                </div>
              ))}
              {(!dashboardData?.sessions || dashboardData.sessions.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <FiBookOpen className="text-3xl mx-auto mb-2 text-gray-300" />
                  <p>No study sessions yet</p>
                  <p className="text-sm mt-1">Start your first session to see data here</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Interventions */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-metacognitive-gray flex items-center">
                <GiThink className="mr-3 text-calm-green" />
                Recent AI Guidance
              </h3>
              <span className="text-sm text-gray-500">
                {stats.interventionsTriggered} total
              </span>
            </div>
            <div className="space-y-4">
              {dashboardData?.interventions?.slice(0, 5).map((intervention, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-mindful-blue/10 mr-3">
                      <GiThink className="text-mindful-blue" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-metacognitive-gray">{intervention.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {intervention.triggered_at ? formatDate(intervention.triggered_at) : 'Recent'}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          intervention.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          intervention.type === 'suggestion' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {intervention.type || 'guidance'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!dashboardData?.interventions || dashboardData.interventions.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <GiThink className="text-3xl mx-auto mb-2 text-gray-300" />
                  <p>No AI guidance yet</p>
                  <p className="text-sm mt-1">AI will provide tips during your study sessions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-xl bg-mindful-blue/10">
                <GiBrain className="text-2xl text-mindful-blue" />
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-lg text-metacognitive-gray">Study Session</h4>
                <p className="text-sm text-gray-500">
                  {activeStudySession ? 'Continue learning' : 'Start learning now'}
                </p>
              </div>
            </div>
            <button
              onClick={() => activeStudySession ? navigate(`/study/${activeStudySession.id}`) : startStudySession()}
              className="w-full mt-4 py-3 bg-mindful-blue text-white font-medium rounded-xl hover:bg-opacity-90 transition"
              disabled={modules.length === 0}
            >
              {activeStudySession ? 'Continue Session' : modules.length === 0 ? 'No Modules' : 'Start Studying'}
            </button>
          </div>

          <Link to="/analytics" className="block">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-xl bg-cognitive-teal/10">
                  <FiBarChart2 className="text-2xl text-cognitive-teal" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-lg text-metacognitive-gray">Analytics</h4>
                  <p className="text-sm text-gray-500">View detailed insights</p>
                </div>
              </div>
              <div className="w-full mt-4 py-3 bg-cognitive-teal text-white font-medium rounded-xl hover:bg-opacity-90 transition text-center">
                View Analytics
              </div>
            </div>
          </Link>

          <Link to="/profile" className="block">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-xl bg-insight-purple/10">
                  <FiSettings className="text-2xl text-insight-purple" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-lg text-metacognitive-gray">Profile & Settings</h4>
                  <p className="text-sm text-gray-500">Edit preferences</p>
                </div>
              </div>
              <div className="w-full mt-4 py-3 bg-insight-purple text-white font-medium rounded-xl hover:bg-opacity-90 transition text-center">
                Edit Profile
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;