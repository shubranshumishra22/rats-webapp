// server/src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

// Helper function to generate a JWT
const generateToken = (id: string) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d',
  });
};

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  // Now expecting username from the request body
  const { email, password, username } = req.body;

  // Validate all fields
  if (!email || !password || !username) {
    res.status(400);
    throw new Error('Please provide email, password, and username');
  }

  // Check for existing user OR existing username
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    res.status(400);
    throw new Error('This username is already taken');
  }

  const user = await User.create({
    email,
    username, // Save the username
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      email: user.email,
      username: user.username, // Return the username
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Find the user by email
  const user = await User.findOne({ email });

  // 2. Check if user exists AND if the password matches
  // We use the `matchPassword` method we created in our user model
  if (user && (await user.matchPassword(password))) {
    // 3. If everything is correct, send back the user data and a new token
    res.status(200).json({
      _id: user._id.toString(),
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } else {
    // 4. If user doesn't exist or password doesn't match, send an error
    // IMPORTANT: For security, use a generic error message.
    res.status(401); // 401 Unauthorized
    throw new Error('Invalid email or password');
  }
});