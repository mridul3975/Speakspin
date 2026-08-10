import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
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
  const secret = process.env.JWT_SECRET || 'speakspin-jwt-fallback-secret-key-123';
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
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientID,
      });
      profile = ticket.getPayload();
    } else {
      console.log('Verifying mock credential in development auth mode...');
      if (credential === 'mock-google-token') {
        profile = {
          sub: 'mock-google-id-12345',
          email: 'guest.speakspin@example.com',
          name: 'Guest Speaker',
          picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        };
      } else {
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

    // Find user or create if new in PostgreSQL
    const userRes = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    let user = userRes.rows[0];

    if (!user) {
      const insertRes = await pool.query(
        'INSERT INTO users (google_id, email, name, picture) VALUES ($1, $2, $3, $4) RETURNING *',
        [googleId, email, name, picture]
      );
      user = insertRes.rows[0];
      console.log(`Created new user account in PostgreSQL: ${email}`);
    } else {
      // Update details in case user changed picture or name in Google
      const updateRes = await pool.query(
        'UPDATE users SET name = $1, picture = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [name, picture, user.id]
      );
      user = updateRes.rows[0];
    }

    const sessionToken = generateToken(user.id);

    res.json({
      token: sessionToken,
      user: {
        id: user.id,
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
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const user = userRes.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    res.json({
      id: user.id,
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
