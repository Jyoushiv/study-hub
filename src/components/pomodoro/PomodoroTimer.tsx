'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PomodoroSession {
  id: number;
  date: string;
  duration: number;
  completed: boolean;
}

const PomodoroTimer: React.FC = () => {
  // Timer states
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  
  // Timer settings
  const [pomodoroLength, setPomodoroLength] = useState(25);
  const [shortBreakLength, setShortBreakLength] = useState(5);
  const [longBreakLength, setLongBreakLength] = useState(15);
  const [currentMode, setCurrentMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  
  // Refs for tracking time
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  
  // Sound effect for timer completion
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/notification.mp3');
    
    // Load sessions from localStorage if available
    const savedSessions = localStorage.getItem('pomodoroSessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  
  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
  }, [sessions]);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            clearInterval(interval!);
            setIsActive(false);
            setIsPaused(false);
            
            // Play notification sound
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.error('Error playing audio:', e));
            }
            
            // Complete the session if it was a pomodoro
            if (currentMode === 'pomodoro' && currentSessionId !== null) {
              completeSession(currentSessionId);
            }
            
            return;
          }
          
          // Decrement minute and reset seconds
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Decrement seconds
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, minutes, seconds, currentMode, currentSessionId]);
  
  // Start timer
  const startTimer = () => {
    if (!isActive) {
      // Create a new session if starting a pomodoro
      if (currentMode === 'pomodoro') {
        const newSessionId = Date.now();
        const newSession: PomodoroSession = {
          id: newSessionId,
          date: new Date().toISOString(),
          duration: 0,
          completed: false
        };
        
        setSessions(prev => [...prev, newSession]);
        setCurrentSessionId(newSessionId);
        startTimeRef.current = Date.now();
        pausedTimeRef.current = 0;
      }
      
      setIsActive(true);
      setIsPaused(false);
    } else if (isPaused) {
      // Resume from pause
      setIsPaused(false);
      
      // Update paused time
      if (startTimeRef.current) {
        pausedTimeRef.current += Date.now() - startTimeRef.current;
      }
      startTimeRef.current = Date.now();
    }
  };
  
  // Pause timer
  const pauseTimer = () => {
    if (isActive && !isPaused) {
      setIsPaused(true);
      startTimeRef.current = Date.now();
    }
  };
  
  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    
    // Reset to the appropriate time based on current mode
    if (currentMode === 'pomodoro') {
      setMinutes(pomodoroLength);
    } else if (currentMode === 'shortBreak') {
      setMinutes(shortBreakLength);
    } else {
      setMinutes(longBreakLength);
    }
    
    setSeconds(0);
    
    // If resetting during an active pomodoro, update the session
    if (currentMode === 'pomodoro' && currentSessionId !== null) {
      const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);
      if (sessionIndex !== -1) {
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          duration: calculateSessionDuration(),
          completed: false
        };
        
        setSessions(updatedSessions);
      }
    }
    
    setCurrentSessionId(null);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  };
  
  // Complete a session
  const completeSession = (sessionId: number) => {
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      const updatedSessions = [...sessions];
      updatedSessions[sessionIndex] = {
        ...updatedSessions[sessionIndex],
        duration: calculateSessionDuration(),
        completed: true
      };
      
      setSessions(updatedSessions);
    }
    
    setCurrentSessionId(null);
  };
  
  // Calculate session duration
  const calculateSessionDuration = (): number => {
    if (!startTimeRef.current) return 0;
    
    const endTime = isPaused ? startTimeRef.current : Date.now();
    const totalPausedTime = pausedTimeRef.current;
    const totalActiveTime = endTime - startTimeRef.current;
    
    return Math.floor((totalActiveTime - totalPausedTime) / 1000);
  };
  
  // Switch timer mode
  const switchMode = (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    // If there's an active session, update its duration
    if (isActive && currentMode === 'pomodoro' && currentSessionId !== null) {
      const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);
      if (sessionIndex !== -1) {
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          duration: calculateSessionDuration(),
          completed: false
        };
        
        setSessions(updatedSessions);
      }
    }
    
    setCurrentMode(mode);
    setIsActive(false);
    setIsPaused(false);
    setCurrentSessionId(null);
    
    // Set appropriate time based on mode
    if (mode === 'pomodoro') {
      setMinutes(pomodoroLength);
    } else if (mode === 'shortBreak') {
      setMinutes(shortBreakLength);
    } else {
      setMinutes(longBreakLength);
    }
    
    setSeconds(0);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  };
  
  // Format time as MM:SS
  const formatTime = (mins: number, secs: number): string => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get completed sessions for today
  const getTodaySessions = (): PomodoroSession[] => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(session => 
      session.completed && session.date.startsWith(today)
    );
  };
  
  // Get total completed pomodoros for today
  const getTodayCompletedCount = (): number => {
    return getTodaySessions().length;
  };
  
  return (
    <div className="pomodoro-container p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 max-w-md mx-auto">
      <div className="timer-modes flex justify-center mb-4 space-x-2">
        <button 
          onClick={() => switchMode('pomodoro')}
          className={`px-4 py-2 rounded-md transition-colors ${
            currentMode === 'pomodoro' 
              ? 'bg-rose-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Pomodoro
        </button>
        <button 
          onClick={() => switchMode('shortBreak')}
          className={`px-4 py-2 rounded-md transition-colors ${
            currentMode === 'shortBreak' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Short Break
        </button>
        <button 
          onClick={() => switchMode('longBreak')}
          className={`px-4 py-2 rounded-md transition-colors ${
            currentMode === 'longBreak' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Long Break
        </button>
      </div>
      
      <div className="timer-display text-8xl font-bold text-center my-8">
        {formatTime(minutes, seconds)}
      </div>
      
      <div className="timer-controls flex justify-center space-x-4 mb-6">
        {!isActive || isPaused ? (
          <button 
            onClick={startTimer}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
          >
            {isPaused ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button 
            onClick={pauseTimer}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors"
          >
            Pause
          </button>
        )}
        <button 
          onClick={resetTimer}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
        >
          Reset
        </button>
      </div>
      
      <div className="session-info text-center text-gray-600 dark:text-gray-400">
        <p>Today's completed pomodoros: {getTodayCompletedCount()}</p>
      </div>
      
      <div className="timer-settings mt-8 p-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Timer Settings</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Pomodoro</label>
            <input 
              type="number" 
              min="1"
              max="60"
              value={pomodoroLength}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value > 0 && value <= 60) {
                  setPomodoroLength(value);
                  if (currentMode === 'pomodoro' && !isActive) {
                    setMinutes(value);
                  }
                }
              }}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Short Break</label>
            <input 
              type="number" 
              min="1"
              max="30"
              value={shortBreakLength}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value > 0 && value <= 30) {
                  setShortBreakLength(value);
                  if (currentMode === 'shortBreak' && !isActive) {
                    setMinutes(value);
                  }
                }
              }}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Long Break</label>
            <input 
              type="number" 
              min="1"
              max="60"
              value={longBreakLength}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value > 0 && value <= 60) {
                  setLongBreakLength(value);
                  if (currentMode === 'longBreak' && !isActive) {
                    setMinutes(value);
                  }
                }
              }}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
