// server/src/controllers/event.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Event from '../models/event.model';
import User from '../models/user.model';
import { generateEventMessage, generateEventPlan } from '../services/ai.service';
import * as socialMediaService from '../services/social-media.service';

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private
 */
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    eventType,
    date,
    recipientName,
    recipientRelation,
    recipientContact,
    socialMediaHandles,
    notes,
    reminderDays,
    isRecurring,
  } = req.body;

  // Validate required fields
  if (!title || !eventType || !date || !recipientName || !recipientRelation) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Create the event
  const event = await Event.create({
    user: req.user!._id,
    title,
    eventType,
    date: new Date(date),
    recipientName,
    recipientRelation,
    recipientContact,
    socialMediaHandles,
    notes,
    reminderDays: reminderDays || [1, 7], // Default to 1 day and 1 week before
    isRecurring: isRecurring !== undefined ? isRecurring : true,
    isActive: true,
  });

  // Generate AI message and plan if event is in the future
  const eventDate = new Date(date);
  const now = new Date();
  
  if (eventDate > now) {
    try {
      // Generate personalized message using AI
      const message = await generateEventMessage(
        eventType,
        recipientName,
        recipientRelation,
        notes
      );
      
      // Generate event plan suggestions using AI
      const plan = await generateEventPlan(
        eventType,
        recipientName,
        recipientRelation,
        notes
      );
      
      // Update the event with AI-generated content
      event.aiGeneratedMessage = message;
      event.aiGeneratedPlan = plan;
      await event.save();
    } catch (error) {
      console.error('Error generating AI content:', error);
      // Continue without AI content if generation fails
    }
  }

  res.status(201).json(event);
});

/**
 * @desc    Get all events for the logged-in user
 * @route   GET /api/events
 * @access  Private
 */
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const { month, year, upcoming } = req.query;
  
  // Build filter object
  const filter: any = { user: req.user!._id };
  
  // Filter by month and year if provided
  if (month && year) {
    const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
    
    filter.date = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  
  // Filter for upcoming events
  if (upcoming === 'true') {
    const now = new Date();
    // Get events in the next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    filter.date = {
      $gte: now,
      $lte: thirtyDaysFromNow,
    };
  }
  
  const events = await Event.find(filter).sort({ date: 1 });
  res.status(200).json(events);
});

/**
 * @desc    Get a single event by ID
 * @route   GET /api/events/:id
 * @access  Private
 */
export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  // Check if the event belongs to the logged-in user
  if (event.user.toString() !== req.user!._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this event');
  }
  
  res.status(200).json(event);
});

/**
 * @desc    Update an event
 * @route   PUT /api/events/:id
 * @access  Private
 */
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  // Check if the event belongs to the logged-in user
  if (event.user.toString() !== req.user!._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this event');
  }
  
  // Update fields
  const {
    title,
    eventType,
    date,
    recipientName,
    recipientRelation,
    recipientContact,
    socialMediaHandles,
    notes,
    reminderDays,
    isRecurring,
    isActive,
  } = req.body;
  
  if (title) event.title = title;
  if (eventType) event.eventType = eventType;
  if (date) event.date = new Date(date);
  if (recipientName) event.recipientName = recipientName;
  if (recipientRelation) event.recipientRelation = recipientRelation;
  if (recipientContact) event.recipientContact = recipientContact;
  if (socialMediaHandles) event.socialMediaHandles = socialMediaHandles;
  if (notes) event.notes = notes;
  if (reminderDays) event.reminderDays = reminderDays;
  if (isRecurring !== undefined) event.isRecurring = isRecurring;
  if (isActive !== undefined) event.isActive = isActive;
  
  // If key details changed, regenerate AI content
  const shouldRegenerateAI = 
    req.body.eventType || 
    req.body.recipientName || 
    req.body.recipientRelation || 
    req.body.notes;
  
  if (shouldRegenerateAI) {
    try {
      // Generate personalized message using AI
      const message = await generateEventMessage(
        event.eventType,
        event.recipientName,
        event.recipientRelation,
        event.notes
      );
      
      // Generate event plan suggestions using AI
      const plan = await generateEventPlan(
        event.eventType,
        event.recipientName,
        event.recipientRelation,
        event.notes
      );
      
      // Update the event with AI-generated content
      event.aiGeneratedMessage = message;
      event.aiGeneratedPlan = plan;
    } catch (error) {
      console.error('Error regenerating AI content:', error);
      // Continue without updating AI content if generation fails
    }
  }
  
  const updatedEvent = await event.save();
  res.status(200).json(updatedEvent);
});

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Private
 */
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  // Check if the event belongs to the logged-in user
  if (event.user.toString() !== req.user!._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this event');
  }
  
  await event.deleteOne();
  res.status(200).json({ message: 'Event removed' });
});

/**
 * @desc    Regenerate AI message and plan for an event
 * @route   POST /api/events/:id/regenerate
 * @access  Private
 */
