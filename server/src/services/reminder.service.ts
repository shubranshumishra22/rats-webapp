// server/src/services/reminder.service.ts

import Event from '../models/event.model';
import User from '../models/user.model';
import { sendEmail } from './email.service';

/**
 * Check for upcoming events and send reminders
 * This function would be called by a scheduled job (e.g., using node-cron)
 */
export async function processEventReminders(): Promise<void> {
  try {
    const now = new Date();
    const allEvents = await Event.find({ isActive: true }).populate('user', 'email username');
    
    for (const event of allEvents) {
      const eventDate = new Date(event.date);
      const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if today is a reminder day for this event
      if (event.reminderDays.includes(daysUntilEvent)) {
        await sendEventReminder(event, daysUntilEvent);
      }
      
      // Check if today is the event day (day 0)
      if (daysUntilEvent === 0) {
        await sendEventMessage(event);
      }
      
      // For recurring events (like birthdays), update the date for next year if the event has passed
      if (event.isRecurring && daysUntilEvent < 0) {
        const nextYear = new Date(eventDate);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        
        event.date = nextYear;
        await event.save();
      }
    }
  } catch (error) {
    console.error('Error processing event reminders:', error);
  }
}

/**
 * Send a reminder notification to the user about an upcoming event
 */
async function sendEventReminder(event: any, daysUntilEvent: number): Promise<void> {
  try {
    const user = event.user;
    
    if (!user || !user.email) {
      console.error(`Cannot send reminder: User information missing for event ${event._id}`);
      return;
    }
    
    // Prepare reminder message
    const subject = `Reminder: ${event.title} in ${daysUntilEvent} day${daysUntilEvent > 1 ? 's' : ''}`;
    
    let message = `
      <h2>Event Reminder</h2>
      <p>This is a reminder that ${event.title} for ${event.recipientName} is coming up in ${daysUntilEvent} day${daysUntilEvent > 1 ? 's' : ''}.</p>
    `;
    
    // Include AI-generated message and plan if available
    if (event.aiGeneratedMessage) {
      message += `
        <h3>Your Personalized Message:</h3>
        <div style="padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
          ${event.aiGeneratedMessage.replace(/\n/g, '<br>')}
        </div>
      `;
    }
    
    if (event.aiGeneratedPlan) {
      message += `
        <h3>Suggested Plans:</h3>
        <div style="padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
          ${event.aiGeneratedPlan.replace(/\n/g, '<br>')}
        </div>
      `;
    }
    
    // Add a link to view/edit the event
    message += `
      <p><a href="http://localhost:3000/events/${event._id}">View or edit this event</a></p>
    `;
    
    // Send email reminder
    await sendEmail(user.email, subject, message);
    
    console.log(`Reminder sent for event ${event._id} to ${user.email}`);
  } catch (error) {
    console.error(`Error sending reminder for event ${event._id}:`, error);
  }
}

/**
 * Send the actual event message on the day of the event
 */
async function sendEventMessage(event: any): Promise<void> {
  try {
    // Skip if no AI message was generated
    if (!event.aiGeneratedMessage) {
      console.log(`No message to send for event ${event._id}`);
      return;
    }
    
    // Skip if message was already sent today
    if (event.lastMessageSent) {
      const lastSent = new Date(event.lastMessageSent);
      const today = new Date();
      
      if (lastSent.toDateString() === today.toDateString()) {
        console.log(`Message already sent today for event ${event._id}`);
        return;
      }
    }
    
    // Send message via configured channels
    let messagesSent = false;
    
    // Send via email if recipient email is available
    if (event.recipientContact?.email) {
      const subject = `Happy ${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}!`;
      await sendEmail(event.recipientContact.email, subject, event.aiGeneratedMessage);
      messagesSent = true;
    }
    
    // Send via social media if configured
    // Note: In a real implementation, this would use the actual social media APIs
    if (event.socialMediaHandles) {
      // Simulate sending to social media platforms
      if (event.socialMediaHandles.facebook) {
        console.log(`Sending message to Facebook: ${event.socialMediaHandles.facebook}`);
        // In a real implementation: await sendToFacebook(event.socialMediaHandles.facebook, event.aiGeneratedMessage);
        messagesSent = true;
      }
      
      if (event.socialMediaHandles.instagram) {
        console.log(`Sending message to Instagram: ${event.socialMediaHandles.instagram}`);
        // In a real implementation: await sendToInstagram(event.socialMediaHandles.instagram, event.aiGeneratedMessage);
        messagesSent = true;
      }
      
      if (event.socialMediaHandles.twitter) {
        console.log(`Sending message to Twitter: ${event.socialMediaHandles.twitter}`);
        // In a real implementation: await sendToTwitter(event.socialMediaHandles.twitter, event.aiGeneratedMessage);
        messagesSent = true;
      }
      
      if (event.socialMediaHandles.whatsapp) {
        console.log(`Sending message to WhatsApp: ${event.socialMediaHandles.whatsapp}`);
        // In a real implementation: await sendToWhatsApp(event.socialMediaHandles.whatsapp, event.aiGeneratedMessage);
        messagesSent = true;
      }
    }
    
    // Update the last message sent date if any messages were sent
    if (messagesSent) {
      event.lastMessageSent = new Date();
      await event.save();
      console.log(`Message sent for event ${event._id}`);
    } else {
      console.log(`No channels configured to send message for event ${event._id}`);
    }
  } catch (error) {
    console.error(`Error sending message for event ${event._id}:`, error);
  }
}