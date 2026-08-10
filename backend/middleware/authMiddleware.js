import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'speakspin-jwt-fallback-secret-key';
    const decoded = jwt.verify(token, secret);
    
    // Attach user ID from token to request
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    res.status(401).json({ error: 'Session expired or authentication failed. Please sign in again.' });
  }
}

export default authMiddleware;
