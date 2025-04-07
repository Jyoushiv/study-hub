'use client';

import React, { useState, useEffect } from 'react';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  color: string;
}

interface TimetableProps {
  initialView?: 'daily' | 'weekly';
}

const Timetable: React.FC<TimetableProps> = ({ initialView = 'daily' }) => {
  const [view, setView] = useState<'daily' | 'weekly'>(initialView);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Time range for the timetable
  const startHour = 6; // 6 AM
  const endHour = 22; // 10 PM
  
  // Days of the week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Color options for time slots
  const colorOptions = [
    '#f87171', // red
    '#fb923c', // orange
    '#facc15', // yellow
    '#4ade80', // green
    '#60a5fa', // blue
    '#a78bfa', // purple
    '#f472b6', // pink
  ];
  
  // Load time slots from localStorage on component mount
  useEffect(() => {
    const savedTimeSlots = localStorage.getItem('timetableSlots');
    if (savedTimeSlots) {
      setTimeSlots(JSON.parse(savedTimeSlots));
    }
  }, []);
  
  // Save time slots to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timetableSlots', JSON.stringify(timeSlots));
  }, [timeSlots]);
  
  // Format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Format time as HH:MM
  const formatTime = (hour: number, minute: number = 0): string => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };
  
  // Parse time string to get hours and minutes
  const parseTime = (timeString: string): { hours: number; minutes: number } => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  };
  
  // Get the current week's dates
  const getCurrentWeekDates = (): Date[] => {
    const dates: Date[] = [];
    const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the first day of the week (Sunday)
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - currentDay);
    
    // Add all days of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  // Navigate to previous day/week
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'daily') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };
  
  // Navigate to next day/week
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'daily') {
      newDate.setDate(currentDate.getDate() + 1);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Open modal to add a new time slot
  const openAddModal = (day: string, time: string) => {
    const timeObj = parseTime(time);
    const endTimeObj = { hours: timeObj.hours + 1, minutes: timeObj.minutes };
    
    setEditingSlot({
      id: Date.now().toString(),
      day,
      startTime: time,
      endTime: formatTime(endTimeObj.hours, endTimeObj.minutes),
      title: '',
      description: '',
      color: colorOptions[0]
    });
    
    setSelectedDay(day);
    setSelectedTime(time);
    setShowModal(true);
  };
  
  // Open modal to edit an existing time slot
  const openEditModal = (slot: TimeSlot) => {
    setEditingSlot({ ...slot });
    setSelectedDay(slot.day);
    setSelectedTime(slot.startTime);
    setShowModal(true);
  };
  
  // Save time slot (add new or update existing)
  const saveTimeSlot = () => {
    if (!editingSlot) return;
    
    // Validate time slot
    const startTimeObj = parseTime(editingSlot.startTime);
    const endTimeObj = parseTime(editingSlot.endTime);
    
    if (
      startTimeObj.hours > endTimeObj.hours || 
      (startTimeObj.hours === endTimeObj.hours && startTimeObj.minutes >= endTimeObj.minutes)
    ) {
      alert('End time must be after start time');
      return;
    }
    
    // Check for existing slot with same ID
    const existingSlotIndex = timeSlots.findIndex(slot => slot.id === editingSlot.id);
    
    if (existingSlotIndex >= 0) {
      // Update existing slot
      const updatedSlots = [...timeSlots];
      updatedSlots[existingSlotIndex] = editingSlot;
      setTimeSlots(updatedSlots);
    } else {
      // Add new slot
      setTimeSlots([...timeSlots, editingSlot]);
    }
    
    // Close modal
    setShowModal(false);
    setEditingSlot(null);
  };
  
  // Delete time slot
  const deleteTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    setShowModal(false);
    setEditingSlot(null);
  };
  
  // Generate time slots for the timetable
  const generateTimeSlots = () => {
    const slots = [];
    
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(formatTime(hour));
    }
    
    return slots;
  };
  
  // Get time slots for a specific day
  const getTimeSlotsForDay = (day: string) => {
    return timeSlots.filter(slot => slot.day === day);
  };
  
  // Calculate position and height for a time slot in the grid
  const calculateSlotStyle = (slot: TimeSlot) => {
    const startTimeObj = parseTime(slot.startTime);
    const endTimeObj = parseTime(slot.endTime);
    
    // Calculate start position (in percentage)
    const startPosition = ((startTimeObj.hours - startHour) * 60 + startTimeObj.minutes) / ((endHour - startHour + 1) * 60) * 100;
    
    // Calculate height (in percentage)
    const durationMinutes = (endTimeObj.hours - startTimeObj.hours) * 60 + (endTimeObj.minutes - startTimeObj.minutes);
    const height = durationMinutes / ((endHour - startHour + 1) * 60) * 100;
    
    return {
      top: `${startPosition}%`,
      height: `${height}%`,
      backgroundColor: slot.color,
    };
  };
  
  // Render daily view
  const renderDailyView = () => {
    const dayName = daysOfWeek[currentDate.getDay()];
    const formattedDate = formatDate(currentDate);
    const dayKey = `${dayName}-${formattedDate}`;
    const timeSlotsList = generateTimeSlots();
    
    return (
      <div className="daily-view">
        <div className="day-header text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
          <h2 className="text-xl font-semibold">{dayName}</h2>
          <p className="text-gray-600 dark:text-gray-400">{currentDate.toLocaleDateString()}</p>
        </div>
        
        <div className="time-grid grid grid-cols-[80px_1fr] border-t border-l border-gray-200 dark:border-gray-700">
          {timeSlotsList.map((time, index) => (
            <React.Fragment key={time}>
              {/* Time label */}
              <div className="time-label p-2 border-b border-r border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                {time}
              </div>
              
              {/* Time slot cell */}
              <div 
                className="time-cell relative border-b border-r border-gray-200 dark:border-gray-700 h-16 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => openAddModal(dayKey, time)}
              >
                {/* Render time slots for this day and time */}
                {getTimeSlotsForDay(dayKey)
                  .filter(slot => {
                    const slotStartTime = parseTime(slot.startTime);
                    const slotEndTime = parseTime(slot.endTime);
                    const cellTime = parseTime(time);
                    
                    return (
                      (slotStartTime.hours < cellTime.hours + 1 && slotEndTime.hours > cellTime.hours) ||
                      (slotStartTime.hours === cellTime.hours && slotStartTime.minutes <= 59) ||
                      (slotEndTime.hours === cellTime.hours && slotEndTime.minutes > 0)
                    );
                  })
                  .map(slot => (
                    <div
                      key={slot.id}
                      className="absolute left-0 right-0 mx-1 p-1 rounded text-white overflow-hidden"
                      style={calculateSlotStyle(slot)}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(slot);
                      }}
                    >
                      <div className="text-sm font-semibold truncate">{slot.title}</div>
                      <div className="text-xs truncate">{slot.startTime} - {slot.endTime}</div>
                    </div>
                  ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };
  
  // Render weekly view
  const renderWeeklyView = () => {
    const weekDates = getCurrentWeekDates();
    const timeSlotsList = generateTimeSlots();
    
    return (
      <div className="weekly-view overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="day-headers grid grid-cols-[80px_repeat(7,1fr)] bg-gray-100 dark:bg-gray-800 rounded-t-lg">
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">Time</div>
            {weekDates.map((date, index) => {
              const dayName = daysOfWeek[date.getDay()];
              const isToday = formatDate(date) === formatDate(new Date());
              
              return (
                <div 
                  key={index} 
                  className={`p-4 text-center ${isToday ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                >
                  <div className="font-semibold">{dayName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{date.toLocaleDateString()}</div>
                </div>
              );
            })}
          </div>
          
          <div className="time-grid">
            {timeSlotsList.map((time, timeIndex) => (
              <div key={time} className="grid grid-cols-[80px_repeat(7,1fr)] border-t border-l border-gray-200 dark:border-gray-700">
                {/* Time label */}
                <div className="time-label p-2 border-b border-r border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                  {time}
                </div>
                
                {/* Day cells */}
                {weekDates.map((date, dayIndex) => {
                  const dayName = daysOfWeek[date.getDay()];
                  const formattedDate = formatDate(date);
                  const dayKey = `${dayName}-${formattedDate}`;
                  
                  return (
                    <div 
                      key={dayIndex}
                      className="time-cell relative border-b border-r border-gray-200 dark:border-gray-700 h-16 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => openAddModal(dayKey, time)}
                    >
                      {/* Render time slots for this day and time */}
                      {getTimeSlotsForDay(dayKey)
                        .filter(slot => {
                          const slotStartTime = parseTime(slot.startTime);
                          const slotEndTime = parseTime(slot.endTime);
                          const cellTime = parseTime(time);
                          
                          return (
                            (slotStartTime.hours < cellTime.hours + 1 && slotEndTime.hours > cellTime.hours) ||
                            (slotStartTime.hours === cellTime.hours && slotStartTime.minutes <= 59) ||
                            (slotEndTime.hours === cellTime.hours && slotEndTime.minutes > 0)
                          );
                        })
                        .map(slot => (
                          <div
                            key={slot.id}
                            className="absolute left-0 right-0 mx-1 p-1 rounded text-white overflow-hidden"
                            style={calculateSlotStyle(slot)}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(slot);
                            }}
                          >
                            <div className="text-sm font-semibold truncate">{slot.title}</div>
                            <div className="text-xs truncate">{slot.startTime} - {slot.endTime}</div>
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="timetable-container p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="timetable-header flex flex-wrap items-center justify-between mb-4">
        <div className="view-toggle flex space-x-2">
          <button
            onClick={() => setView('daily')}
            className={`px-4 py-2 rounded-md ${
              view === 'daily'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`px-4 py-2 rounded-md ${
              view === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Weekly
          </button>
        </div>
        
        <div className="date-navigation flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            &lt;
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            &gt;
          </button>
        </div>
      </div>
      
      <div className="timetable-content">
        {view === 'daily' ? renderDailyView() : renderWeeklyView()}
      </div>
      
      {/* Modal for adding/editing time slots */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingSlot?.title ? 'Edit Event' : 'Add New Event'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingSlot?.title || ''}
                  onChange={(e) => setEditingSlot(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Event title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editingSlot?.description || ''}
                  onChange={(e) => setEditingSlot(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Event description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editingSlot?.startTime || ''}
                    onChange={(e) => setEditingSlot(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editingSlot?.endTime || ''}
                    onChange={(e) => setEditingSlot(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${
                        editingSlot?.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingSlot(prev => prev ? { ...prev, color } : null)}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <div>
                {editingSlot?.id && (
                  <button
                    type="button"
                    onClick={() => deleteTimeSlot(editingSlot.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSlot(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveTimeSlot}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
