// client/src/components/EventReminders.tsx

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Event {
  _id: string;
  title: string;
  eventType: 'birthday' | 'anniversary' | 'holiday' | 'other';
  date: string;
  recipientName: string;
  recipientRelation: string;
}

export default function EventReminders() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);
  
  // Fetch upcoming events with reminders due
  const fetchUpcomingReminders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        'http://localhost:5001/api/events/reminders',
        getAuthHeaders()
      );
      setUpcomingEvents(response.data);
    } catch (err) {
      console.error('Error fetching event reminders:', err);
      setError('Failed to load upcoming events');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);
  
  useEffect(() => {
    fetchUpcomingReminders();
  }, [fetchUpcomingReminders]);
  
  // Calculate days until event
  const getDaysUntilEvent = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    
    // Reset time part for accurate day calculation
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Get event icon
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
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  if (upcomingEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-2">Upcoming Events</h3>
        <p className="text-gray-600 text-sm">No upcoming events to remind you about.</p>
        <Link 
          href="/events/new" 
          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
        >
          Add a special event →
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Upcoming Events</h3>
      
      <div className="space-y-3">
        {upcomingEvents.map(event => {
          const daysUntil = getDaysUntilEvent(event.date);
          
          return (
            <Link 
              key={event._id} 
              href={`/events/${event._id}`}
              className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getEventIcon(event.eventType)}</span>
                <div>
                  <h4 className="font-medium text-gray-800">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    For {event.recipientName} ({event.recipientRelation})
                  </p>
                  <div className="mt-1">
                    {daysUntil > 0 ? (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                        In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                        Today!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-100">
        <Link 
          href="/events" 
          className="text-sm text-blue-600 hover:underline"
        >
          View all events →
        </Link>
      </div>
    </div>
  );
}