// server/src/models/social-media-post.model.ts

import mongoose from 'mongoose';

const socialMediaPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    platform: {
      type: String,
      required: true,
      enum: ['instagram', 'facebook', 'twitter', 'whatsapp']
    },
    content: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String
    },
    platformPostId: {
      type: String
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'scheduled', 'published', 'failed'],
      default: 'draft'
    },
    statusMessage: {
      type: String
    },
    scheduledFor: {
      type: Date
    },
    publishedAt: {
      type: Date
    },
    metrics: {
      likes: {
        type: Number,
        default: 0
      },
      comments: {
        type: Number,
        default: 0
      },
      shares: {
        type: Number,
        default: 0
      },
      impressions: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
);

const SocialMediaPost = mongoose.model('SocialMediaPost', socialMediaPostSchema);

export default SocialMediaPost;