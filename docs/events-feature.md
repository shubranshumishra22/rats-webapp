# Events Feature Documentation

## Overview

The Events feature in RATS helps users remember and celebrate important dates like birthdays, anniversaries, and holidays. It uses AI to generate personalized messages and event planning suggestions, and sends reminders at specified intervals before the event.

## Features

- **Event Management**: Create, view, edit, and delete special events
- **AI-Generated Content**: Automatically generate personalized messages and event planning suggestions
- **Reminder System**: Set multiple reminder timeframes (1 day, 3 days, 1 week, etc.)
- **Social Media Integration**: Simulation of sending messages through various social media platforms
- **Recurring Events**: Support for annual events with automatic date updates for the following year

## Components

### Frontend

1. **Events List Page** (`/events`): Displays all upcoming and past events
2. **Event Detail Page** (`/events/[id]`): Shows detailed information about an event, including AI-generated content
3. **Event Creation Page** (`/events/new`): Form for adding new events
4. **Event Edit Page** (`/events/[id]/edit`): Form for modifying existing events
5. **Event Reminders Component**: Displays upcoming event reminders on the home page

### Backend

1. **Event Model**: MongoDB schema for storing event information
2. **Event Controller**: API endpoints for CRUD operations and specialized functions
3. **AI Service**: Integration with Gemini API for generating personalized content
4. **Reminder Service**: Processes event reminders and sends notifications
5. **Scheduler Service**: Runs the reminder service daily using node-cron

## API Endpoints

- `GET /api/events`: Get all events for the logged-in user
- `POST /api/events`: Create a new event
- `GET /api/events/:id`: Get a specific event by ID
- `PUT /api/events/:id`: Update an event
- `DELETE /api/events/:id`: Delete an event
- `POST /api/events/:id/regenerate`: Regenerate AI content for an event
- `POST /api/events/:id/test-message`: Test sending a message for an event
- `GET /api/events/reminders`: Get upcoming events with reminders due

## Scheduled Tasks

The system runs a daily task at 8:00 AM to:
1. Check for upcoming events
2. Send reminders for events based on the user's reminder preferences
3. Send messages on the day of the event
4. Update recurring events that have passed to the next year

## Testing

To test the reminder service manually:
```
npm run test:reminders
```

This will process all events and send any due reminders without waiting for the scheduled time.

## Implementation Notes

- The social media integration is currently a simulation. In a production environment, it would connect to actual social media APIs using OAuth.
- Email sending is also simulated. In production, it would integrate with an email service like SendGrid or Mailgun.
- The AI content generation uses the Gemini API. If the API call fails, the system falls back to predefined templates.

## Future Enhancements

1. Real social media integration with OAuth authentication
2. More sophisticated AI content generation with more context
3. Image generation for event cards
4. Calendar integration (Google Calendar, Apple Calendar, etc.)
5. Group events and shared reminders