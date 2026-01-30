// frontend/src/components/InterventionModal.jsx
import React from 'react';
import { FiX, FiAlertCircle, FiHelpCircle, FiClock } from 'react-icons/fi';
import { FaBrain } from "react-icons/fa";

import { GiThink } from 'react-icons/gi';

const InterventionModal = ({ intervention, onResponse, onClose }) => {
  if (!intervention) return null;

  const getIcon = () => {
    switch(intervention.intervention_type) {
      case 'socratic':
        return <GiThink className="text-3xl text-mindful-blue" />;
      case 'break_suggestion':
        return <FiClock className="text-3xl text-alert-amber" />;
      case 'strategy_shift':
        return <FaBrain className="text-3xl text-insight-purple" />;
      default:
        return <FiHelpCircle className="text-3xl text-cognitive-teal" />;
    }
  };

  const getTitle = () => {
    switch(intervention.intervention_type) {
      case 'socratic':
        return 'Metacognitive Check';
      case 'break_suggestion':
        return 'Cognitive Load Alert';
      case 'strategy_shift':
        return 'Strategy Recommendation';
      default:
        return 'AI Insight';
    }
  };

  const getResponses = () => {
    if (intervention.intervention_type === 'break_suggestion') {
      return [
        { label: 'Take a 5-min Break', value: 'break', color: 'bg-alert-amber' },
        { label: 'Switch to Easier Task', value: 'easy_task', color: 'bg-calm-green' },
        { label: 'Continue Anyway', value: 'continue', color: 'bg-gray-500' }
      ];
    }
    
    return [
      { label: 'I Understand, Continue', value: 'continue', color: 'bg-cognitive-teal' },
      { label: 'I Need More Help', value: 'need_help', color: 'bg-mindful-blue' },
      { label: 'Show Me an Example', value: 'example', color: 'bg-insight-purple' }
    ];
  };

  const responses = getResponses();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with Icon */}
        <div className="relative">
          <div className="absolute top-6 left-6 z-10">
            <div className="p-3 bg-white rounded-full shadow-lg">
              {getIcon()}
            </div>
          </div>
          <div className="h-32 bg-gradient-to-r from-mindful-blue to-cognitive-teal relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            >
              <FiX className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-metacognitive-gray mb-2">
              {getTitle()}
            </h3>
            <div className="text-sm text-mindful-blue font-medium mb-4">
              MetaMind AI Intervention
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                {intervention.message}
              </p>
            </div>
          </div>

          {/* Response Options */}
          <div className="space-y-3">
            {responses.map((response) => (
              <button
                key={response.value}
                onClick={() => onResponse(response.value)}
                className={`w-full ${response.color} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
              >
                {response.label}
              </button>
            ))}
          </div>

          {/* Metacognitive Tip */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start">
              <FiAlertCircle className="text-cognitive-teal mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Metacognitive Tip</p>
                <p className="text-xs text-gray-600">
                  These prompts are designed to help you become aware of your own thinking process.
                  Pausing to reflect improves long-term retention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterventionModal;