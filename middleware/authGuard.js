// middleware/authGuard.js — Session verification middleware
// Stateful — looks up server-side session store.

const { getSession } = require('../auth');

/**
 * Express middleware that verifies the Bearer JWT token.
 * No session lookup, no DB call. Stateless by design.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticateToken };
