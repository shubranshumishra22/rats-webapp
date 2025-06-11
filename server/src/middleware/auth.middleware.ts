// server/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User, { IUser } from '../models/user.model';

// Extend the Express Request interface to include our 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // Check for the token in the Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        // 1. Get token from header (it's in the format "Bearer <token>")
        token = req.headers.authorization.split(' ')[1];

        // 2. Verify the token
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as { id: string };

        // 3. Get user from the token's ID and attach it to the request object
        // We exclude the password for security
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized, user not found');
        }

        // 4. Move on to the next function (our controller)
        next();
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
  }
);