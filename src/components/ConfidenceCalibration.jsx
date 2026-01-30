// frontend/src/components/ConfidenceCalibration.jsx
import React, { useState } from 'react';
import { FiCheck, FiX, FiAlertTriangle, FiThumbsUp, FiThumbsDown, FiHelpCircle } from 'react-icons/fi';

const ConfidenceCalibration = ({ onSubmit, onClose }) => {
  const [selectedConfidence, setSelectedConfidence] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const confidenceLevels = [
    { level: 'low', label: 'Low Confidence', description: 'I\'m guessing or unsure', color: 'bg-red-100 text-red-700 border-red-300' },
    { level: 'medium', label: 'Medium Confidence', description: 'I think I know but not certain', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { level: 'high', label: 'High Confidence', description: 'I\'m very sure of this', color: 'bg-green-100 text-green-700 border-green-300' }
  ];

  const handleSubmit = () => {
    if (selectedConfidence) {
      onSubmit(selectedConfidence);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-float">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-alert-amber bg-opacity-10 rounded-lg mr-3">
              <FiAlertTriangle className="text-2xl text-alert-amber" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-metacognitive-gray">
                Confidence Calibration
              </h3>
              <p className="text-sm text-mindful-blue">
                MetaMind AI Analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Explanation */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <FiHelpCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800">
                Calibrating your confidence helps you distinguish between what you truly know and what you're guessing. This builds metacognitive awareness.
              </p>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
              >
                {showExplanation ? 'Hide research' : 'Why is this important?'}
              </button>
            </div>
          </div>
          
          {showExplanation && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Research shows:</strong> Students often overestimate their understanding. 
                Regular confidence calibration improves self-awareness and reduces the "illusion of competence."
              </p>
            </div>
          )}
        </div>

        {/* Main Question */}
        <div className="text-center mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            How confident are you in your answer?
          </h4>
          <p className="text-gray-600">
            Be honest with yourself. This feedback helps MetaMind personalize your learning.
          </p>
        </div>

        {/* Confidence Options */}
        <div className="space-y-3 mb-8">
          {confidenceLevels.map((level) => (
            <button
              key={level.level}
              onClick={() => setSelectedConfidence(level.level)}
              className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-200 flex items-center justify-between ${
                selectedConfidence === level.level
                  ? `${level.color} border-opacity-100 scale-[1.02] shadow-md`
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  selectedConfidence === level.level
                    ? level.level === 'low' ? 'bg-red-500' : 
                      level.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    : 'bg-gray-200'
                }`}>
                  {selectedConfidence === level.level && (
                    <FiCheck className="text-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{level.label}</div>
                  <div className="text-sm text-gray-600">{level.description}</div>
                </div>
              </div>
              {selectedConfidence === level.level && (
                <div className="text-xl">
                  {level.level === 'low' && '😕'}
                  {level.level === 'medium' && '🤔'}
                  {level.level === 'high' && '😊'}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Example Indicators */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-3 flex items-center">
            <FiAlertTriangle className="mr-2" />
            <strong>When to choose each level:</strong>
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-red-50 border border-red-100 rounded text-center">
              <div className="font-medium text-red-700">Low</div>
              <div className="text-red-600">Guessing</div>
            </div>
            <div className="p-2 bg-yellow-50 border border-yellow-100 rounded text-center">
              <div className="font-medium text-yellow-700">Medium</div>
              <div className="text-yellow-600">Partial recall</div>
            </div>
            <div className="p-2 bg-green-50 border border-green-100 rounded text-center">
              <div className="font-medium text-green-700">High</div>
              <div className="text-green-600">Automatic recall</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <FiX className="mr-2" />
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedConfidence}
            className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center transition-all ${
              selectedConfidence
                ? 'btn-primary'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FiCheck className="mr-2" />
            Submit Calibration
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-cognitive-teal rounded-full mr-2"></div>
              <span>Step 1 of 2: Confidence Calibration</span>
            </div>
            <span>Next: Review & Feedback</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-cognitive-teal h-1.5 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceCalibration;