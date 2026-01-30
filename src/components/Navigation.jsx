// frontend/src/components/Navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, FiBook, FiBarChart2, FiUser, 
  FiLogOut 
} from 'react-icons/fi';
import { GiThink } from 'react-icons/gi';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // In Navigation.jsx, update the navItems array:
const navItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { path: '/app/study', label: 'Study', icon: <FiBook /> },
  { path: '/app/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
  { path: '/app/profile', label: 'Profile', icon: <FiUser /> },
];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-mindful-blue to-cognitive-teal rounded-lg">
              <GiThink className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold text-metacognitive-gray">
              MetaMind
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-mindful-blue text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-metacognitive-gray">
                {user?.user?.first_name || 'Learner'} {user?.user?.last_name || ''}
              </p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Logout"
            >
              <FiLogOut className="mr-2" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-around py-3 border-t border-gray-100">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg ${
                location.pathname === item.path
                  ? 'text-mindful-blue'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;