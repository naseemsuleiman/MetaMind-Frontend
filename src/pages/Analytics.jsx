// frontend/src/pages/Analytics.jsx
import React, { useState } from 'react';
import { 
  FiTrendingUp, FiActivity, FiTarget, FiClock,
  FiBarChart2, FiEye, FiCalendar 
} from 'react-icons/fi';
import { FaBrain } from "react-icons/fa";

import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
);

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');

  // Focus Over Time Data
  const focusData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Focus Score',
        data: [65, 78, 82, 75, 90, 85, 88],
        borderColor: '#3AB8A2',
        backgroundColor: 'rgba(58, 184, 162, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Study Time Distribution
  const studyTimeData = {
    labels: ['Math', 'Science', 'History', 'Coding', 'Language'],
    datasets: [
      {
        label: 'Hours',
        data: [12, 8, 5, 15, 7],
        backgroundColor: [
          '#4A6FA5',
          '#3AB8A2',
          '#7E5BEF',
          '#FFB74D',
          '#81C784'
        ]
      }
    ]
  };

  // Metacognitive Skills Radar
  const skillsData = {
    labels: ['Planning', 'Monitoring', 'Evaluating', 'Regulating', 'Adapting'],
    datasets: [
      {
        label: 'Current Skills',
        data: [85, 78, 82, 75, 70],
        backgroundColor: 'rgba(58, 184, 162, 0.2)',
        borderColor: '#3AB8A2',
        pointBackgroundColor: '#3AB8A2',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3AB8A2'
      },
      {
        label: 'Target Skills',
        data: [90, 85, 90, 85, 85],
        backgroundColor: 'rgba(74, 111, 165, 0.2)',
        borderColor: '#4A6FA5',
        pointBackgroundColor: '#4A6FA5',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4A6FA5'
      }
    ]
  };

  // Intervention Effectiveness
  const interventionData = {
    labels: ['Socratic', 'Confidence', 'Break', 'Strategy'],
    datasets: [
      {
        label: 'Effectiveness',
        data: [85, 72, 90, 68],
        backgroundColor: '#7E5BEF',
        borderRadius: 6
      }
    ]
  };

  const stats = [
    { label: 'Avg Focus Score', value: '8.2/10', icon: <FiTarget />, change: '+0.4', color: 'text-cognitive-teal' },
    { label: 'Study Efficiency', value: '47% gain', icon: <FiTrendingUp />, change: '+12%', color: 'text-mindful-blue' },
    { label: 'AI Interventions', value: '156 total', icon: <FiBrain />, change: '+23', color: 'text-insight-purple' },
    { label: 'Avg Session Time', value: '42 mins', icon: <FiClock />, change: '+8 mins', color: 'text-alert-amber' },
  ];

  const recommendations = [
    {
      title: 'Improve Morning Focus',
      description: 'Your focus peaks at 10 AM. Schedule complex tasks then.',
      icon: <FiActivity />
    },
    {
      title: 'Take More Breaks',
      description: 'You tend to push through fatigue. Try Pomodoro technique.',
      icon: <FiClock />
    },
    {
      title: 'Review Math Concepts',
      description: 'Logic errors increased in algebra. Review fundamentals.',
      icon: <FaBrain />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-metacognitive-gray mb-2">
          Learning Analytics
        </h1>
        <p className="text-mindful-blue">
          Deep insights into your metacognitive patterns and progress
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-2">
          {['day', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg capitalize ${
                timeRange === range
                  ? 'bg-mindful-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        
        <button className="flex items-center text-mindful-blue hover:text-mindful-blue-dark">
          <FiCalendar className="mr-2" />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-metacognitive-gray">{stat.value}</p>
                <p className="text-sm text-green-500 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-opacity-10 ${stat.color.replace('text-', 'bg-')}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Focus Over Time */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-metacognitive-gray flex items-center">
              <FiActivity className="mr-2" />
              Focus Over Time
            </h3>
          </div>
          <Line 
            data={focusData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }}
          />
        </div>

        {/* Study Time Distribution */}
        <div className="card">
          <h3 className="text-xl font-semibold text-metacognitive-gray mb-6 flex items-center">
            <FiClock className="mr-2" />
            Study Time Distribution
          </h3>
          <Bar 
            data={studyTimeData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              }
            }}
          />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Metacognitive Skills */}
        <div className="card">
          <h3 className="text-xl font-semibold text-metacognitive-gray mb-6 flex items-center">
            <FiBrain className="mr-2" />
            Metacognitive Skills
          </h3>
          <div className="h-80">
            <Radar 
              data={skillsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      stepSize: 20
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Intervention Effectiveness */}
        <div className="card">
          <h3 className="text-xl font-semibold text-metacognitive-gray mb-6 flex items-center">
            <FiBarChart2 className="mr-2" />
            Intervention Effectiveness
          </h3>
          <div className="h-80">
            <Bar 
              data={interventionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-xl font-semibold text-metacognitive-gray mb-6 flex items-center">
          <FiEye className="mr-2" />
          AI Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-6 hover:border-mindful-blue transition-colors">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-mindful-blue bg-opacity-10 rounded-lg mr-3">
                  <div className="text-mindful-blue">{rec.icon}</div>
                </div>
                <h4 className="font-semibold text-lg">{rec.title}</h4>
              </div>
              <p className="text-gray-600">{rec.description}</p>
              <button className="mt-4 text-mindful-blue hover:underline text-sm font-medium">
                View Details →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;