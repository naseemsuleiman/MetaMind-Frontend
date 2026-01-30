// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogIn, FiBook, FiLock } from 'react-icons/fi';
import { FaBrain, FaUserShield } from "react-icons/fa";
import { GiThink } from 'react-icons/gi';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { login, loginAdmin  } = useAuth();
  const navigate = useNavigate();



  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    if (isAdminLogin) {
      console.log('Attempting admin login...');

      const result = await loginAdmin(username, password) || { success: false };
      console.log('Admin login result:', result);

      if (result.success) {
    // Force a small delay or ensure localStorage is actually set before moving
    console.log("Login successful, redirecting...");
    setTimeout(() => {
        navigate('/admin/dashboard');
    }, 100); 
} else {
        setError(
          result.error?.detail ||
          result.error?.message ||
          'Invalid admin credentials'
        );
        console.error('Admin login failed:', result.error);
      }

    } else {
  // Student login
  const success = await login(username, password); // login returns true/false
  
  if (success) {
    navigate('/dashboard');
  } else {
    // This part usually isn't hit because login() throws an error on failure
    setError('Invalid credentials');
  }
}
  } catch (err) {
    console.error('Login exception:', err);
    setError('Login failed. Check console for details.');
  } finally {
    setLoading(false);
  }
};


  // Auto-detect admin login
  const handleUsernameChange = (value) => {
    setUsername(value);
    // Check if it's the admin username
    if (value === 'metamind_admin') {
      setIsAdminLogin(true);
    } else {
      setIsAdminLogin(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-mindful-blue to-cognitive-teal p-12 flex-col justify-between">
        <div>
          <div className="flex items-center mb-8">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <GiThink className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-white ml-4">MetaMind</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            The Metacognitive AI Companion
          </h2>
          
          <p className="text-white text-lg opacity-90 mb-8">
            Don't just learn—learn how to learn. MetaMind tracks your cognitive 
            processes and helps you become a better, more efficient learner.
          </p>

          <div className="space-y-6">
            <FeatureItem 
              icon={<FaBrain />}
              title="Cognitive Monitoring"
              description="Tracks attention, understanding, and learning patterns"
            />
            <FeatureItem 
              icon={<GiThink />}
              title="Socratic Guidance"
              description="Asks questions to deepen your understanding"
            />
            <FeatureItem 
              icon={<FiBook />}
              title="Personalized Learning"
              description="Adapts to your unique learning style and pace"
            />
            <FeatureItem 
              icon={<FaUserShield />}
              title="Admin Portal"
              description="Manage study materials and monitor system"
            />
          </div>
        </div>

        <div className="text-white opacity-80">
          <p>"Teach a man to understand how he fishes best, and he revolutionizes the industry."</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-mindful-blue to-cognitive-teal rounded-xl">
                <GiThink className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-metacognitive-gray ml-3">MetaMind</h1>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-metacognitive-gray mb-2">
              {isAdminLogin ? 'Admin Portal' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {isAdminLogin 
                ? 'Single admin access to manage the system'
                : 'Sign in to continue your metacognitive journey'}
            </p>
          </div>

          {/* Admin/Student Switch */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsAdminLogin(false);
                  setUsername('');
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !isAdminLogin 
                    ? 'bg-mindful-blue text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Student Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdminLogin(true);
                  setUsername('metamind_admin');
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isAdminLogin 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiLock className="inline mr-2" />
                Admin Login
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {isAdminLogin && (
              <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <FaUserShield className="mr-2" />
                  <span className="font-medium">Admin Mode</span>
                </div>
                <p className="text-sm mt-1">
                  Single admin access to manage study materials
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={`input-field ${isAdminLogin ? 'border-purple-300 focus:ring-purple-500 focus:border-purple-500' : ''}`}
                placeholder={isAdminLogin ? "metamind_admin" : "Enter your username"}
                required
                readOnly={isAdminLogin}
              />
              {isAdminLogin && (
                <p className="text-xs text-purple-600 mt-1">
                  Admin username is auto-filled
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input-field ${isAdminLogin ? 'border-purple-300 focus:ring-purple-500 focus:border-purple-500' : ''}`}
                placeholder="Enter your password"
                required
              />
            </div>

            {!isAdminLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-mindful-blue focus:ring-mindful-blue border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-mindful-blue hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center py-3 rounded-lg font-semibold transition-colors ${
                isAdminLogin
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'btn-primary'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isAdminLogin ? 'Accessing Admin...' : 'Signing in...'}
                </>
              ) : (
                <>
                  {isAdminLogin ? (
                    <>
                      <FiLock className="mr-2" />
                      Access Admin Dashboard
                    </>
                  ) : (
                    <>
                      <FiLogIn className="mr-2" />
                      Sign In
                    </>
                  )}
                </>
              )}
            </button>

            <div className="text-center space-y-2">
              {!isAdminLogin && (
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-mindful-blue font-semibold hover:underline">
                    Create account
                  </Link>
                </p>
              )}
              
              <div>
                <Link to="/" className="text-gray-600 hover:text-mindful-blue hover:underline text-sm">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-center text-gray-600 mb-4">
              {isAdminLogin ? 'Admin Credentials' : 'Try demo credentials:'}
            </h3>
            
            {isAdminLogin ? (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-center mb-2">
                  <FaUserShield className="text-purple-600 text-2xl mx-auto mb-2" />
                  <p className="font-medium text-purple-700">Single Admin Access</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-semibold">metamind_admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Password:</span>
                    <span className="font-semibold">MetaMind@2024</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Full access to manage all study materials
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">Username: <span className="text-mindful-blue">henry_math</span></p>
                  <p className="text-gray-500">Password: password123</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">Role: Mathematics Student</p>
                  <p className="text-gray-500">Focus: Linear Algebra</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, description }) => (
  <div className="flex items-start">
    <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-4">
      <div className="text-white">{icon}</div>
    </div>
    <div>
      <h4 className="text-white font-semibold mb-1">{title}</h4>
      <p className="text-white text-sm opacity-90">{description}</p>
    </div>
  </div>
);

export default Login;