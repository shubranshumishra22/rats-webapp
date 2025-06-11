'use client';

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

export default function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // Fetch upcoming events
  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.get(
        'http://localhost:5001/api/events/reminders',
        getAuthHeaders()
      );
      
      setEvents(response.data);
    } catch (err: any) {
      console.error('Error fetching upcoming events:', err);
      setError('Failed to load upcoming events');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    // Only fetch if user is logged in
    const token = localStorage.getItem('rats_token');
    if (token) {
      fetchUpcomingEvents();
    } else {
      setIsLoading(false);
    }
  }, [fetchUpcomingEvents]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get event icon based on type
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

  // Calculate days until event
  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Upcoming Events</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Upcoming Events</h3>
        <p className="text-gray-500">No upcoming events. Add special dates to get reminders!</p>
        <Link 
          href="/events/new" 
          className="mt-3 inline-block text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Event
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Upcoming Events</h3>
        <Link 
          href="/events" 
          className="text-sm text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>
      
      <div className="space-y-4">
        {events.map(event => (
          <Link 
            key={event._id} 
            href={`/events/${event._id}`}
            className="block p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start">
              <span className="text-2xl mr-3">{getEventIcon(event.eventType)}</span>
              <div>
                <h4 className="font-medium text-gray-800">{event.title}</h4>
                <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                <p className="text-sm text-gray-600">
                  For: {event.recipientName} ({event.recipientRelation})
                </p>
                <div className="mt-1">
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    In {getDaysUntil(event.date)} day{getDaysUntil(event.date) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}