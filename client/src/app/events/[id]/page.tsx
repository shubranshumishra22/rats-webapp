'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
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
  recipientContact?: {
    email?: string;
    phone?: string;
  };
  socialMediaHandles?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  notes?: string;
  reminderDays: number[];
  isRecurring: boolean;
  isActive: boolean;
  aiGeneratedMessage?: string;
  aiGeneratedPlan?: string;
  lastMessageSent?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EventDetailPage() {
  // Use the useParams hook instead of receiving params as a prop
  const params = useParams();
  const eventId = params?.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [testMessageResult, setTestMessageResult] = useState('');
  const router = useRouter();
  
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);
  
  // Store the ID in a ref to avoid the warning about using params.id synchronously
  const eventIdRef = useRef<string>(eventId);
  
  // Fetch event details
  const fetchEvent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const eventId = eventIdRef.current;
      
      const response = await axios.get(
        `http://localhost:5001/api/events/${eventId}`,
        getAuthHeaders()
      );
      
      setEvent(response.data);
    } catch (err: any) {
      console.error('Error fetching event:', err);
      setError(err.response?.data?.message || 'Failed to load event details');
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
    
    fetchEvent();
  }, [fetchEvent, router]);
  
  const handleRegenerateAI = async () => {
    try {
      setIsRegenerating(true);
      setError('');
      
      const eventId = eventIdRef.current;
      console.log(`Requesting AI content regeneration for event ID: ${eventId}`);
      
      const response = await axios.post(
        `http://localhost:5001/api/events/${eventId}/regenerate`,
        {},
        getAuthHeaders()
      );
      
      console.log('AI content regeneration response:', response.data);
      
      if (!response.data.message || !response.data.plan) {
        console.warn('Incomplete AI content received:', response.data);
        throw new Error('Received incomplete AI content from server');
      }
      
      // Update the event with new AI content
      setEvent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          aiGeneratedMessage: response.data.message,
          aiGeneratedPlan: response.data.plan
        };
      });
      
      alert('AI content regenerated successfully!');
    } catch (err: any) {
      console.error('Error regenerating AI content:', err);
      
      // Extract the error message from the response if available
      let errorMessage = 'Failed to regenerate AI content';
      
      if (err.response) {
        console.error('Error response from server:', err.response.data);
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        console.error('No response received from server');
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        console.error('Error setting up request:', err.message);
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsRegenerating(false);
    }
  };
  
  const handleSendTestMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedPlatform) {
      alert('Please select a platform to send the test message');
      return;
    }
    
    try {
      setIsSendingTest(true);
      setTestMessageResult('');
      setError('');
      
      const eventId = eventIdRef.current;
      const response = await axios.post(
        `http://localhost:5001/api/events/${eventId}/test-message`,
        { platform: selectedPlatform },
        getAuthHeaders()
      );
      
      // Handle the response from the server
      if (response.data.simulation) {
        // This is a simulation response
        let message = response.data.message;
        
        // Add connection instructions if provided
        if (response.data.connectionInstructions) {
          message += `\n\n${response.data.connectionInstructions}`;
        }
        
        setTestMessageResult(message);
      } else if (response.data.success) {
        // This is a real post response (e.g., Instagram)
        setTestMessageResult(
          `${response.data.message}\n\n` +
          `Your message has been posted to ${selectedPlatform}. ` +
          `You can view engagement metrics in your account.`
        );
      } else {
        // This is an error response
        setError(response.data.message || 'Failed to send message');
      }
    } catch (err: any) {
      console.error('Error sending test message:', err);
      setError(err.response?.data?.message || 'Failed to send test message');
    } finally {
      setIsSendingTest(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Only show the error page for critical errors that prevent loading the event
  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <Link 
              href="/events" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Event Not Found</h2>
            <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
            <Link 
              href="/events" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
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
  
  // Get event color
  const getEventColor = (type: string) => {
    switch (type) {
      case 'birthday':
        return 'bg-blue-50 border-blue-200';
      case 'anniversary':
        return 'bg-purple-50 border-purple-200';
      case 'holiday':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  const daysUntilEvent = getDaysUntilEvent(event.date);
  
  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center mb-6">
            <Link href="/events" className="text-blue-600 hover:underline mr-4">
              ← Back to Events
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Event Details</h1>
          </div>
          
          {/* Event Header */}
          <div className={`rounded-lg border p-6 mb-6 ${getEventColor(event.eventType)}`}>
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">{getEventIcon(event.eventType)}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{event.title}</h2>
                <p className="text-gray-600">{formatDate(event.date)}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {daysUntilEvent > 0 ? (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  In {daysUntilEvent} day{daysUntilEvent !== 1 ? 's' : ''}
                </span>
              ) : daysUntilEvent === 0 ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Today!
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {event.isRecurring ? 'Next year' : 'Passed'}
                </span>
              )}
              
              {event.isRecurring && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Recurring Yearly
                </span>
              )}
              
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm capitalize">
                {event.eventType}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700">Recipient</h3>
                <p className="text-gray-600">{event.recipientName}</p>
                <p className="text-gray-500 text-sm">Relationship: {event.recipientRelation}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">Reminders</h3>
                <p className="text-gray-600">
                  {event.reminderDays.length > 0 
                    ? event.reminderDays.map(day => `${day} day${day !== 1 ? 's' : ''}`).join(', ') + ' before'
                    : 'No reminders set'}
                </p>
              </div>
            </div>
          </div>
          
          {/* AI Generated Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* AI Message */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">AI Generated Message</h3>
                <button
                  onClick={handleRegenerateAI}
                  disabled={isRegenerating}
                  className={`text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors ${
                    isRegenerating ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </button>
              </div>
              
              {/* Show error message if there was an error regenerating AI content */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                </div>
              )}
              
              {isRegenerating ? (
                <div className="bg-gray-50 p-4 rounded-lg flex justify-center items-center h-32">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-2"></div>
                    <p className="text-gray-500">Generating personalized content...</p>
                  </div>
                </div>
              ) : event.aiGeneratedMessage ? (
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                  {event.aiGeneratedMessage}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-gray-500 italic">
                  No message generated yet. Click "Regenerate" to create one.
                </div>
              )}
              
              {/* Test Message Form */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Send Test Message</h4>
                <form onSubmit={handleSendTestMessage} className="flex items-center">
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    required
                  >
                    <option value="">Select platform</option>
                    {event.recipientContact?.email && <option value="email">Email</option>}
                    {event.socialMediaHandles?.facebook && <option value="facebook">Facebook</option>}
                    {event.socialMediaHandles?.instagram && <option value="instagram">Instagram</option>}
                    {event.socialMediaHandles?.twitter && <option value="twitter">Twitter</option>}
                    {event.socialMediaHandles?.whatsapp && <option value="whatsapp">WhatsApp</option>}
                  </select>
                  
                  <button
                    type="submit"
                    disabled={isSendingTest || !event.aiGeneratedMessage}
                    className={`px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                      isSendingTest || !event.aiGeneratedMessage ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSendingTest ? 'Sending...' : 'Test'}
                  </button>
                </form>
                
                {testMessageResult && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                    <p className="font-semibold text-blue-700 mb-1">
                      {selectedPlatform === 'instagram' ? 'Instagram Integration' : 'Simulation Mode'}
                    </p>
                    <p className="text-blue-600 mb-2">{testMessageResult}</p>
                    
                    {selectedPlatform === 'instagram' ? (
                      <div className="text-xs text-gray-500">
                        <p className="mb-1">Instagram integration features:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Connect to Instagram using secure OAuth authentication</li>
                          <li>Format messages to meet Instagram's requirements</li>
                          <li>Post directly to your Instagram account</li>
                          <li>Track engagement metrics like likes and comments</li>
                        </ul>
                        <p className="mt-2">
                          <Link href="/settings/social-accounts" className="text-blue-600 hover:underline">
                            Connect your Instagram account →
                          </Link>
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        <p className="mb-1">In a full implementation, this would:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Connect to the {selectedPlatform} API using OAuth</li>
                          <li>Format the message appropriately for the platform</li>
                          <li>Send or schedule the message for delivery</li>
                          <li>Track delivery status and engagement metrics</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* AI Plan */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Suggested Plans</h3>
              
              {isRegenerating ? (
                <div className="bg-gray-50 p-4 rounded-lg flex justify-center items-center h-32">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-2"></div>
                    <p className="text-gray-500">Generating plan suggestions...</p>
                  </div>
                </div>
              ) : event.aiGeneratedPlan ? (
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                  {event.aiGeneratedPlan}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-gray-500 italic">
                  No plans generated yet. Click "Regenerate" to create suggestions.
                </div>
              )}
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
              <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Demo Feature
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 text-sm">
              <p className="text-blue-800">
                <strong>Note:</strong> The social media integration is a simulation for demonstration purposes. 
                In a production environment, this would connect to actual social media APIs using OAuth authentication.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Direct Contact</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-gray-600 mr-2">📧</span>
                    <span className="text-gray-800">
                      {event.recipientContact?.email || 'No email provided'}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-gray-600 mr-2">📱</span>
                    <span className="text-gray-800">
                      {event.recipientContact?.phone || 'No phone provided'}
                    </span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Social Media</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-gray-600 mr-2">Facebook:</span>
                    <span className="text-gray-800">
                      {event.socialMediaHandles?.facebook || 'Not provided'}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-gray-600 mr-2">Instagram:</span>
                    <span className="text-gray-800">
                      {event.socialMediaHandles?.instagram || 'Not provided'}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-gray-600 mr-2">Twitter:</span>
                    <span className="text-gray-800">
                      {event.socialMediaHandles?.twitter || 'Not provided'}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-gray-600 mr-2">WhatsApp:</span>
                    <span className="text-gray-800">
                      {event.socialMediaHandles?.whatsapp || 'Not provided'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Notes */}
          {event.notes && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Notes</h3>
              <p className="text-gray-700 whitespace-pre-line">{event.notes}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href={`/events/${event._id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Event
            </Link>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this event?')) {
                  axios.delete(`http://localhost:5001/api/events/${event._id}`, getAuthHeaders())
                    .then(() => router.push('/events'))
                    .catch(err => {
                      console.error('Error deleting event:', err);
                      alert('Failed to delete event');
                    });
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete Event
            </button>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}