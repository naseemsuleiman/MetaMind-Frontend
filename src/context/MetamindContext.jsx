// frontend/src/context/MetaMindContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

const MetaMindContext = createContext({});

export const useMetaMind = () => useContext(MetaMindContext);

export const MetaMindProvider = ({ children }) => {
  const { API } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  const startSession = async (subject) => {
    try {
      const response = await API.post('/sessions/', { 
        subject,
        start_time: new Date().toISOString()
      });
      setCurrentSession(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const endSession = async () => {
    if (currentSession) {
      try {
        await API.patch(`/sessions/${currentSession.id}/`, {
          end_time: new Date().toISOString()
        });
        setCurrentSession(null);
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
  };

  const trackMetric = useCallback(async (metricData) => {
    if (!currentSession) return;
    
    try {
      const response = await API.post('/metrics/analyze_and_intervene/', {
        session_id: currentSession.id,
        ...metricData
      });
      
      const { metric, intervention } = response.data;
      
      setMetrics(prev => [...prev, metric]);
      
      if (intervention) {
        setInterventions(prev => [...prev, intervention]);
        return intervention; // Return for immediate display
      }
    } catch (error) {
      console.error('Failed to track metric:', error);
    }
  }, [currentSession, API]);

  // Track scrolling behavior
  const trackScroll = useCallback(() => {
    let lastScrollY = window.scrollY;
    let scrollTimeout;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      const currentScrollY = window.scrollY;
      const scrollSpeed = Math.abs(currentScrollY - lastScrollY) * 10; // Normalize
      
      trackMetric({
        scroll_speed: scrollSpeed,
        emotional_state: scrollSpeed > 500 ? 'zoned_out' : 'focused'
      });
      
      lastScrollY = currentScrollY;
      
      scrollTimeout = setTimeout(() => {
        trackMetric({ scroll_speed: 0 });
      }, 1000);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackMetric]);

  // Track typing behavior
  const trackTyping = useCallback(() => {
    let lastKeyPress = Date.now();
    let backspaceCount = 0;
    let keyPressCount = 0;
    
    const handleKeyDown = (e) => {
      const now = Date.now();
      const latency = now - lastKeyPress;
      
      if (e.key === 'Backspace') {
        backspaceCount++;
      } else {
        keyPressCount++;
      }
      
      trackMetric({
        response_latency: latency,
        backspace_frequency: backspaceCount,
        typing_speed: keyPressCount * 2 // Estimate
      });
      
      lastKeyPress = now;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trackMetric]);

  const value = {
    currentSession,
    metrics,
    interventions,
    startSession,
    endSession,
    trackMetric,
    trackScroll,
    trackTyping
  };

  return (
    <MetaMindContext.Provider value={value}>
      {children}
    </MetaMindContext.Provider>
  );
};