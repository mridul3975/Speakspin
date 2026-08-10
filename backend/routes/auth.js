import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

const clientID = process.env.GOOGLE_CLIENT_ID;
let client = null;

if (clientID && clientID !== 'your-google-oauth-client-id') {
  client = new OAuth2Client(clientID);
  console.log('Google OAuth Client initialized.');
} else {
  console.warn('WARNING: GOOGLE_CLIENT_ID is not configured in .env. Authentication will run in MOCK mode.');
}

// Generate JWT token for SpeakSpin session
function generateToken(userId) {
  const secret = process.env.JWT_SECRET || 'speakspin-jwt-fallback-secret-key';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Google credential token is required' });
  }

  let profile = null;

  try {
    if (client) {
      // Verify token via Google API
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientID,
      });
      profile = ticket.getPayload();
    } else {
      // Fallback: Mock login parsing or custom token for local development testing
      console.log('Verifying mock credential in development auth mode...');
      if (credential === 'mock-google-token') {
        profile = {
          sub: 'mock-google-id-12345',
          email: 'guest.speakspin@example.com',
          name: 'Guest Speaker',
          picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        };
      } else {
        // Fallback for decode attempts of custom JSON/mock strings
        try {
          const decodedMock = JSON.parse(credential);
          profile = {
            sub: decodedMock.sub || 'mock-google-id-12345',
            email: decodedMock.email || 'guest.speakspin@example.com',
            name: decodedMock.name || 'Guest Speaker',
            picture: decodedMock.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          };
        } catch (e) {
          throw new Error('Invalid authentication token format in mock environment');
        }
      }
    }

    if (!profile) {
      return res.status(401).json({ error: 'Invalid Google authentication credentials.' });
    }

    const { sub: googleId, email, name, picture } = profile;

    // Find user or create if new
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({
        googleId,
        email,
        name,
        picture,
      });
      await user.save();
      console.log(`Created new user account: ${email}`);
    } else {
      // Update details in case user changed picture or name in Google
      user.name = name;
      user.picture = picture;
      await user.save();
    }

    const sessionToken = generateToken(user._id);

    res.json({
      token: sessionToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(500).json({ error: `Authentication failed: ${error.message}` });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Internal server error resolving user session' });
  }
});

export default router;
