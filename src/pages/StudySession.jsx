// frontend/src/pages/StudySession.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import {
  FiBookOpen, FiClock, FiPause, FiPlay, FiTarget, FiTrendingUp,
  FiZap, FiHelpCircle, FiRefreshCw, FiCheck,
  FiX, FiEye, FiEyeOff, FiAlertCircle, FiBarChart2,
  FiChevronRight, FiChevronLeft, FiHash, FiBookmark, FiArrowLeft,
  FiHome, FiSave, FiEdit2, FiCheckCircle, FiXCircle, FiSend, FiStar,
  FiVolume2, FiVolumeX
} from 'react-icons/fi';
import { GiThink, GiProgression, GiLightBulb } from 'react-icons/gi';
import { FaBrain, FaQuestionCircle, FaRegLightbulb, FaPenAlt, FaExclamationTriangle, FaRegSave, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { MdOutlinePsychology, MdInsights, MdScore } from 'react-icons/md';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
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
  Filler,
  ArcElement
} from 'chart.js';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const StudySession = () => {
  const { user, loading: authLoading } = useAuth();
  const { sessionId, moduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Study state
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStart, setSessionStart] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [contentIndex, setContentIndex] = useState(0);
  const [sessionTitle, setSessionTitle] = useState("");
  const [showIntervention, setShowIntervention] = useState(false);
  const [interventionType, setInterventionType] = useState('');
  const [interventionMessage, setInterventionMessage] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState(null);
  const [showConfidenceCheck, setShowConfidenceCheck] = useState(false);
  const [reflection, setReflection] = useState('');
  const [notes, setNotes] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [moduleData, setModuleData] = useState(null);
  
  // Text-to-speech state
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  
  // Assessment state
  const [userAnswers, setUserAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [showAssessmentResults, setShowAssessmentResults] = useState(false);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [totalPossibleScore, setTotalPossibleScore] = useState(0);
  const [answerStatus, setAnswerStatus] = useState({});
  const [assessmentResults, setAssessmentResults] = useState(null);

  // PDF state
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // Metacognitive tracking
  const [focusScore, setFocusScore] = useState(85);
  const [cognitiveLoad, setCognitiveLoad] = useState(50);
  const [engagementDepth, setEngagementDepth] = useState('balanced');
  const [scrollHistory, setScrollHistory] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [sessionMetrics, setSessionMetrics] = useState({
    totalScrolls: 0,
    avgScrollSpeed: 0,
    timeOnContent: {},
    interventionCount: 0
  });

  // Refs
  const sessionTimer = useRef(null);
  const contentRef = useRef(null);
  const scrollStartTime = useRef(Date.now());
  const lastScrollPosition = useRef(0);
  const scrollEvents = useRef([]);
  const isScrolling = useRef(false);
  const autoSaveInterval = useRef(null);
  const soundRef = useRef(null);

  // Initialize TTS and sounds
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
    
    // Initialize sound for notifications
    soundRef.current = new Howl({
      src: ['https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3'],
      volume: 0.3
    });
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-to-speech function
  const speakText = useCallback((text) => {
    if (!ttsEnabled || !speechSynthesis) return;
    
    // Play notification sound
    if (soundRef.current) {
      soundRef.current.play();
    }
    
    // Wait a moment then speak the text
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      // Stop any ongoing speech
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }, 500);
  }, [speechSynthesis, ttsEnabled]);

  // Helper function to get proper PDF URL
  const getPdfUrl = useCallback((pdfPath) => {
    if (!pdfPath) return '';
    
    console.log("getPdfUrl called with:", pdfPath);
    
    // Extract actual filename from descriptive text
    if (pdfPath.includes('[PDF File:') && pdfPath.includes(']')) {
      const match = pdfPath.match(/\[PDF File:\s*(.*?\.pdf)\]/i);
      if (match && match[1]) {
        pdfPath = match[1].trim();
        console.log("Extracted filename:", pdfPath);
      }
    }
    
    // If it's already a full URL
    if (pdfPath.startsWith('http://') || pdfPath.startsWith('https://')) {
      return pdfPath;
    }
    
    // If it's a relative path
    if (pdfPath.startsWith('/')) {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      return `${apiBaseUrl}${pdfPath}`;
    }
    
    // If it's just a filename, assume it's in media directory
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    return `${apiBaseUrl}/media/${encodeURIComponent(pdfPath)}`;
  }, []);

  // Fetch module data
  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setLoading(true);
        
        // First try the modules endpoint
        const response = await api.get(`/modules/${moduleId}/`);
        
        console.log("Module Data:", response.data);
        
        setModuleData(response.data);
        
        // Format the module data
        const formattedModule = {
          id: response.data.id,
          name: response.data.name || response.data.title,
          subject: response.data.subject,
          unit: response.data.unit,
          topic: response.data.topic,
          difficulty: response.data.difficulty_level || 'intermediate',
          bloomLevel: response.data.bloom_taxonomy_target || 'understanding',
          expected_time: response.data.expected_completion_time || '30 minutes',
          contents: response.data.contents || [],
          mastery_check: response.data.mastery_check || { questions: [] },
          pdf_file: response.data.pdf_file
        };
        
        setCurrentModule(formattedModule);
        setSessionTitle(formattedModule.name);
        
        // Calculate total possible score
        calculateTotalScore(formattedModule);
        
      } catch (error) {
        console.error("Fetch error:", error);
        setError('Failed to load module data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (moduleId) {
      fetchModuleData();
    } else if (sessionId) {
      loadSessionData();
    }
  }, [moduleId, sessionId]);

  // Initialize session
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (!sessionId && !moduleId) {
      setError('No Session or Module ID found.');
      setLoading(false);
      return;
    }

    setupEventListeners();

    autoSaveInterval.current = setInterval(() => {
      saveProgress();
    }, 30000);

    const handleOnline = () => {
      setIsOnline(true);
      setSaveStatus('Back online - syncing changes');
      if (currentModule) loadSessionData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setSaveStatus('Working offline - changes saved locally');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      cleanupEventListeners();
      if (sessionTimer.current) clearInterval(sessionTimer.current);
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authLoading, user, sessionId, moduleId]);

  // Reset PDF state when content changes
  useEffect(() => {
    setNumPages(null);
    setPageNumber(1);
    setPdfError(null);
  }, [contentIndex, currentModule]);

  // PDF load success handler
  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setPdfLoading(false);
    setPdfError(null);
  }, []);

  // PDF load error handler
  const onDocumentLoadError = useCallback((error) => {
    console.error('PDF loading error:', error);
    setPdfError('Failed to load PDF. Please check the file path or try downloading it.');
    setPdfLoading(false);
  }, []);

  // Load session data
  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sessionResponse = await api.get(`/sessions/${sessionId}/`);
      const sessionData = sessionResponse.data;

      setIsActive(sessionData.is_active || false);
      if (sessionData.start_time) {
        setSessionStart(new Date(sessionData.start_time));
        const start = new Date(sessionData.start_time).getTime();
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
      }

      if (sessionData.module) {
        const moduleResponse = await api.get(`/modules/${sessionData.module}/`);
        const moduleData = moduleResponse.data;
        
        const formattedModule = {
          id: moduleData.id,
          name: moduleData.name || moduleData.title,
          subject: moduleData.subject,
          unit: moduleData.unit,
          topic: moduleData.topic,
          difficulty: moduleData.difficulty_level || 'intermediate',
          bloomLevel: moduleData.bloom_taxonomy_target || 'understanding',
          expected_time: moduleData.expected_completion_time || '30 minutes',
          contents: moduleData.contents || [],
          mastery_check: moduleData.mastery_check || { questions: [] }
        };

        setCurrentModule(formattedModule);
        setSessionTitle(formattedModule.name);

        // Load saved progress including answers
        const progressKey = `progress_${sessionId || moduleId}`;
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          setContentIndex(progress.contentIndex || 0);
          setNotes(progress.notes || '');
          setReflection(progress.reflection || '');
          setFocusScore(progress.focusScore || 85);
          setCognitiveLoad(progress.cognitiveLoad || 50);
          setUserAnswers(progress.userAnswers || {});
          setSubmittedAnswers(progress.submittedAnswers || {});
          setAnswerStatus(progress.answerStatus || {});
          setAssessmentScore(progress.assessmentScore || 0);
        }

        // Calculate total possible score
        calculateTotalScore(formattedModule);
      }

    } catch (err) {
      console.error('Error loading session:', err);
      setError('Unable to load the study session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total possible score
  const calculateTotalScore = (module) => {
    let total = 0;
    
    if (module.contents) {
      module.contents.forEach((section, sectionIndex) => {
        if (section.questions) {
          section.questions.forEach((question, qIndex) => {
            total += question.points || 1;
          });
        }
        if (section.practice_problems) {
          section.practice_problems.forEach((problem, pIndex) => {
            total += problem.points || 2;
          });
        }
      });
    }
    
    if (module.mastery_check?.questions) {
      module.mastery_check.questions.forEach((question, index) => {
        total += question.points || 3;
      });
    }
    
    setTotalPossibleScore(total);
  };

  // Save progress
  const saveProgress = useCallback(async () => {
    if (!currentModule) return;
    
    const progressData = {
      session_id: sessionId,
      module_id: moduleId,
      content_index: contentIndex,
      notes: notes,
      reflection: reflection,
      focus_score: focusScore,
      cognitive_load: cognitiveLoad,
      engagement_depth: engagementDepth,
      elapsed_time: elapsedTime,
      user_answers: userAnswers,
      submitted_answers: submittedAnswers,
      answer_status: answerStatus,
      assessment_score: assessmentScore,
      last_saved: new Date().toISOString()
    };

    const progressKey = `progress_${sessionId || moduleId}`;
    localStorage.setItem(progressKey, JSON.stringify(progressData));

    if (isOnline) {
      try {
        if (sessionId) {
          await api.patch(`/sessions/${sessionId}/progress/`, progressData);
        }
        setSaveStatus('Progress saved');
      } catch (err) {
        console.error('Failed to sync progress:', err);
        setSaveStatus('Saved locally (sync failed)');
      }
    } else {
      setSaveStatus('Saved locally (offline)');
    }
  }, [currentModule, sessionId, moduleId, contentIndex, notes, reflection, focusScore, cognitiveLoad, engagementDepth, elapsedTime, userAnswers, submittedAnswers, answerStatus, assessmentScore, isOnline]);

  // Handle answer submission
  const handleAnswerSubmit = (sectionId, questionIndex, type) => {
    const answerKey = `${sectionId}_${type}_${questionIndex}`;
    const userAnswer = userAnswers[answerKey] || '';
    
    if (!userAnswer.trim()) {
      alert('Please enter an answer before submitting.');
      return;
    }

    // Get correct answer
    const currentContent = currentModule.contents[contentIndex];
    let correctAnswer = '';
    
    if (type === 'question') {
      correctAnswer = currentContent.questions?.[questionIndex]?.answer || '';
    } else if (type === 'problem') {
      correctAnswer = currentContent.practice_problems?.[questionIndex]?.answer || '';
    } else if (type === 'mastery') {
      correctAnswer = currentModule.mastery_check?.questions?.[questionIndex]?.answer || '';
    }

    const isCorrect = checkAnswer(userAnswer, correctAnswer);
    const points = getPoints(type, isCorrect);
    
    // Update answer status
    const newAnswerStatus = {
      ...answerStatus,
      [answerKey]: {
        isCorrect,
        points,
        submittedAt: new Date().toISOString()
      }
    };
    
    setAnswerStatus(newAnswerStatus);
    
    // Update submitted answers
    const newSubmittedAnswers = {
      ...submittedAnswers,
      [answerKey]: userAnswer
    };
    
    setSubmittedAnswers(newSubmittedAnswers);
    
    // Update assessment score
    if (isCorrect) {
      setAssessmentScore(prev => prev + points);
    }
    
    // Clear the answer input
    const newUserAnswers = { ...userAnswers };
    delete newUserAnswers[answerKey];
    setUserAnswers(newUserAnswers);
    
    // Track interaction
    trackInteraction('answer_submission', {
      sectionId,
      questionIndex,
      type,
      isCorrect,
      points,
      userAnswer,
      correctAnswer
    });
    
    // Show immediate feedback
    const feedbackMessage = isCorrect 
      ? `✅ Correct! You earned ${points} point${points > 1 ? 's' : ''}.`
      : `❌ Incorrect. The answer was: ${correctAnswer}`;
    
    alert(feedbackMessage);
    
    saveProgress();
  };

  // Check answer (simple string matching for demo)
  const checkAnswer = (userAnswer, correctAnswer) => {
    if (!correctAnswer) return false;
    
    // Normalize both answers for comparison
    const normalize = (str) => str.toLowerCase().trim().replace(/[.,;:!?]/g, '');
    
    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);
    
    // Exact match
    if (normalizedUser === normalizedCorrect) return true;
    
    // Check if user answer contains correct answer
    if (normalizedUser.includes(normalizedCorrect)) return true;
    
    // Check if correct answer contains user answer
    if (normalizedCorrect.includes(normalizedUser)) return true;
    
    return false;
  };

  // Get points for answer type
  const getPoints = (type, isCorrect) => {
    if (!isCorrect) return 0;
    
    switch (type) {
      case 'question': return 1;
      case 'problem': return 2;
      case 'mastery': return 3;
      default: return 1;
    }
  };

  // Show assessment results
  const showResults = () => {
    const currentContent = currentModule?.contents?.[contentIndex] || {};
    const questions = currentContent?.questions || [];
    const problems = currentContent?.practice_problems || [];
    
    let sectionScore = 0;
    let sectionTotal = 0;
    
    // Calculate section score for questions
    questions.forEach((q, index) => {
      const answerKey = `${contentIndex}_question_${index}`;
      const status = answerStatus[answerKey];
      sectionTotal += q.points || 1;
      if (status?.isCorrect) {
        sectionScore += status.points;
      }
    });
    
    // Calculate section score for problems
    problems.forEach((p, index) => {
      const answerKey = `${contentIndex}_problem_${index}`;
      const status = answerStatus[answerKey];
      sectionTotal += p.points || 2;
      if (status?.isCorrect) {
        sectionScore += status.points;
      }
    });
    
    const percentage = sectionTotal > 0 ? Math.round((sectionScore / sectionTotal) * 100) : 0;
    
    const results = {
      sectionScore,
      sectionTotal,
      percentage,
      questions: questions.map((q, i) => ({
        question: q.question,
        userAnswer: submittedAnswers[`${contentIndex}_question_${i}`],
        correctAnswer: q.answer,
        isCorrect: answerStatus[`${contentIndex}_question_${i}`]?.isCorrect,
        points: answerStatus[`${contentIndex}_question_${i}`]?.points || 0
      })),
      problems: problems.map((p, i) => ({
        problem: p.problem,
        userAnswer: submittedAnswers[`${contentIndex}_problem_${i}`],
        correctAnswer: p.answer,
        isCorrect: answerStatus[`${contentIndex}_problem_${i}`]?.isCorrect,
        points: answerStatus[`${contentIndex}_problem_${i}`]?.points || 0
      }))
    };
    
    setAssessmentResults(results);
    setShowAssessmentResults(true);
    
    // Speak results summary
    if (ttsEnabled) {
      speakText(`Section score: ${sectionScore} out of ${sectionTotal}. That's ${percentage} percent correct.`);
    }
  };

  // Event listeners setup
  const setupEventListeners = () => {
    const handleScroll = () => {
      if (!contentRef.current || !isActive) return;
      
      const now = Date.now();
      const scrollTop = contentRef.current.scrollTop;
      const scrollHeight = contentRef.current.scrollHeight;
      const clientHeight = contentRef.current.clientHeight;
      
      if (scrollHeight <= clientHeight) return;
      
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      scrollEvents.current.push({
        time: now,
        position: scrollPercentage,
        speed: now - scrollStartTime.current
      });
      
      scrollStartTime.current = now;
      lastScrollPosition.current = scrollPercentage;
      
      setScrollHistory(prev => {
        const newHistory = [...prev, { time: now, position: scrollPercentage }];
        return newHistory.slice(-50);
      });
      
      setSessionMetrics(prev => ({
        ...prev,
        totalScrolls: prev.totalScrolls + 1
      }));
      
      analyzeEngagement(scrollPercentage, scrollEvents.current);
    };
    
    const handleKeyPress = (e) => {
      if (!isActive) return;
      
      trackInteraction('key_press', {
        key: e.key,
        timestamp: Date.now(),
        contentIndex
      });
      
      if (e.key === 'n' || e.key === 'N') {
        document.getElementById('notes-textarea')?.focus();
      }
      
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveProgress();
      }
    };
    
    const handleClick = (e) => {
      if (!isActive) return;
      
      trackInteraction('click', {
        element: e.target.tagName,
        timestamp: Date.now(),
        contentIndex
      });
    };
    
    const handleFocusChange = (e) => {
      if (!isActive) return;
      
      if (e.type === 'focus') {
        trackInteraction('gained_focus', { timestamp: Date.now() });
        setFocusScore(prev => Math.min(prev + 5, 100));
      } else if (e.type === 'blur') {
        trackInteraction('lost_focus', { timestamp: Date.now() });
        setFocusScore(prev => Math.max(prev - 10, 30));
      }
    };
    
    if (contentRef.current) {
      contentRef.current.addEventListener('scroll', handleScroll, { passive: true });
    }
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('click', handleClick);
    window.addEventListener('focus', handleFocusChange);
    window.addEventListener('blur', handleFocusChange);
  };

  const cleanupEventListeners = () => {
    if (contentRef.current) {
      contentRef.current.removeEventListener('scroll', () => {});
    }
    document.removeEventListener('keydown', () => {});
    document.removeEventListener('click', () => {});
    window.removeEventListener('focus', () => {});
    window.removeEventListener('blur', () => {});
  };

  const trackInteraction = useCallback((type, data) => {
    const interaction = {
      type,
      timestamp: Date.now(),
      ...data
    };
    
    setInteractions(prev => [...prev, interaction]);
    
    setSessionMetrics(prev => ({
      ...prev,
      timeOnContent: {
        ...prev.timeOnContent,
        [contentIndex]: (prev.timeOnContent[contentIndex] || 0) + 1
      }
    }));
  }, [contentIndex]);

  const analyzeEngagement = useCallback((scrollPosition, scrollEvents) => {
  if (scrollEvents.length < 5) return;
  
  const recentEvents = scrollEvents.slice(-10);
  const speeds = recentEvents.map(e => e.speed);
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  
  // Update engagement depth
  if (avgSpeed < 500) {
    setEngagementDepth('skimming');
    setFocusScore(prev => Math.max(prev - 2, 30));
  } else if (avgSpeed > 2000) {
    setEngagementDepth('deep');
    setFocusScore(prev => Math.min(prev + 3, 100));
  } else {
    setEngagementDepth('balanced');
  }
  
  // Update cognitive load based on scrolling pattern
  const rapidScrolls = recentEvents.filter(e => e.speed < 300).length;
  if (rapidScrolls > 3) {
    setCognitiveLoad(prev => Math.min(prev + 5, 100));
  }
  
  // Check for rapid back-and-forth scrolling (indicates confusion)
  const scrollChanges = recentEvents.filter((_, i) => i > 0).map((e, i) => 
    Math.abs(e.position - recentEvents[i].position)
  );
  const avgChange = scrollChanges.reduce((a, b) => a + b, 0) / scrollChanges.length;
  
  if (avgChange > 30) {
    // Large back-and-forth scrolling indicates high cognitive load
    setCognitiveLoad(prev => Math.min(prev + 8, 100));
  }
  
  // Trigger intervention if needed
  if (rapidScrolls > 3 && !showIntervention) {
    triggerIntervention('socratic', 
      "You're moving through this content quickly. Can you summarize what you just read in your own words?");
  }
}, [showIntervention]);

  // Timer management
