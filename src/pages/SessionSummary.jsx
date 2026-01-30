// frontend/src/pages/SessionSummary.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiTarget, FiTrendingUp, FiBookOpen } from 'react-icons/fi';
import { GiBrain } from 'react-icons/gi';

const SessionSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionData, moduleTitle, contentProgress } = location.state || {};

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-light to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-metacognitive-gray">No session data found</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-mindful-blue text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-metacognitive-gray mb-4">
            Session Complete!
          </h1>
          <p className="text-xl text-gray-600">
            Great work on {moduleTitle || 'your study session'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-metacognitive-gray mb-6 flex items-center">
              <FiClock className="mr-3 text-mindful-blue" />
              Session Overview
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-metacognitive-gray">
                    {formatTime(sessionData.total_duration)}
                  </p>
                </div>
                <FiClock className="text-3xl text-mindful-blue" />
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-gray-600">Content Progress</p>
                  <p className="text-2xl font-bold text-metacognitive-gray">
                    {contentProgress || sessionData.content_progress}
                  </p>
                </div>
                <FiBookOpen className="text-3xl text-cognitive-teal" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-metacognitive-gray mb-6 flex items-center">
              <GiBrain className="mr-3 text-cognitive-teal" />
              Cognitive Metrics
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Average Focus</span>
                  <span className="font-bold text-metacognitive-gray">{sessionData.focus_score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 bg-gradient-to-r from-mindful-blue to-cognitive-teal rounded-full"
                    style={{ width: `${sessionData.focus_score}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Cognitive Load</span>
                  <span className="font-bold text-metacognitive-gray">{sessionData.cognitive_load}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    style={{ width: `${sessionData.cognitive_load}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reflection */}
        {sessionData.reflection && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 mb-8">
            <h3 className="text-xl font-bold text-metacognitive-gray mb-6 flex items-center">
              <FiTarget className="mr-3 text-orange-500" />
              Your Reflection
            </h3>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-gray-700 italic">"{sessionData.reflection}"</p>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-metacognitive-gray mb-6 flex items-center">
            <FiTrendingUp className="mr-3 text-green-500" />
            Next Steps
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/course-selection')}
              className="p-6 bg-gradient-to-r from-mindful-blue/5 to-cognitive-teal/5 border border-mindful-blue/20 rounded-xl hover:border-mindful-blue transition-colors text-center"
            >
              <FiBookOpen className="text-3xl text-mindful-blue mx-auto mb-4" />
              <h4 className="font-bold text-metacognitive-gray mb-2">Continue Learning</h4>
              <p className="text-gray-600 text-sm">Start another study session</p>
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="p-6 bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-xl hover:border-green-500 transition-colors text-center"
            >
              <GiBrain className="text-3xl text-green-500 mx-auto mb-4" />
              <h4 className="font-bold text-metacognitive-gray mb-2">View Analytics</h4>
              <p className="text-gray-600 text-sm">See your learning trends</p>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="p-6 bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-xl hover:border-purple-500 transition-colors text-center"
            >
              <FiTrendingUp className="text-3xl text-purple-500 mx-auto mb-4" />
              <h4 className="font-bold text-metacognitive-gray mb-2">Take a Break</h4>
              <p className="text-gray-600 text-sm">Rest and consolidate</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;