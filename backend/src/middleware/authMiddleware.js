import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Check if token format is valid before verifying
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format: expected 3 parts, got', tokenParts.length);
        return res.status(401).json({ 
          message: 'Invalid token format',
          tokenInvalid: true
        });
      }
      
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if user is blocked
      if (req.user.isBlocked) {
        return res.status(403).json({ 
          message: 'Your account has been blocked',
          reason: req.user.blockReason || 'Violation of community guidelines'
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(403).json({ message: 'Your account has been deactivated' });
      }

      // Check if user is verified
      if (!req.user.isVerified) {
        return res.status(403).json({ 
          message: 'Please verify your email to access this feature',
          needsVerification: true 
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      
      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token',
          tokenInvalid: true
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired',
          tokenExpired: true
        });
      }
      
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Generate JWT Token
export const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