useEffect(() => {
  if (isActive) {
    sessionTimer.current = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;
        
        // Update focus score every 30 seconds
        if (newTime % 30 === 0) {
          setFocusScore(prevScore => {
            // Random variation to simulate focus changes
            const variation = Math.random() > 0.5 ? 2 : -1;
            return Math.max(30, Math.min(100, prevScore + variation));
          });
        }
        
        // Update cognitive load every 60 seconds
        if (newTime % 60 === 0) {
          setCognitiveLoad(prevLoad => {
            // Gradually increase cognitive load over time
            const increase = Math.random() > 0.3 ? 3 : -1;
            return Math.max(10, Math.min(100, prevLoad + increase));
          });
        }
        
        // Check for intervention every 120 seconds
        if (newTime % 120 === 0 && !showIntervention) {
          checkForIntervention();
        }
        
        return newTime;
      });
    }, 1000);
  } else {
    if (sessionTimer.current) {
      clearInterval(sessionTimer.current);
      sessionTimer.current = null;
    }
  }
  
  return () => {
    if (sessionTimer.current) {
      clearInterval(sessionTimer.current);
      sessionTimer.current = null;
    }
  };
}, [isActive, showIntervention]);

// Update engagement depth based on cognitive metrics
useEffect(() => {
  if (focusScore > 70 && cognitiveLoad < 60) {
    setEngagementDepth('deep');
  } else if (focusScore < 50 || cognitiveLoad > 80) {
    setEngagementDepth('skimming');
  } else {
    setEngagementDepth('balanced');
  }
}, [focusScore, cognitiveLoad]);

  const checkForIntervention = useCallback(() => {
    if (showIntervention) return;
    
    const triggers = [
      {
        condition: focusScore < 60,
        type: 'socratic',
        messages: [
          "Your focus seems to be dipping. What's the main concept you're working on right now?",
          "Let's pause for a moment. Can you explain this section to an imaginary friend?",
          "Having trouble staying focused? Try summarizing the last two paragraphs in one sentence."
        ]
      },
      {
        condition: cognitiveLoad > 80,
        type: 'break',
        messages: [
          "Cognitive load is getting high. Would a 2-minute break help?",
          "This is complex material. Consider taking a short break to let it sink in.",
          "Your brain might need a reset. Let's pause and stretch for a moment."
        ]
      },
      {
        condition: engagementDepth === 'skimming' && currentModule?.contents[contentIndex]?.type === 'concept',
        type: 'strategy',
        messages: [
          "This is conceptual material. Try reading it aloud or teaching it back to yourself.",
          "Consider making quick notes or drawing diagrams for better retention.",
          "For complex concepts, try the Feynman technique: explain it simply."
        ]
      }
    ];
    
    const activeTrigger = triggers.find(t => t.condition);
    if (activeTrigger) {
      const randomMessage = activeTrigger.messages[Math.floor(Math.random() * activeTrigger.messages.length)];
      triggerIntervention(activeTrigger.type, randomMessage);
    }
  }, [focusScore, cognitiveLoad, engagementDepth, contentIndex, currentModule, showIntervention]);

