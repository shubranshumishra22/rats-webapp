'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPE DEFINITIONS ---
interface Event {
  _id: string;
  title: string;
  eventType: 'birthday' | 'anniversary' | 'holiday' | 'other';
  date: string;
  recipientName: string;
  recipientRelation: string;
  reminderDays: number[];
  isRecurring: boolean;
  aiGeneratedMessage?: string;
  aiGeneratedPlan?: string;
}

// --- COMPONENT: EVENT CARD ---
const EventCard = ({ 
  event, 
  onDelete 
}: { 
  event: Event; 
  onDelete: (id: string) => void; 
}) => {
  const eventDate = new Date(event.date);
  const today = new Date();
  
  // Calculate days until event
  const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Format date
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Determine card color based on event type
  const cardColors = {
    birthday: 'bg-blue-50 border-blue-200',
    anniversary: 'bg-purple-50 border-purple-200',
    holiday: 'bg-green-50 border-green-200',
    other: 'bg-gray-50 border-gray-200'
  };
  
  // Determine icon based on event type
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return '🎂';
      case 'anniversary':
        return '💍';
      case 'holiday':
        return '🎉';
      default:
        return '📅';
    }
  };
  
  return (
    <div className={`rounded-lg border p-4 ${cardColors[event.eventType]} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{getEventIcon(event.eventType)}</span>
          <div>
            <h3 className="font-semibold text-gray-800">{event.title}</h3>
            <p className="text-sm text-gray-600">{formattedDate}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link 
            href={`/events/${event._id}`}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            View
          </Link>
          <button 
            onClick={() => onDelete(event._id)} 
            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="mt-3">
        <p className="text-sm">
          <span className="font-medium">For:</span> {event.recipientName} ({event.recipientRelation})
        </p>
        
        <div className="mt-2 flex justify-between items-center">
          <div>
            {daysUntil > 0 ? (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
              </span>
            ) : daysUntil === 0 ? (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                Today!
              </span>
            ) : (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                {event.isRecurring ? 'Next year' : 'Passed'}
              </span>
            )}
            
            {event.isRecurring && (
              <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Recurring
              </span>
            )}
          </div>
          
          {event.aiGeneratedMessage && (
            <span className="text-xs text-purple-600">
              AI message ready
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// --- CALENDAR COMPONENTS ---
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
}

const CalendarHeader = ({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth,
  onAddEvent
}: { 
  currentDate: Date; 
  onPrevMonth: () => void; 
  onNextMonth: () => void;
  onAddEvent: () => void;
}) => {
  const month = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const year = currentDate.getFullYear();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8">
      <div className="flex items-center mb-4 md:mb-0">
        <div className="relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {month}
          </h2>
          <span className="absolute -top-1 -right-2 bg-yellow-400 text-xs font-bold text-gray-800 rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {currentDate.getDate()}
          </span>
        </div>
        <span className="ml-3 text-xl text-gray-500 font-medium">{year}</span>
      </div>
      
      <div className="flex items-center">
        <div className="flex mr-4 bg-gray-100 rounded-lg p-1">
          <button 
            onClick={onPrevMonth}
            className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={onNextMonth}
            className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <button 
          onClick={onAddEvent}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Event
        </button>
      </div>
    </div>
  );
};

const CalendarGrid = ({ 
  days, 
  onDayClick,
  onEventClick
}: { 
  days: CalendarDay[]; 
  onDayClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get event icon
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'birthday': return '🎂';
      case 'anniversary': return '💍';
      case 'holiday': return '🎉';
      default: return '📅';
    }
  };
  
  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((day, index) => {
          const isToday = day.date.getTime() === today.getTime();
          const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
          
          return (
            <div 
              key={index}
              onClick={() => onDayClick(day.date)}
              className={`
                min-h-[120px] p-3 rounded-xl border transition-all cursor-pointer group
                ${day.isCurrentMonth 
                  ? isWeekend 
                    ? 'bg-blue-50/50' 
                    : 'bg-white' 
                  : 'bg-gray-50/50 text-gray-400'}
                ${isToday 
                  ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}
              `}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  {isToday ? (
                    <span className="flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full font-bold">
                      {day.date.getDate()}
                    </span>
                  ) : (
                    <span className={`text-sm font-semibold ${isWeekend && day.isCurrentMonth ? 'text-blue-800' : ''}`}>
                      {day.date.getDate()}
                    </span>
                  )}
                </div>
                
                {day.events.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium">
                    {day.events.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1.5 overflow-y-auto max-h-[75px]">
                {day.events.map(event => (
                  <div 
                    key={event._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`
                      text-xs p-1.5 rounded-md truncate flex items-center transition-all
                      ${event.eventType === 'birthday' 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                        : event.eventType === 'anniversary' 
                        ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                        : event.eventType === 'holiday' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                      group-hover:shadow-sm
                    `}
                  >
                    <span className="mr-1 text-xs">{getEventIcon(event.eventType)}</span>
                    {event.title}
                  </div>
                ))}
              </div>
              
              {/* Add event indicator on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-blue-600/80 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- EVENT FORM MODAL ---
const EventFormModal = ({ 
  isOpen, 
  onClose, 
  selectedDate,
  onSubmit,
  isSubmitting
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  selectedDate: Date | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    eventType: 'birthday',
    otherEventType: '',
    date: '',
    recipientName: '',
    recipientRelation: '',
    reminderDays: [1, 7], // Default to 1 day and 1 week before
    isRecurring: true
  });
  
  useEffect(() => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: dateString }));
    }
  }, [selectedDate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const reminderDay = parseInt(value);
    
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          reminderDays: [...prev.reminderDays, reminderDay].sort((a, b) => a - b)
        };
      } else {
        return {
          ...prev,
          reminderDays: prev.reminderDays.filter(day => day !== reminderDay)
        };
      }
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-100"
        >
          <div className="relative">
            {/* Decorative header */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl"></div>
            
            <div className="p-6 pt-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Add New Event
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Basic Event Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Event Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Event Title*
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Mom's Birthday"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type*
                    </label>
                    <select
                      id="eventType"
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="birthday">Birthday</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="holiday">Holiday</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  {formData.eventType === 'other' && (
                    <div>
                      <label htmlFor="otherEventType" className="block text-sm font-medium text-gray-700 mb-1">
                        Specify Event Type*
                      </label>
                      <input
                        type="text"
                        id="otherEventType"
                        name="otherEventType"
                        value={formData.otherEventType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Graduation, Job Promotion, etc."
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        This helps our AI generate more relevant messages and plans for this event.
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selected Date
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-700">
                      {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'No date selected'}
                      <input
                        type="hidden"
                        name="date"
                        value={formData.date}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <label htmlFor="isRecurring" className="flex items-center text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        name="isRecurring"
                        checked={formData.isRecurring}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                      />
                      Recurring yearly event
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Recipient Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Recipient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Name*
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Sarah Johnson"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="recipientRelation" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Relationship*
                    </label>
                    <input
                      type="text"
                      id="recipientRelation"
                      name="recipientRelation"
                      value={formData.recipientRelation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Mother, Friend, Colleague"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Reminder Settings */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Reminder Settings</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Choose when you want to receive reminders before the event.
                </p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      value="1"
                      checked={formData.reminderDays.includes(1)}
                      onChange={handleReminderChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    1 day before
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      value="3"
                      checked={formData.reminderDays.includes(3)}
                      onChange={handleReminderChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    3 days before
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      value="7"
                      checked={formData.reminderDays.includes(7)}
                      onChange={handleReminderChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    1 week before
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      value="14"
                      checked={formData.reminderDays.includes(14)}
                      onChange={handleReminderChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    2 weeks before
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      value="30"
                      checked={formData.reminderDays.includes(30)}
                      onChange={handleReminderChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    1 month before
                  </label>
                </div>
              </div>
              
              {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : 'Save Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const router = useRouter();
  
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);
  
  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5001/api/events', getAuthHeaders());
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('rats_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchEvents();
  }, [fetchEvents, router]);
  
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5001/api/events/${id}`, getAuthHeaders());
      // Refresh events list
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };
  
  // Calendar navigation
  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  // Calendar days calculation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate total days to show (previous month days + current month days + next month days)
    // We want to show a complete grid of 6 weeks (42 days)
    const totalDays = 42;
    
    const days: CalendarDay[] = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
      const date = new Date(year, month - 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        events: events.filter(event => {
          const eventDate = new Date(event.date);
          return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
          );
        })
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        events: events.filter(event => {
          const eventDate = new Date(event.date);
          return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
          );
        })
      });
    }
    
    // Add days from next month
    const remainingDays = totalDays - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        events: events.filter(event => {
          const eventDate = new Date(event.date);
          return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
          );
        })
      });
    }
    
    return days;
  }, [currentDate, events]);
  
  // Handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };
  
  // Handle event click
  const handleEventClick = (event: Event) => {
    router.push(`/events/${event._id}`);
  };
  
  // Handle add event button click
  const handleAddEventClick = () => {
    setSelectedDate(new Date());
    setIsModalOpen(true);
  };
  
  // Handle form submission
  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    
    try {
      // Validate other event type if needed
      if (formData.eventType === 'other' && !formData.otherEventType.trim()) {
        alert('Please specify the event type');
        setIsSubmitting(false);
        return;
      }
      
      // Format the data for the API
      const eventData = {
        title: formData.title,
        eventType: formData.eventType,
        date: formData.date,
        recipientName: formData.recipientName,
        recipientRelation: formData.recipientRelation,
        recipientContact: {
          email: '',
          phone: ''
        },
        socialMediaHandles: {
          facebook: '',
          instagram: '',
          twitter: '',
          whatsapp: ''
        },
        notes: formData.eventType === 'other' ? `Event Type: ${formData.otherEventType}` : '',
        reminderDays: formData.reminderDays,
        isRecurring: formData.isRecurring
      };
      
      // Make API call
      const response = await axios.post(
        'http://localhost:5001/api/events',
        eventData,
        getAuthHeaders()
      );
      
      // Close modal and refresh events
      setIsModalOpen(false);
      fetchEvents();
      
      // Optionally redirect to the event details page
      // router.push(`/events/${response.data._id}`);
    } catch (err: any) {
      console.error('Error creating event:', err);
      alert(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Calendar View */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-100 transition-all hover:shadow-xl">
            <CalendarHeader 
              currentDate={currentDate} 
              onPrevMonth={handlePrevMonth} 
              onNextMonth={handleNextMonth}
              onAddEvent={handleAddEventClick}
            />
            <CalendarGrid 
              days={calendarDays} 
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          </div>
          
          {/* Upcoming Events List */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 transition-all hover:shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Coming Up Next
              </h2>
            </div>
            
            {events.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events
                    .filter(event => new Date(event.date) >= new Date())
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 6)
                    .map(event => (
                      <EventCard 
                        key={event._id} 
                        event={event} 
                        onDelete={handleDeleteEvent} 
                      />
                    ))
                  }
                </div>
                
                {events.filter(event => new Date(event.date) >= new Date()).length > 6 && (
                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => {
                        const upcomingSection = document.getElementById('upcoming-events');
                        if (upcomingSection) {
                          upcomingSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center mx-auto"
                    >
                      View all upcoming events
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No events yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start tracking birthdays, anniversaries, and other special occasions to never miss an important date!
                </p>
                <button 
                  onClick={handleAddEventClick}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Add Your First Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Event Form Modal */}
      <EventFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </ClientOnly>
  );
}