// frontend/src/pages/CourseSelection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiBook, FiChevronRight, FiClock, FiTarget, FiTrendingUp,
  FiGrid, FiBookOpen, FiLayers, FiBarChart2, FiBookmark
} from 'react-icons/fi';
import { GiBrain, GiBookshelf, GiProgression } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';

const CourseSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [userProgress, setUserProgress] = useState({});

  // Comprehensive course structure
  const courses = {
    mathematics: {
      title: "Mathematics",
      icon: "∫",
      color: "from-purple-500 to-purple-600",
      description: "From basic algebra to advanced calculus",
      units: [
        {
          id: 'basic_math',
          title: "Basic Mathematics",
          icon: "🔢",
          description: "Foundational concepts for beginners",
          estimatedTime: 20,
          prerequisites: [],
          topics: [
            {
              id: 'arithmetic',
              title: "Arithmetic Operations",
              difficulty: "Beginner",
              estimatedTime: 45,
              bloomLevel: "Understanding",
              progress: 65
            },
            {
              id: 'algebra_fundamentals',
              title: "Algebra Fundamentals",
              difficulty: "Beginner",
              estimatedTime: 60,
              bloomLevel: "Applying",
              progress: 40
            },
            {
              id: 'fractions_decimals',
              title: "Fractions & Decimals",
              difficulty: "Beginner",
              estimatedTime: 50,
              bloomLevel: "Applying",
              progress: 20
            },
            {
              id: 'basic_geometry',
              title: "Basic Geometry",
              difficulty: "Beginner",
              estimatedTime: 55,
              bloomLevel: "Understanding",
              progress: 0
            }
          ]
        },
        {
          id: 'algebra',
          title: "Algebra",
          icon: "𝑥",
          description: "Equations, functions, and advanced algebra",
          estimatedTime: 35,
          prerequisites: ['basic_math'],
          topics: [
            {
              id: 'linear_equations',
              title: "Linear Equations",
              difficulty: "Intermediate",
              estimatedTime: 75,
              bloomLevel: "Applying",
              progress: 80
            },
            {
              id: 'quadratic_equations',
              title: "Quadratic Equations",
              difficulty: "Intermediate",
              estimatedTime: 90,
              bloomLevel: "Analyzing",
              progress: 60
            },
            {
              id: 'functions',
              title: "Functions & Graphs",
              difficulty: "Intermediate",
              estimatedTime: 120,
              bloomLevel: "Evaluating",
              progress: 30
            },
            {
              id: 'polynomials',
              title: "Polynomials",
              difficulty: "Intermediate",
              estimatedTime: 85,
              bloomLevel: "Applying",
              progress: 10
            }
          ]
        },
        {
          id: 'calculus',
          title: "Calculus",
          icon: "∫",
          description: "Limits, derivatives, and integrals",
          estimatedTime: 45,
          prerequisites: ['algebra'],
          topics: [
            {
              id: 'limits',
              title: "Limits & Continuity",
              difficulty: "Advanced",
              estimatedTime: 120,
              bloomLevel: "Analyzing",
              progress: 70
            },
            {
              id: 'derivatives',
              title: "Derivatives",
              difficulty: "Advanced",
              estimatedTime: 150,
              bloomLevel: "Applying",
              progress: 45
            },
            {
              id: 'integrals',
              title: "Integrals",
              difficulty: "Advanced",
              estimatedTime: 180,
              bloomLevel: "Evaluating",
              progress: 20
            },
            {
              id: 'applications',
              title: "Applications of Calculus",
              difficulty: "Advanced",
              estimatedTime: 200,
              bloomLevel: "Creating",
              progress: 0
            }
          ]
        },
        {
          id: 'linear_algebra',
          title: "Linear Algebra",
          icon: "⟡",
          description: "Vectors, matrices, and transformations",
          estimatedTime: 40,
          prerequisites: ['algebra'],
          topics: [
            {
              id: 'vector_spaces',
              title: "Vector Spaces",
              difficulty: "Advanced",
              estimatedTime: 160,
              bloomLevel: "Analyzing",
              progress: 85
            },
            {
              id: 'matrices',
              title: "Matrices & Determinants",
              difficulty: "Advanced",
              estimatedTime: 140,
              bloomLevel: "Applying",
              progress: 50
            },
            {
              id: 'linear_transformations',
              title: "Linear Transformations",
              difficulty: "Advanced",
              estimatedTime: 180,
              bloomLevel: "Evaluating",
              progress: 15
            },
            {
              id: 'eigenvalues',
              title: "Eigenvalues & Eigenvectors",
              difficulty: "Advanced",
              estimatedTime: 200,
              bloomLevel: "Creating",
              progress: 0
            }
          ]
        },
        {
          id: 'probability',
          title: "Probability & Statistics",
          icon: "📊",
          description: "Data analysis and statistical inference",
          estimatedTime: 35,
          prerequisites: ['basic_math'],
          topics: [
            {
              id: 'basic_probability',
              title: "Basic Probability",
              difficulty: "Intermediate",
              estimatedTime: 90,
              bloomLevel: "Understanding",
              progress: 90
            },
            {
              id: 'distributions',
              title: "Probability Distributions",
              difficulty: "Intermediate",
              estimatedTime: 120,
              bloomLevel: "Applying",
              progress: 60
            },
            {
              id: 'statistical_inference',
              title: "Statistical Inference",
              difficulty: "Advanced",
              estimatedTime: 180,
              bloomLevel: "Evaluating",
              progress: 25
            },
            {
              id: 'regression',
              title: "Regression Analysis",
              difficulty: "Advanced",
              estimatedTime: 200,
              bloomLevel: "Creating",
              progress: 0
            }
          ]
        }
      ]
    },
    physics: {
      title: "Physics",
      icon: "⚛️",
      color: "from-blue-500 to-cyan-500",
      description: "Classical and modern physics",
      units: [
        {
          id: 'mechanics',
          title: "Classical Mechanics",
          icon: "🏋️",
          description: "Motion, forces, and energy",
          estimatedTime: 30,
          prerequisites: [],
          topics: [
            { id: 'kinematics', title: "Kinematics", difficulty: "Beginner", progress: 75 },
            { id: 'dynamics', title: "Dynamics", difficulty: "Intermediate", progress: 50 },
            { id: 'energy', title: "Work & Energy", difficulty: "Intermediate", progress: 30 }
          ]
        },
        {
          id: 'electromagnetism',
          title: "Electromagnetism",
          icon: "⚡",
          description: "Electricity, magnetism, and circuits",
          estimatedTime: 40,
          prerequisites: ['mechanics'],
          topics: [
            { id: 'electrostatics', title: "Electrostatics", difficulty: "Intermediate", progress: 60 },
            { id: 'magnetism', title: "Magnetism", difficulty: "Advanced", progress: 25 }
          ]
        }
      ]
    },
    computer_science: {
      title: "Computer Science",
      icon: "💻",
      color: "from-green-500 to-emerald-600",
      description: "Programming, algorithms, and systems",
      units: [
        {
          id: 'programming',
          title: "Programming Fundamentals",
          icon: "⌨️",
          description: "Coding basics and problem solving",
          estimatedTime: 25,
          prerequisites: [],
          topics: [
            { id: 'python_basics', title: "Python Basics", difficulty: "Beginner", progress: 90 },
            { id: 'data_structures', title: "Data Structures", difficulty: "Intermediate", progress: 65 }
          ]
        }
      ]
    }
  };

  useEffect(() => {
    // Simulate fetching user progress from API
    const progressData = {
      mathematics: {
        basic_math: {
          arithmetic: 65,
          algebra_fundamentals: 40,
          fractions_decimals: 20,
          basic_geometry: 0
        },
        algebra: {
          linear_equations: 80,
          quadratic_equations: 60,
          functions: 30,
          polynomials: 10
        },
        calculus: {
          limits: 70,
          derivatives: 45,
          integrals: 20,
          applications: 0
        },
        linear_algebra: {
          vector_spaces: 85,
          matrices: 50,
          linear_transformations: 15,
          eigenvalues: 0
        },
        probability: {
          basic_probability: 90,
          distributions: 60,
          statistical_inference: 25,
          regression: 0
        }
      }
    };
    setUserProgress(progressData);
  }, []);

  const handleStartLearning = () => {
    if (selectedSubject && selectedUnit && selectedTopic) {
      navigate(`/study-session?subject=${selectedSubject}&unit=${selectedUnit}&topic=${selectedTopic}`);
    }
  };

  const getTopicProgress = (subject, unitId, topicId) => {
    return userProgress[subject]?.[unitId]?.[topicId] || 0;
  };

  const getUnitProgress = (subject, unitId) => {
    const unit = courses[subject]?.units.find(u => u.id === unitId);
    if (!unit) return 0;
    
    const topicsProgress = unit.topics.map(topic => 
      getTopicProgress(subject, unitId, topic.id)
    );
    
    return topicsProgress.length > 0 
      ? Math.round(topicsProgress.reduce((a, b) => a + b, 0) / topicsProgress.length)
      : 0;
  };

  const getNextRecommendedTopic = () => {
    if (!selectedSubject) return null;
    
    const subjectData = courses[selectedSubject];
    for (const unit of subjectData.units) {
      for (const topic of unit.topics) {
        const progress = getTopicProgress(selectedSubject, unit.id, topic.id);
        if (progress < 100) {
          return { subject: selectedSubject, unit: unit.id, topic: topic.id, ...topic };
        }
      }
    }
    return null;
  };

  const nextTopic = getNextRecommendedTopic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-metacognitive-gray mb-2">
                Choose Your Learning Path
              </h1>
              <p className="text-gray-600">
                Select a subject, then explore units and topics
              </p>
            </div>
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition flex items-center"
            >
              Back to Dashboard
            </Link>
          </div>
          
          {nextTopic && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-mindful-blue/10 to-cognitive-teal/10 border border-mindful-blue/20 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <GiProgression className="text-mindful-blue mr-3 text-xl" />
                    <h3 className="text-lg font-semibold text-metacognitive-gray">
                      Continue Learning
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    Based on your progress, we recommend continuing with:{' '}
                    <span className="font-semibold">{nextTopic.title}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedSubject(nextTopic.subject);
                    setSelectedUnit(nextTopic.unit);
                    setSelectedTopic(nextTopic.topic);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-mindful-blue to-cognitive-teal text-white rounded-xl hover:opacity-90 transition"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Subject Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-metacognitive-gray mb-6 flex items-center">
                <FiGrid className="mr-3" />
                Select Subject
              </h2>
              
              <div className="space-y-4">
                {Object.entries(courses).map(([key, course]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedSubject(key);
                      setSelectedUnit(null);
                      setSelectedTopic(null);
                    }}
                    className={`w-full p-5 rounded-xl text-left transition-all ${
                      selectedSubject === key
                        ? `bg-gradient-to-r ${course.color} text-white shadow-lg`
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-4">{course.icon}</span>
                        <div>
                          <h3 className="font-bold text-lg">{course.title}</h3>
                          <p className={`text-sm ${selectedSubject === key ? 'opacity-90' : 'text-gray-500'}`}>
                            {course.description}
                          </p>
                        </div>
                      </div>
                      <FiChevronRight className={`text-xl ${selectedSubject === key ? 'opacity-80' : 'text-gray-400'}`} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Middle: Unit Selection */}
          <div className="lg:col-span-2">
            {selectedSubject ? (
              <>
                {/* Unit Selection */}
                {!selectedUnit ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">
                          {courses[selectedSubject].icon}
                        </span>
                        <div>
                          <h2 className="text-2xl font-bold text-metacognitive-gray">
                            {courses[selectedSubject].title}
                          </h2>
                          <p className="text-gray-600">
                            Select a learning unit
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedSubject(null)}
                        className="px-4 py-2 text-gray-600 hover:text-metacognitive-gray"
                      >
                        Change Subject
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {courses[selectedSubject].units.map((unit) => {
                        const progress = getUnitProgress(selectedSubject, unit.id);
                        const isAvailable = unit.prerequisites.every(prereq => 
                          getUnitProgress(selectedSubject, prereq) > 70
                        );
                        
                        return (
                          <motion.div
                            key={unit.id}
                            whileHover={{ y: -5 }}
                            className={`p-6 rounded-xl border-2 transition-all ${
                              isAvailable
                                ? 'border-gray-200 hover:border-mindful-blue hover:shadow-lg cursor-pointer'
                                : 'border-gray-100 opacity-60'
                            }`}
                            onClick={() => isAvailable && setSelectedUnit(unit.id)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center mb-2">
                                  <span className="text-2xl mr-3">{unit.icon}</span>
                                  <h3 className="text-lg font-bold text-metacognitive-gray">
                                    {unit.title}
                                  </h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                  {unit.description}
                                </p>
                              </div>
                              {!isAvailable && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  Locked
                                </span>
                              )}
                            </div>
                            
                            <div className="mb-4">
                              <div className="flex justify-between text-sm text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 bg-gradient-to-r from-mindful-blue to-cognitive-teal rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-gray-500">
                                <FiClock className="mr-2" />
                                {unit.estimatedTime} hrs
                              </div>
                              <div className="flex items-center">
                                {unit.topics.map((topic, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full mx-1 ${
                                      getTopicProgress(selectedSubject, unit.id, topic.id) > 0
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                    }`}
                                    title={topic.title}
                                  />
                                ))}
                                <span className="text-gray-500 ml-2">
                                  {unit.topics.length} topics
                                </span>
                              </div>
                            </div>
                            
                            {!isAvailable && (
                              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-700 text-sm">
                                  Complete prerequisites first
                                </p>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Topic Selection */
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <button
                            onClick={() => setSelectedUnit(null)}
                            className="flex items-center text-gray-600 hover:text-metacognitive-gray mb-2"
                          >
                            <FiChevronRight className="rotate-180 mr-2" />
                            Back to Units
                          </button>
                          <div className="flex items-center">
                            <span className="text-2xl mr-4">
                              {courses[selectedSubject].units.find(u => u.id === selectedUnit)?.icon}
                            </span>
                            <div>
                              <h2 className="text-2xl font-bold text-metacognitive-gray">
                                {courses[selectedSubject].units.find(u => u.id === selectedUnit)?.title}
                              </h2>
                              <p className="text-gray-600">
                                Select a topic to start learning
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Unit Progress</div>
                          <div className="text-2xl font-bold text-mindful-blue">
                            {getUnitProgress(selectedSubject, selectedUnit)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-700">
                          {courses[selectedSubject].units.find(u => u.id === selectedUnit)?.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {courses[selectedSubject].units
                        .find(u => u.id === selectedUnit)
                        ?.topics.map((topic) => {
                          const progress = getTopicProgress(selectedSubject, selectedUnit, topic.id);
                          
                          return (
                            <motion.div
                              key={topic.id}
                              whileHover={{ scale: 1.01 }}
                              className={`p-6 rounded-xl border-2 transition-all ${
                                selectedTopic === topic.id
                                  ? 'border-mindful-blue bg-gradient-to-r from-mindful-blue/5 to-cognitive-teal/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedTopic(topic.id)}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <h3 className="text-xl font-bold text-metacognitive-gray">
                                      {topic.title}
                                    </h3>
                                    <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                                      topic.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                      topic.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {topic.difficulty}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 mb-4">
                                    Estimated time: {topic.estimatedTime} minutes
                                  </p>
                                </div>
                                
                                {selectedTopic === topic.id ? (
                                  <div className="flex items-center">
                                    <button
                                      onClick={handleStartLearning}
                                      className="px-6 py-3 bg-gradient-to-r from-mindful-blue to-cognitive-teal text-white rounded-xl hover:opacity-90 transition flex items-center"
                                    >
                                      <FiBookOpen className="mr-2" />
                                      Start Learning
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-mindful-blue mb-1">
                                      {progress}%
                                    </div>
                                    <div className="text-sm text-gray-500">Progress</div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-500 mb-1">
                                  <span>Learning Progress</span>
                                  <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div 
                                    className="h-3 rounded-full transition-all ${
                                      progress < 30 ? 'bg-red-500' :
                                      progress < 70 ? 'bg-yellow-500' :
                                      'bg-green-500'
                                    }"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center text-gray-500">
                                    <FiTarget className="mr-2" />
                                    Bloom Level: {topic.bloomLevel}
                                  </div>
                                  <div className="flex items-center text-gray-500">
                                    <FiClock className="mr-2" />
                                    {topic.estimatedTime} min
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  {progress === 100 ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                      Completed ✓
                                    </span>
                                  ) : progress > 0 ? (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                      In Progress
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                      Not Started
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Welcome State */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-mindful-blue/10 to-cognitive-teal/10 flex items-center justify-center mx-auto mb-6">
                  <GiBrain className="text-4xl text-mindful-blue" />
                </div>
                <h3 className="text-2xl font-bold text-metacognitive-gray mb-4">
                  Select a Subject to Begin
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Choose from Mathematics, Physics, or Computer Science to start your learning journey. 
                  Each subject is organized into units and topics for structured learning.
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm text-gray-600">Beginner Friendly</div>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm text-gray-600">Progress Tracking</div>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm text-gray-600">AI Guided</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {selectedSubject && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-mindful-blue/10 mr-4">
                  <FiBook className="text-xl text-mindful-blue" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-metacognitive-gray">
                    {courses[selectedSubject]?.units.length || 0}
                  </div>
                  <div className="text-gray-600">Learning Units</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-cognitive-teal/10 mr-4">
                  <FiLayers className="text-xl text-cognitive-teal" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-metacognitive-gray">
                    {selectedSubject ? 
                      courses[selectedSubject]?.units.reduce((total, unit) => total + unit.topics.length, 0) : 0
                    }
                  </div>
                  <div className="text-gray-600">Topics Available</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-green-500/10 mr-4">
                  <FiTrendingUp className="text-xl text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-metacognitive-gray">
                    {selectedSubject ? 
                      Math.round(
                        courses[selectedSubject]?.units.reduce((totalProgress, unit) => {
                          const unitProgress = getUnitProgress(selectedSubject, unit.id);
                          return totalProgress + unitProgress;
                        }, 0) / (courses[selectedSubject]?.units.length || 1)
                      ) : 0
                    }%
                  </div>
                  <div className="text-gray-600">Overall Progress</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-purple-500/10 mr-4">
                  <FiClock className="text-xl text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-metacognitive-gray">
                    {selectedSubject ? 
                      courses[selectedSubject]?.units.reduce((total, unit) => total + unit.estimatedTime, 0) : 0
                    }h
                  </div>
                  <div className="text-gray-600">Total Estimated Time</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSelection;