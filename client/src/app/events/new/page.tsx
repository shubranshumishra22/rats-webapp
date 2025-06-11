'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

export default function NewEventPage() {
  const [formData, setFormData] = useState({
    title: '',
    eventType: 'birthday',
    date: '',
    recipientName: '',
    recipientRelation: '',
    email: '',
    phone: '',
    facebook: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
    notes: '',
    reminderDays: [1, 7], // Default to 1 day and 1 week before
    isRecurring: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('rats_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);
  
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
        // Add the reminder day if it's not already in the array
        return {
          ...prev,
          reminderDays: [...prev.reminderDays, reminderDay].sort((a, b) => a - b)
        };
      } else {
        // Remove the reminder day
        return {
          ...prev,
          reminderDays: prev.reminderDays.filter(day => day !== reminderDay)
        };
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // Format the data for the API
      const eventData = {
        title: formData.title,
        eventType: formData.eventType,
        date: formData.date,
        recipientName: formData.recipientName,
        recipientRelation: formData.recipientRelation,
        recipientContact: {
          email: formData.email,
          phone: formData.phone
        },
        socialMediaHandles: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          twitter: formData.twitter,
          whatsapp: formData.whatsapp
        },
        notes: formData.notes,
        reminderDays: formData.reminderDays,
        isRecurring: formData.isRecurring
      };
      
      // Get auth token
      const token = localStorage.getItem('rats_token');
      
      // Make API call
      const response = await axios.post(
        'http://localhost:5001/api/events',
        eventData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Redirect to the event details page
      router.push(`/events/${response.data._id}`);
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center mb-6">
            <Link href="/events" className="text-blue-600 hover:underline mr-4">
              ← Back to Events
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Add New Event</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit}>
              {/* Basic Event Information */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Event Details</h2>
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
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date*
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
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
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Recipient Information</h2>
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
              
              {/* Contact Information */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., recipient@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., +1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
              
              {/* Social Media Handles */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Social Media Handles</h2>
                <p className="text-sm text-gray-500 mb-3">
                  Add social media handles to automatically send messages on the event day.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="text"
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Username or profile URL"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Username without @"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <input
                      type="text"
                      id="twitter"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Username without @"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Phone number with country code"
                    />
                  </div>
                </div>
              </div>
              
              {/* Additional Notes */}
              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional context about your relationship or preferences for AI-generated messages"
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  This information helps our AI generate more personalized messages and suggestions.
                </p>
              </div>
              
              {/* Reminder Settings */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Reminder Settings</h2>
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
              
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}