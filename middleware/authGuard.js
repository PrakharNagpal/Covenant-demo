const { getSession, touchSession } = require('../auth');

// Session-based auth guard — reads session ID from cookie or Authorization header.
// Stateful lookup on every request (session store is in-memory for now, Redis later).
function authGuard(req, res, next) {
  const sessionId =
    req.cookies?.session_id ||
    (req.get('authorization') || '').replace(/^Session\s+/i, '');

  if (!sessionId) {
    return res.status(401).json({ error: 'No session provided' });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  touchSession(sessionId);
  req.user = { id: session.id, role: session.role };
  return next();
}

module.exports = { authGuard };