export const regenerateAIContent = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log(`Regenerating AI content for event ID: ${req.params.id}`);
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      console.log(`Event not found with ID: ${req.params.id}`);
      res.status(404);
      throw new Error('Event not found');
    }
    
    // Check if the event belongs to the logged-in user
    if (event.user.toString() !== req.user!._id.toString()) {
      console.log(`Unauthorized access attempt for event ID: ${req.params.id} by user ID: ${req.user!._id}`);
      res.status(401);
      throw new Error('Not authorized to access this event');
    }
    
    console.log(`Generating message for event: ${event.title} (${event.eventType}) for ${event.recipientName}`);
    
    // Generate personalized message using AI
    const message = await generateEventMessage(
      event.eventType,
      event.recipientName,
      event.recipientRelation,
      event.notes
    );
    
    console.log(`Message generated successfully. Generating plan...`);
    
    // Generate event plan suggestions using AI
    const plan = await generateEventPlan(
      event.eventType,
      event.recipientName,
      event.recipientRelation,
      event.notes
    );
    
    console.log(`Plan generated successfully. Saving to database...`);
    
    // Update the event with AI-generated content
    event.aiGeneratedMessage = message;
    event.aiGeneratedPlan = plan;
    await event.save();
    
    console.log(`AI content saved successfully for event ID: ${req.params.id}`);
    
    res.status(200).json({
      message: event.aiGeneratedMessage,
      plan: event.aiGeneratedPlan
    });
  } catch (error: any) {
    console.error('Error regenerating AI content:', error);
    
    // Send a more detailed error message to help with debugging
    const errorMessage = error.message || 'Failed to generate AI content';
    
    // Make sure we haven't already sent a response
    if (!res.headersSent) {
      res.status(500).json({ 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

/**
 * @desc    Send a test message for an event
 * @route   POST /api/events/:id/test-message
 * @access  Private
 */
export const sendTestMessage = asyncHandler(async (req: Request, res: Response) => {
  const { platform } = req.body;
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  // Check if the event belongs to the logged-in user
  if (event.user.toString() !== req.user!._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this event');
  }
  
  // Check if AI message exists
  if (!event.aiGeneratedMessage) {
    res.status(400);
    throw new Error('No AI-generated message available for this event');
  }
  
  // Log the test message request
  console.log(`Test message requested for event: ${event.title}, platform: ${platform}`);
  
  // Get the user to check for social media authentication
  const user = await User.findById(req.user!._id);
  
  // Check if the user has connected the requested platform
  let isConnected = false;
  let handle = '';
  
  if (platform === 'instagram') {
    isConnected = !!user?.socialMediaAuth?.instagram?.accessToken;
    handle = event.socialMediaHandles?.instagram || '';
  } else if (platform === 'facebook') {
    isConnected = !!user?.socialMediaAuth?.facebook?.accessToken;
    handle = event.socialMediaHandles?.facebook || '';
  } else if (platform === 'twitter') {
    isConnected = !!user?.socialMediaAuth?.twitter?.accessToken;
    handle = event.socialMediaHandles?.twitter || '';
  } else if (platform === 'email') {
    isConnected = true; // Email doesn't require OAuth
    handle = event.recipientContact?.email || '';
  } else if (platform === 'whatsapp') {
    isConnected = true; // WhatsApp doesn't have OAuth in this implementation
    handle = event.socialMediaHandles?.whatsapp || '';
  }
  
  // If Instagram is selected and connected, use the real service
  if (platform === 'instagram' && isConnected) {
    try {
      // Format and post to Instagram
      const result = await socialMediaService.postToInstagram(
        req.user!._id.toString(),
        event.aiGeneratedMessage
      );
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: `Message posted to Instagram successfully!`,
          postId: result.postId,
          content: event.aiGeneratedMessage,
          recipientInfo: {
            name: event.recipientName,
            platform: platform,
            handle: handle
          }
        });
        return;
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to post to Instagram',
          simulation: false
        });
        return;
      }
    } catch (error: any) {
      console.error('Error posting to Instagram:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while posting to Instagram',
        simulation: false
      });
      return;
    }
  }
  
  // For other platforms or if not connected, return simulation response
  res.status(200).json({
    success: true,
    message: `SIMULATION: Test message would be sent to ${event.recipientName} via ${platform}`,
    content: event.aiGeneratedMessage,
    simulation: true,
    connected: isConnected,
    recipientInfo: {
      name: event.recipientName,
      platform: platform,
      handle: handle
    },
    connectionInstructions: !isConnected ? 
      `To send real messages via ${platform}, please connect your account in Settings > Social Media Accounts.` : 
      undefined
  });
});

/**
 * @desc    Get upcoming events with reminders due
 * @route   GET /api/events/reminders
 * @access  Private
 */
export const getUpcomingReminders = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const events = await Event.find({ user: req.user!._id, isActive: true });
  
  // Filter events that have reminders due
  const reminders = events.filter(event => {
    const eventDate = new Date(event.date);
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if any of the reminder days match the current days until event
    return event.reminderDays.includes(daysUntilEvent);
  });
  
  res.status(200).json(reminders);
});