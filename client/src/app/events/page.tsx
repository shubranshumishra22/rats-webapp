'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

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

// --- MAIN PAGE COMPONENT ---
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
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
      
      // Separate upcoming and past events
      const now = new Date();
      const upcoming: Event[] = [];
      const past: Event[] = [];
      
      response.data.forEach((event: Event) => {
        const eventDate = new Date(event.date);
        if (eventDate >= now) {
          upcoming.push(event);
        } else {
          past.push(event);
        }
      });
      
      // Sort upcoming events by date (closest first)
      upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Sort past events by date (most recent first)
      past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setUpcomingEvents(upcoming);
      setPastEvents(past);
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Special Events</h1>
            <Link 
              href="/events/new" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Event
            </Link>
          </div>
          
          {/* Upcoming Events Section */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map(event => (
                  <EventCard 
                    key={event._id} 
                    event={event} 
                    onDelete={handleDeleteEvent} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-gray-600">No upcoming events. Add your first special event!</p>
                <Link 
                  href="/events/new" 
                  className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add New Event
                </Link>
              </div>
            )}
          </section>
          
          {/* Past Events Section */}
          {pastEvents.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastEvents.map(event => (
                  <EventCard 
                    key={event._id} 
                    event={event} 
                    onDelete={handleDeleteEvent} 
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}