const nextPage = () => {
  if (pageNumber < numPages) {
    setPageNumber(prev => prev + 1);
    trackInteraction('pdf_navigation', { direction: 'next', toPage: pageNumber + 1 });
  }
};

const prevPage = () => {
  if (pageNumber > 1) {
    setPageNumber(prev => prev - 1);
    trackInteraction('pdf_navigation', { direction: 'prev', toPage: pageNumber - 1 });
  }
};

  const triggerIntervention = useCallback((type, message) => {
    if (showIntervention) return;
    
    setInterventionType(type);
    setInterventionMessage(message);
    setShowIntervention(true);
    setSessionMetrics(prev => ({ ...prev, interventionCount: prev.interventionCount + 1 }));
    
    // Speak the intervention message
    speakText(message);
    
    setTimeout(() => {
      if (showIntervention) {
        setShowIntervention(false);
        trackInteraction('intervention_timeout', { type, message });
      }
    }, 45000);
  }, [showIntervention, trackInteraction, speakText]);

  const handleInterventionResponse = useCallback((response) => {
    trackInteraction('intervention_response', {
      type: interventionType,
      message: interventionMessage,
      response,
      focusScore,
      cognitiveLoad
    });
    
    setShowIntervention(false);
    
    if (response === 'break') {
      pauseSession();
      setTimeout(() => {
        resumeSession();
        triggerIntervention('strategy', "Break complete! Let's continue with a fresh perspective.");
      }, 120000);
    } else if (response === 'reflect') {
      document.getElementById('reflection-textarea')?.focus();
    }
  }, [interventionType, interventionMessage, focusScore, cognitiveLoad, triggerIntervention, trackInteraction]);

  // Session control functions
  const startSession = async () => {
  try {
    let response;
    if (sessionId) {
      // If we have a sessionId, resume it
      response = await api.post(`/sessions/${sessionId}/start/`);
      setIsActive(true);
      setSaveStatus('Session resumed');
      trackInteraction('session_resume', {
        elapsedTime,
        focusScore,
        cognitiveLoad
      });
    } else if (moduleId) {
      // Create a new session for the module
      response = await api.post('/sessions/', {
        module: moduleId,
        is_active: true,
        start_time: new Date().toISOString()
      });
      setIsActive(true);
      setSessionStart(new Date());
      setElapsedTime(0);
      setSaveStatus('Session started');
      trackInteraction('session_start', {
        module: currentModule?.name,
        subject: currentModule?.subject,
        unit: currentModule?.unit,
        topic: currentModule?.topic
      });
    }
  } catch (err) {
    console.error('Error starting session:', err);
    setError('Failed to start session. Please try again.');
  }
};

  const pauseSession = async () => {
    try {
      if (sessionId) {
        await api.post(`/sessions/${sessionId}/pause/`);
      }
      setIsActive(false);
      trackInteraction('session_pause', {
        elapsedTime,
        focusScore,
        cognitiveLoad
      });
      saveProgress();
      setSaveStatus('Session paused');
    } catch (err) {
      console.error('Error pausing session:', err);
    }
  };

  const resumeSession = async () => {
    try {
      if (sessionId) {
        await api.post(`/sessions/${sessionId}/resume/`);
      }
      setIsActive(true);
      trackInteraction('session_resume', {
        elapsedTime
      });
      setSaveStatus('Session resumed');
    } catch (err) {
      console.error('Error resuming session:', err);
    }
  };

  const stopSession = async () => {
  setIsActive(false);
  
  if (sessionTimer.current) {
    clearInterval(sessionTimer.current);
    sessionTimer.current = null;
  }
  
  saveProgress();
  
  const sessionData = {
    module: currentModule?.id,
    subject: currentModule?.subject,
    unit: currentModule?.unit,
    topic: currentModule?.topic,
    end_time: new Date().toISOString(),
    total_duration: elapsedTime,
    focus_score: focusScore,
    cognitive_load: cognitiveLoad,
    engagement_depth: engagementDepth,
    content_progress: `${contentIndex + 1}/${currentModule?.contents?.length || 0}`,
    notes: notes,
    reflection: reflection,
    user_answers: submittedAnswers,
    assessment_score: assessmentScore,
    total_possible_score: totalPossibleScore,
    interventions_triggered: sessionMetrics.interventionCount,
    scroll_patterns: scrollEvents.current.slice(-100),
    interactions: interactions.slice(-50)
  };
  
  try {
    if (sessionId) {
      console.log("Sending complete request...");
      // FIXED: Used backticks ( ` ) instead of single quotes ( ' )
      await api.post(`/sessions/${sessionId}/complete/`, sessionData);
      console.log("Request successful, about to navigate...");
    }
    
    localStorage.removeItem(`progress_${sessionId || moduleId}`);
    navigate('/dashboard');

  } catch (error) {
    console.error('Error saving session:', error);
    
    // ONLY logout if it's a 401 Unauthorized
    if (error.response?.status === 401) {
      console.log("Session expired, logging out...");
      logout(); 
      navigate('/login');
    } else {
      // If it's a 404 or 500, save to local storage so you don't lose data
      const sessionKey = `completed_session_${Date.now()}`;
      localStorage.setItem(sessionKey, JSON.stringify({
        ...sessionData,
        saved_locally: true,
        sync_failed: true,
        error: error.message
      }));
      navigate('/dashboard');
    }
  }
};
  const nextContent = () => {
  if (currentModule?.contents && contentIndex < currentModule.contents.length - 1) {
    trackInteraction('content_navigation', {
      from: contentIndex,
      to: contentIndex + 1,
      timeSpent: sessionMetrics.timeOnContent[contentIndex] || 0
    });
    
    setContentIndex(prev => prev + 1);
    
    // Trigger confidence check 40% of the time
    if (Math.random() < 0.4 && ttsEnabled) {
      setTimeout(() => {
        setShowConfidenceCheck(true);
        speakText("Confidence check: Before moving on, how well do you understand this content?");
      }, 1000);
    }
    
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    
    saveProgress();
  } else if (currentModule?.contents && contentIndex === currentModule.contents.length - 1) {
    const message = "You've completed all sections! Consider reviewing the mastery check questions.";
    triggerIntervention('strategy', message);
  }
};

  const prevContent = () => {
    if (contentIndex > 0) {
      trackInteraction('content_navigation', {
        from: contentIndex,
        to: contentIndex - 1
      });
      setContentIndex(prev => prev - 1);
      
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      
      saveProgress();
    }
  };

  const handleConfidenceSubmit = () => {
    trackInteraction('confidence_check', {
      contentIndex,
      confidenceLevel,
      timestamp: new Date().toISOString()
    });
    
    setShowConfidenceCheck(false);
    setConfidenceLevel(null);
    
    if (confidenceLevel === 'high') {
      setFocusScore(prev => Math.min(prev + 5, 100));
      speakText("Great! You're feeling confident. Let's continue.");
    } else if (confidenceLevel === 'low') {
      setFocusScore(prev => Math.max(prev - 5, 30));
      speakText("It's okay to review. Consider going back or taking notes.");
    } else {
      speakText("Moving on to the next section.");
    }
    
    saveProgress();
  };

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render markdown content
  const renderMarkdown = (content) => {
    if (!content) return null;
    
    return content.split('\n').map((line, idx) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-2xl font-bold text-metacognitive-gray mt-2 mb-4">
            {trimmedLine.replace('# ', '')}
          </h1>
        );
      } else if (trimmedLine.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-bold text-metacognitive-gray mt-6 mb-4">
            {trimmedLine.replace('## ', '')}
          </h2>
        );
      } else if (trimmedLine.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-metacognitive-gray mt-4 mb-3">
            {trimmedLine.replace('### ', '')}
          </h3>
        );
      } else if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split('**');
        return (
          <p key={idx} className="text-gray-700 my-3 leading-relaxed">
            {parts.map((part, i) => 
              i % 2 === 1 ? (
                <strong key={i} className="font-semibold">{part}</strong>
              ) : (
                part
              )
            )}
          </p>
        );
      } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        return (
          <li key={idx} className="text-gray-700 my-1 ml-6 list-disc">
            {trimmedLine.substring(2)}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmedLine)) {
        return (
          <li key={idx} className="text-gray-700 my-1 ml-6 list-decimal">
            {trimmedLine.replace(/^\d+\.\s/, '')}
          </li>
        );
      } else if (trimmedLine.startsWith('```')) {
        return (
          <pre key={idx} className="bg-gray-800 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto">
            {content.split('\n').slice(idx + 1).join('\n').split('```')[0]}
          </pre>
        );
      } else if (trimmedLine === '') {
        return <br key={idx} />;
      } else {
        return (
          <p key={idx} className="text-gray-700 my-3 leading-relaxed">
            {line}
          </p>
        );
      }
    });
  };

  // Chart data
  const focusChartData = {
    labels: Array.from({ length: 20 }, (_, i) => `${i * 15}s`),
    datasets: [
      {
        label: 'Focus',
        data: Array.from({ length: 20 }, (_, i) => {
          const base = focusScore;
          const trend = -i * 0.8;
          const noise = (Math.random() - 0.5) * 10;
          return Math.max(30, Math.min(100, base + trend + noise));
        }),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Cognitive Load',
        data: Array.from({ length: 20 }, (_, i) => {
          const base = cognitiveLoad;
          const trend = i * 1.2;
          const noise = (Math.random() - 0.5) * 8;
          return Math.max(0, Math.min(100, base + trend + noise));
        }),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const engagementChartData = {
    labels: ['Skimming', 'Balanced', 'Deep'],
    datasets: [{
      data: [
        engagementDepth === 'skimming' ? 60 : 20,
        engagementDepth === 'balanced' ? 60 : 20,
        engagementDepth === 'deep' ? 60 : 20
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(16, 185, 129, 0.7)'
      ],
      borderWidth: 1
    }]
  };

  const scoreChartData = {
    labels: ['Your Score', 'Remaining'],
    datasets: [{
      data: [assessmentScore, Math.max(0, totalPossibleScore - assessmentScore)],
      backgroundColor: [
        'rgba(16, 185, 129, 0.7)',
        'rgba(209, 213, 219, 0.7)'
      ],
      borderWidth: 1
    }]
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-light to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mindful-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metacognitive-gray">Loading study materials...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching content from server</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-light to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="text-2xl text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-metacognitive-gray mb-2">Unable to Load Content</h2>
          <p className="text-gray-600 mb-4">{error || 'Module not found'}</p>
          {!isOnline && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-yellow-500 mr-2" />
                <span className="text-yellow-700 text-sm">You are currently offline</span>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-mindful-blue text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
            >
              <FiHome className="mr-2" />
              Back to Dashboard
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
            >
              <FiRefreshCw className="mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentContent = currentModule.contents?.[contentIndex] || {
    id: 1,
    type: "info",
    title: "No Content Available",
    content: "This module doesn't have any content yet. Please check back later or contact your administrator.",
    questions: [],
    practice_problems: []
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light to-gray-100">
      {/* Status Bar */}
      <div className="sticky top-0 z-50">
        {!isOnline && (
          <div className="bg-yellow-500 text-white text-center py-2 text-sm flex items-center justify-center">
            <FaExclamationTriangle className="mr-2" />
            ⚠️ You're offline. Using cached content. Changes saved locally.
          </div>
        )}
        {saveStatus && (
          <div className="bg-blue-500 text-white text-center py-1 text-xs">
            {saveStatus} • Auto-save enabled • Press Ctrl+S to save
          </div>
        )}
      </div>
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-metacognitive-gray transition-colors"
              >
                <FiHome className="mr-2" />
                Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="font-medium text-metacognitive-gray">{sessionTitle}</h1>
                <p className="text-sm text-gray-500">
                  {currentModule.contents?.length > 0 
                    ? `Section ${contentIndex + 1} of ${currentModule.contents.length}`
                    : 'No content sections'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Score indicator */}
              <div className="hidden md:block">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Score</p>
                  <div className="flex items-center">
                    <MdScore className="text-yellow-500 mr-1" />
                    <span className="font-bold text-metacognitive-gray">
                      {assessmentScore}/{totalPossibleScore}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Focus indicator */}
              <div className="hidden md:block">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Focus</p>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-mindful-blue to-cognitive-teal rounded-full transition-all duration-500"
                        style={{ width: `${focusScore}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-metacognitive-gray">{focusScore}%</span>
                  </div>
                </div>
              </div>
              
              {/* Timer */}
              <div className="flex items-center space-x-2">
                <FiClock className="text-gray-500" />
                <span className="font-mono font-bold text-metacognitive-gray">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              
              {/* TTS Toggle */}
              <button
                onClick={() => {
                  setTtsEnabled(!ttsEnabled);
                  if (!ttsEnabled && speechSynthesis) {
                    speakText("Text to speech is now enabled.");
                  }
                }}
                className="flex items-center text-gray-600 hover:text-gray-800"
                title={ttsEnabled ? "Disable TTS" : "Enable TTS"}
              >
                {ttsEnabled ? <FiVolume2 className="mr-1" /> : <FiVolumeX className="mr-1" />}
                TTS
              </button>
              
              {/* Save button */}
              <button
                onClick={saveProgress}
                className="flex items-center text-gray-600 hover:text-gray-800"
                title="Save progress (Ctrl+S)"
              >
                <FaRegSave className="mr-1" />
                Save
              </button>
              
              {/* Session controls */}
<div className="flex space-x-2">
  {!isActive && !sessionStart ? (
    <button
      onClick={startSession}
      className="px-4 py-2 bg-gradient-to-r from-mindful-blue to-cognitive-teal text-white rounded-lg hover:opacity-90 transition flex items-center shadow-md"
    >
      <FiPlay className="mr-2" />
      Start Session
    </button>
  ) : !isActive ? (
    <button
      onClick={startSession}  // Changed from resumeSession to startSession
      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition flex items-center"
    >
      <FiPlay className="mr-2" />
      Start  {/* Changed from Resume to Start */}
    </button>
  ) : (
    <button
      onClick={pauseSession}
      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 transition flex items-center"
    >
      <FiPause className="mr-2" />
      Pause
    </button>
  )}
  
  <button
    onClick={stopSession}
    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center"
  >
    <FiCheck className="mr-2" />
    Complete
  </button>
</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Study Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Content Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                        currentContent.type === 'concept' 
                          ? 'bg-purple-100 text-purple-700'
                          : currentContent.type === 'example'
                          ? 'bg-blue-100 text-blue-700'
                          : currentContent.type === 'practice'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <FiHash className="mr-2" />
                        {currentContent.type ? currentContent.type.toUpperCase() : 'CONTENT'}
                      </span>
                      <span className="px-3 py-1 bg-mindful-blue/10 text-mindful-blue rounded-full text-sm font-medium capitalize">
                        {currentModule.difficulty}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-metacognitive-gray">
                      {currentContent.title}
                    </h2>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Bloom Level</div>
                    <div className="text-lg font-bold text-cognitive-teal capitalize">
                      {currentModule.bloomLevel}
                    </div>
                  </div>
                </div>
                
                {/* Progress indicator */}
                {currentModule.contents?.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Module Progress</span>
                      <span>{Math.round(((contentIndex + 1) / currentModule.contents.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-mindful-blue to-cognitive-teal rounded-full transition-all duration-500"
                        style={{ width: `${((contentIndex + 1) / currentModule.contents.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Body */}
              <div 
                ref={contentRef}
                className="p-8 h-[500px] overflow-y-auto focus:outline-none"
                tabIndex="0"
              >
                {currentContent.content_type === 'pdf' || 
                 (typeof currentContent.content === 'string' && 
                  (currentContent.content.endsWith('.pdf') || 
                   currentContent.content.includes('pdf'))) ? (
                  <div className="w-full border-0 rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-t-lg">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                          disabled={pageNumber <= 1}
                          className="px-3 py-1 bg-white border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {pageNumber} of {numPages || '--'}
                        </span>
                        <button
                          onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || prev))}
                          disabled={pageNumber >= (numPages || 1)}
                          className="px-3 py-1 bg-white border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
                        >
                          Next
                        </button>
                      </div>
                      <a 
                        href={getPdfUrl(currentContent.content || moduleData?.pdf_file)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <FiSave className="mr-1" />
                        Download PDF
                      </a>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg overflow-auto h-[400px]">
                      <Document
                        file={getPdfUrl(currentContent.content || moduleData?.pdf_file)} 
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="w-12 h-12 border-4 border-mindful-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-gray-500">Loading PDF...</p>
                            </div>
                          </div>
                        }
                        error={
                          <div className="flex items-center justify-center h-full p-8">
                            <div className="text-center">
                              <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
                              <h3 className="text-lg font-bold text-gray-700 mb-2">Unable to Load PDF</h3>
                              <p className="text-gray-600 mb-4">The PDF file could not be loaded. Please check:</p>
                              <ul className="text-left text-sm text-gray-600 mb-6">
                                <li className="mb-1">• Is the file path correct?</li>
                                <li className="mb-1">• Does the file exist on the server?</li>
                                <li className="mb-1">• Are you connected to the internet?</li>
                              </ul>
                              <a 
                                href={getPdfUrl(currentContent.content)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
                              >
                                Try Direct Download
                              </a>
                            </div>
                          </div>
                        }
                      >
                        <Page 
                          pageNumber={pageNumber} 
                          width={800}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                        />
                      </Document>
                    </div>
                    
                    {pdfError && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <FiAlertCircle className="text-red-500 mr-2" />
                          <span className="font-medium text-red-700">PDF Loading Error</span>
                        </div>
                        <p className="text-sm text-red-600">{pdfError}</p>
                        <div className="mt-3 text-sm text-gray-500">
                          PDF URL: {getPdfUrl(currentContent.content)}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  renderMarkdown(currentContent.content)
                )}
                
                {/* Questions and Practice Problems Container */}
                {(currentContent.questions?.length > 0 || currentContent.practice_problems?.length > 0) && (
                  <div className="mt-8 space-y-8">
                    {/* Review Questions */}
                    {currentContent.questions && currentContent.questions.length > 0 && currentContent.questions[0] !== '' && (
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <h4 className="text-lg font-bold text-blue-700 mb-4 flex items-center">
                          <FaQuestionCircle className="mr-3" />
                          Review Questions
                        </h4>
                        <ul className="space-y-6">
                          {currentContent.questions.filter(q => q && q.question && q.question.trim()).map((question, idx) => {
                            const answerKey = `${contentIndex}_question_${idx}`;
                            const submittedAnswer = submittedAnswers[answerKey];
                            const status = answerStatus[answerKey];
                            
                            return (
                              <li key={idx} className="bg-white p-4 rounded-lg border border-blue-100">
                                <div className="flex items-start">
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mr-3 mt-1">
                                    {idx + 1}
                                  </span>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                      <span className="text-gray-700 font-medium">{question.question}</span>
                                      {status && (
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                          {status.isCorrect ? `+${status.points} pts` : '0 pts'}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {submittedAnswer ? (
                                      <div className="space-y-2">
                                        <div className="text-sm">
                                          <span className="font-medium text-gray-600">Your answer: </span>
                                          <span className={`${status?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                            {submittedAnswer}
                                          </span>
                                        </div>
                                        {!status?.isCorrect && question.answer && (
                                          <div className="text-sm">
                                            <span className="font-medium text-gray-600">Correct answer: </span>
                                            <span className="text-green-600">{question.answer}</span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <textarea
                                          value={userAnswers[answerKey] || ''}
                                          onChange={(e) => setUserAnswers(prev => ({ ...prev, [answerKey]: e.target.value }))}
                                          placeholder="Type your answer here..."
                                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                          rows="2"
                                        />
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs text-gray-500">
                                            Points: {question.points || 1}
                                          </span>
                                          <button
                                            onClick={() => handleAnswerSubmit(contentIndex, idx, 'question')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center text-sm"
                                          >
                                            <FiSend className="mr-2" />
                                            Submit Answer
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    
                    {/* Practice Problems */}
                    {currentContent.practice_problems && currentContent.practice_problems.length > 0 && currentContent.practice_problems[0] !== '' && (
                      <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                        <h4 className="text-lg font-bold text-yellow-700 mb-4 flex items-center">
                          <FaPenAlt className="mr-3" />
                          Practice Problems
                        </h4>
                        <ul className="space-y-6">
                          {currentContent.practice_problems.filter(p => p && p.problem && p.problem.trim()).map((problem, idx) => {
                            const answerKey = `${contentIndex}_problem_${idx}`;
                            const submittedAnswer = submittedAnswers[answerKey];
                            const status = answerStatus[answerKey];
                            
                            return (
                              <li key={idx} className="bg-white p-4 rounded-lg border border-yellow-100">
                                <div className="flex items-start">
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold mr-3 mt-1">
                                    {idx + 1}
                                  </span>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                      <span className="text-gray-700 font-medium">{problem.problem}</span>
                                      {status && (
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                          {status.isCorrect ? `+${status.points} pts` : '0 pts'}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {submittedAnswer ? (
                                      <div className="space-y-2">
                                        <div className="text-sm">
                                          <span className="font-medium text-gray-600">Your answer: </span>
                                          <span className={`${status?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                            {submittedAnswer}
                                          </span>
                                        </div>
                                        {!status?.isCorrect && problem.answer && (
                                          <div className="text-sm">
                                            <span className="font-medium text-gray-600">Correct answer: </span>
                                            <span className="text-green-600">{problem.answer}</span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <textarea
                                          value={userAnswers[answerKey] || ''}
                                          onChange={(e) => setUserAnswers(prev => ({ ...prev, [answerKey]: e.target.value }))}
                                          placeholder="Type your solution here..."
                                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                                          rows="2"
                                        />
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs text-gray-500">
                                            Points: {problem.points || 2}
                                          </span>
                                          <button
                                            onClick={() => handleAnswerSubmit(contentIndex, idx, 'problem')}
                                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center text-sm"
                                          >
                                            <FiSend className="mr-2" />
                                            Submit Solution
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content Footer with Navigation */}
              {currentModule.contents?.length > 0 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={prevContent}
                      disabled={contentIndex === 0}
                      className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <FiChevronLeft className="mr-2" />
                      Previous
                    </button>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">
                        Section {contentIndex + 1} of {currentModule.contents.length}
                      </div>
                      <div className="flex space-x-2">
                        {currentModule.contents.map((_, idx) => (
                          <div 
                            key={idx}
                            className={`w-3 h-3 rounded-full ${
                              idx === contentIndex 
                                ? 'bg-mindful-blue' 
                                : idx < contentIndex 
                                ? 'bg-green-500' 
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={nextContent}
                      disabled={contentIndex === currentModule.contents.length - 1}
                      className="px-6 py-3 bg-gradient-to-r from-mindful-blue to-cognitive-teal text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      Next
                      <FiChevronRight className="ml-2" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Assessment Results Button */}
            {((currentContent.questions && currentContent.questions.length > 0) || 
              (currentContent.practice_problems && currentContent.practice_problems.length > 0)) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-metacognitive-gray mb-2">Assessment Results</h3>
                    <p className="text-gray-600 text-sm">
                      Check your performance on this section's questions and problems
                    </p>
                  </div>
                  <button
                    onClick={showResults}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition flex items-center"
                  >
                    <FiBarChart2 className="mr-2" />
                    View Results
                  </button>
                </div>
              </div>
            )}

            {/* Reflection & Notes Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Reflection */}
                <div>
                  <h3 className="text-lg font-bold text-metacognitive-gray mb-4 flex items-center">
                    <GiThink className="mr-3 text-mindful-blue" />
                    Reflection
                  </h3>
                  <textarea
                    id="reflection-textarea"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="What did you learn? What questions do you still have? What was challenging?"
                    className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindful-blue focus:border-mindful-blue resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Writing reflections improves retention by up to 50%
                  </p>
                </div>
                
                {/* Notes */}
                <div>
                  <h3 className="text-lg font-bold text-metacognitive-gray mb-4 flex items-center">
                    <FaPenAlt className="mr-3 text-cognitive-teal" />
                    Study Notes
                  </h3>
                  <textarea
                    id="notes-textarea"
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setSaveStatus('Saving...');
                      setTimeout(() => setSaveStatus('Notes saved'), 1000);
                    }}
                    placeholder="Key concepts, formulas, definitions, or personal insights..."
                    className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindful-blue focus:border-mindful-blue resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      Press 'N' to focus • Auto-saves every 30s
                    </span>
                    <button
                      onClick={saveProgress}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FiSave className="mr-1" />
                      Save Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Metacognitive Dashboard */}
          <div className="space-y-6">
            {/* Score Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-metacognitive-gray mb-6 flex items-center">
                <MdScore className="mr-3 text-yellow-500" />
                Score Summary
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-metacognitive-gray mb-2">
                    {assessmentScore}/{totalPossibleScore}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Points Earned
                  </div>
                </div>
                
                <div className="h-40">
                  <Pie 
                    data={scoreChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.label}: ${context.raw} points`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {assessmentScore > 0 ? Math.round((assessmentScore / totalPossibleScore) * 100) : 0}%
                    </div>
                    <div className="text-xs text-green-700">Score</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {Object.keys(submittedAnswers).length}
                    </div>
                    <div className="text-xs text-blue-700">Submitted</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cognitive Metrics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-metacognitive-gray mb-6 flex items-center">
                <FaBrain className="mr-3 text-mindful-blue" />
                Cognitive Metrics
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Focus Level</span>
                    <span className="font-bold text-metacognitive-gray">{focusScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        focusScore > 70 ? 'bg-green-500' :
                        focusScore > 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${focusScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Cognitive Load</span>
                    <span className="font-bold text-metacognitive-gray">{cognitiveLoad}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        cognitiveLoad < 60 ? 'bg-green-500' :
                        cognitiveLoad < 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${cognitiveLoad}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Engagement Depth</span>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        engagementDepth === 'deep' ? 'bg-green-500' :
                        engagementDepth === 'balanced' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-bold text-metacognitive-gray capitalize">{engagementDepth}</span>
                    </div>
                  </div>
                  <div className="h-24 mt-2">
                    <Bar 
                      data={engagementChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { display: false },
                          x: { grid: { display: false } }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Focus Trend */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-metacognitive-gray mb-6 flex items-center">
                <FiTrendingUp className="mr-3 text-cognitive-teal" />
                Cognitive Trends
              </h3>
              <div className="h-48">
                <Line 
                  data={focusChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: {
                      y: { min: 0, max: 100 }
                    }
                  }}
                />
              </div>
            </div>

            {/* Session Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-metacognitive-gray mb-6 flex items-center">
                <FiBarChart2 className="mr-3 text-purple-500" />
                Session Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-metacognitive-gray">
                    {interactions.length}
                  </div>
                  <div className="text-sm text-gray-600">Interactions</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-metacognitive-gray">
                    {sessionMetrics.interventionCount}
                  </div>
                  <div className="text-sm text-gray-600">Guides</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-metacognitive-gray">
                    {Math.round(elapsedTime / 60)}
                  </div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-metacognitive-gray">
                    {scrollHistory.length}
                  </div>
                  <div className="text-sm text-gray-600">Scrolls</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-metacognitive-gray mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => document.getElementById('reflection-textarea')?.focus()}
                  className="w-full py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center justify-center"
                >
                  <GiThink className="mr-2" />
                  Add Reflection
                </button>
                <button
                  onClick={() => triggerIntervention('socratic', "What's one thing you're still unclear about?")}
                  className="w-full py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center justify-center"
                >
                  <FaQuestionCircle className="mr-2" />
                  Ask for Help
                </button>
                <button
                  onClick={pauseSession}
                  className="w-full py-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-100 transition flex items-center justify-center"
                >
                  <FiPause className="mr-2" />
                  Take a Break
                </button>
                <button
                  onClick={saveProgress}
                  className="w-full py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
                >
                  <FiSave className="mr-2" />
                  Save Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Interventions Modal */}
      <AnimatePresence>
        {showIntervention && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowIntervention(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* TTS Controls */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => speakText(interventionMessage)}
                  disabled={isSpeaking}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  title={isSpeaking ? "Currently speaking" : "Read message aloud"}
                >
                  {isSpeaking ? (
                    <FiPause className="text-gray-700" />
                  ) : (
                    <FiVolume2 className="text-gray-700" />
                  )}
                </button>
              </div>
              
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto ${
                interventionType === 'socratic' ? 'bg-mindful-blue/10' :
                interventionType === 'break' ? 'bg-orange-500/10' :
                'bg-green-500/10'
              }`}>
                {interventionType === 'socratic' ? (
                  <GiThink className="text-3xl text-mindful-blue" />
                ) : interventionType === 'break' ? (
                  <FiPause className="text-3xl text-orange-500" />
                ) : (
                  <GiLightBulb className="text-3xl text-green-500" />
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-metacognitive-gray text-center mb-4">
                {interventionType === 'socratic' ? 'Thinking Prompt' :
                 interventionType === 'break' ? 'Break Time' :
                 'Learning Tip'}
              </h3>
              
              <p className="text-gray-600 text-center mb-8 text-lg leading-relaxed">
                {interventionMessage}
              </p>
              
              <div className="space-y-3">
                {interventionType === 'socratic' ? (
                  <>
                    <button
                      onClick={() => handleInterventionResponse('reflect')}
                      className="w-full py-4 bg-gradient-to-r from-mindful-blue to-cognitive-teal text-white rounded-xl font-medium hover:opacity-90 transition shadow-md"
                    >
                      I'll Reflect on This
                    </button>
                    <button
                      onClick={() => handleInterventionResponse('skip')}
                      className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                    >
                      Continue for Now
                    </button>
                  </>
                ) : interventionType === 'break' ? (
                  <>
                    <button
                      onClick={() => handleInterventionResponse('break')}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:opacity-90 transition shadow-md"
                    >
                      Take a 2-Minute Break
                    </button>
                    <button
                      onClick={() => handleInterventionResponse('continue')}
                      className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                    >
                      I'm Focused, Continue
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleInterventionResponse('apply')}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:opacity-90 transition shadow-md"
                    >
                      Try This Strategy
                    </button>
                    <button
                      onClick={() => handleInterventionResponse('dismiss')}
                      className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                    >
                      Not Now
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confidence Check Modal */}
      <AnimatePresence>
        {showConfidenceCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 mx-auto">
                <FiTarget className="text-3xl text-purple-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-metacognitive-gray text-center mb-4">
                Confidence Check
              </h3>
              
              <p className="text-gray-600 text-center mb-8">
                Before moving on, how well do you understand this content?
              </p>
              
              <div className="space-y-3 mb-8">
                {[
                  { level: 'low', label: 'Need to review', color: 'from-red-500 to-orange-500' },
                  { level: 'medium', label: 'Somewhat understand', color: 'from-yellow-500 to-amber-500' },
                  { level: 'high', label: 'Confident', color: 'from-green-500 to-emerald-500' }
                ].map((option) => (
                  <button
                    key={option.level}
                    onClick={() => setConfidenceLevel(option.level)}
                    className={`w-full py-4 rounded-xl font-medium transition-all ${
                      confidenceLevel === option.level
                        ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowConfidenceCheck(false);
                    setConfidenceLevel(null);
                  }}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Skip
                </button>
                <button
                  onClick={handleConfidenceSubmit}
                  disabled={!confidenceLevel}
                  className="flex-1 py-4 bg-gradient-to-r from-mindful-blue to-cognitive-teal text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit & Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assessment Results Modal */}
      <AnimatePresence>
        {showAssessmentResults && assessmentResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAssessmentResults(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-metacognitive-gray">Assessment Results</h3>
                <button
                  onClick={() => setShowAssessmentResults(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {assessmentResults.sectionScore}/{assessmentResults.sectionTotal}
                    </div>
                    <div className="text-lg font-medium text-blue-700 mb-1">Section Score</div>
                    <div className="text-sm text-blue-600">
                      {assessmentResults.percentage}% Correct
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {assessmentScore}/{totalPossibleScore}
                    </div>
                    <div className="text-lg font-medium text-green-700 mb-1">Overall Score</div>
                    <div className="text-sm text-green-600">
                      {totalPossibleScore > 0 ? Math.round((assessmentScore / totalPossibleScore) * 100) : 0}% of Module
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Questions Results */}
              {assessmentResults.questions.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-blue-700 mb-4 flex items-center">
                    <FaQuestionCircle className="mr-3" />
                    Review Questions Results
                  </h4>
                  <div className="space-y-4">
                    {assessmentResults.questions.map((q, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-gray-700">{q.question}</div>
                          <div className={`px-2 py-1 text-xs font-medium rounded-full ${q.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {q.isCorrect ? `+${q.points} pts` : '0 pts'}
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Your answer:</span>
                            <div className={`mt-1 p-2 rounded ${q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {q.userAnswer || 'No answer submitted'}
                            </div>
                          </div>
                          {!q.isCorrect && q.correctAnswer && (
                            <div>
                              <span className="font-medium text-gray-600">Correct answer:</span>
                              <div className="mt-1 p-2 rounded bg-green-100 text-green-700">
                                {q.correctAnswer}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Practice Problems Results */}
              {assessmentResults.problems.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-yellow-700 mb-4 flex items-center">
                    <FaPenAlt className="mr-3" />
                    Practice Problems Results
                  </h4>
                  <div className="space-y-4">
                    {assessmentResults.problems.map((p, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${p.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-gray-700">{p.problem}</div>
                          <div className={`px-2 py-1 text-xs font-medium rounded-full ${p.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {p.isCorrect ? `+${p.points} pts` : '0 pts'}
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Your solution:</span>
                            <div className={`mt-1 p-2 rounded ${p.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {p.userAnswer || 'No solution submitted'}
                            </div>
                          </div>
                          {!p.isCorrect && p.correctAnswer && (
                            <div>
                              <span className="font-medium text-gray-600">Correct solution:</span>
                              <div className="mt-1 p-2 rounded bg-green-100 text-green-700">
                                {p.correctAnswer}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAssessmentResults(false)}
                  className="w-full py-4 bg-gradient-to-r from-mindful-blue to-cognitive-teal text-white rounded-xl font-medium hover:opacity-90 transition"
                >
                  Close Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudySession;