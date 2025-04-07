'use client';

import React, { useState } from 'react';
import { ThemeProvider } from '../components/theme/ThemeProvider';
import ThemeSelector from '../components/theme/ThemeSelector';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import FlowchartEditor from '../components/flowchart/FlowchartEditor';
import Timetable from '../components/timetable/Timetable';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'flowchart' | 'timetable'>('pomodoro');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 text-text">
        <header className="bg-primary/10 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h1 className="text-2xl font-bold text-primary mb-4 md:mb-0">Productivity Hub</h1>
              
              <div className="flex items-center space-x-4">
                <ThemeSelector />
              </div>
            </div>
            
            <nav className="mt-6">
              <ul className="flex space-x-1 overflow-x-auto pb-1">
                <li>
                  <button
                    onClick={() => setActiveTab('pomodoro')}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${
                      activeTab === 'pomodoro'
                        ? 'bg-primary text-white'
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    Pomodoro Timer
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('flowchart')}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${
                      activeTab === 'flowchart'
                        ? 'bg-primary text-white'
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    Flowchart
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className={`px-4 py-2 rounded-t-lg transition-colors ${
                      activeTab === 'timetable'
                        ? 'bg-primary text-white'
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    Timetable
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {activeTab === 'pomodoro' && <PomodoroTimer />}
            {activeTab === 'flowchart' && <FlowchartEditor />}
            {activeTab === 'timetable' && <Timetable />}
          </div>
        </main>
        
        <footer className="bg-primary/10 border-t border-primary/20 py-6">
          <div className="container mx-auto px-4">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>© 2025 Productivity Hub. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
