// frontend/src/pages/Profile.jsx
import React, { useState } from 'react';
import { FiUser, FiMail, FiBook, FiSettings, FiBell, FiShield } from 'react-icons/fi';
import { GiBrain, GiThink } from 'react-icons/gi';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState({
    firstName: 'Henry',
    lastName: 'Matthews',
    email: 'henry@university.edu',
    username: 'henry_math',
    learningStyle: 'visual',
    neurodiversityProfile: 'adhd_traits',
    cognitiveLoadCapacity: 7,
    dailyStudyGoal: 120, // minutes
    notifications: true,
    darkMode: false,
    weaningMode: false
  });

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <FiUser /> },
    { id: 'learning', label: 'Learning Profile', icon: <FiBook /> },
    { id: 'preferences', label: 'Preferences', icon: <FiSettings /> },
    { id: 'privacy', label: 'Privacy', icon: <FiShield /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-metacognitive-gray mb-2">
          Your Profile
        </h1>
        <p className="text-mindful-blue">
          Manage your personal information and learning preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Tabs & Avatar */}
        <div className="lg:col-span-1">
          <div className="card mb-6">
            <div className="flex flex-col items-center p-6">
              <div className="w-32 h-32 bg-gradient-to-br from-mindful-blue to-cognitive-teal rounded-full flex items-center justify-center mb-4">
                <GiThink className="text-white text-5xl" />
              </div>
              <h2 className="text-xl font-bold text-metacognitive-gray">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-600">Mathematics Student</p>
              <div className="mt-4 px-4 py-2 bg-calm-green bg-opacity-10 text-calm-green rounded-full text-sm font-medium">
                Active Learner
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="card">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-mindful-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-3">
          <div className="card">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div>
                <h3 className="text-xl font-semibold text-metacognitive-gray mb-6 flex items-center">
                  <FiUser className="mr-2" />
                  Personal Information
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMail className="inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Learning Profile Tab */}
            {activeTab === 'learning' && (
              <div>
                <h3 className="text-xl font-semibold text-metacognitive-gray mb-6 flex items-center">
                  <GiBrain className="mr-2" />
                  Learning Profile
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Style
                    </label>
                    <select
                      value={profile.learningStyle}
                      onChange={(e) => handleInputChange('learningStyle', e.target.value)}
                      className="input-field"
                    >
                      <option value="visual">Visual Learner</option>
                      <option value="auditory">Auditory Learner</option>
                      <option value="kinesthetic">Kinesthetic Learner</option>
                      <option value="balanced">Balanced</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-2">
                      How you prefer to process information
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Neurodiversity Profile
                    </label>
                    <select
                      value={profile.neurodiversityProfile}
                      onChange={(e) => handleInputChange('neurodiversityProfile', e.target.value)}
                      className="input-field"
                    >
                      <option value="none">None</option>
                      <option value="adhd_traits">ADHD traits</option>
                      <option value="autism_spectrum">Autism spectrum</option>
                      <option value="dyslexia">Dyslexia</option>
                      <option value="other">Other</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-2">
                      Helps MetaMind adapt to your unique learning needs
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cognitive Load Capacity (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={profile.cognitiveLoadCapacity}
                      onChange={(e) => handleInputChange('cognitiveLoadCapacity', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Low ({profile.cognitiveLoadCapacity})</span>
                      <span>High</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Study Goal (minutes)
                    </label>
                    <input
                      type="number"
                      value={profile.dailyStudyGoal}
                      onChange={(e) => handleInputChange('dailyStudyGoal', parseInt(e.target.value))}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-xl font-semibold text-metacognitive-gray mb-6 flex items-center">
                  <FiSettings className="mr-2" />
                  Preferences
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive weekly progress reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.notifications}
                        onChange={() => handleInputChange('notifications', !profile.notifications)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mindful-blue"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">Dark Mode</h4>
                      <p className="text-sm text-gray-500">Use dark theme</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.darkMode}
                        onChange={() => handleInputChange('darkMode', !profile.darkMode)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mindful-blue"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">Weaning Mode</h4>
                      <p className="text-sm text-gray-500">Gradually reduce AI interventions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.weaningMode}
                        onChange={() => handleInputChange('weaningMode', !profile.weaningMode)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mindful-blue"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div>
                <h3 className="text-xl font-semibold text-metacognitive-gray mb-6 flex items-center">
                  <FiShield className="mr-2" />
                  Privacy & Data
                </h3>
                
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Your Data is Secure</h4>
                    <p className="text-blue-700 text-sm">
                      MetaMind follows strict data ethics. Your learning data is anonymized and 
                      used only to improve your experience. You have full control over your data.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-mindful-blue transition-colors">
                      <h4 className="font-medium text-gray-800">Download Your Data</h4>
                      <p className="text-sm text-gray-500">Export all your learning data in JSON format</p>
                    </button>

                    <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-red-200 transition-colors">
                      <h4 className="font-medium text-red-600">Delete Account</h4>
                      <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="btn-primary px-8">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;