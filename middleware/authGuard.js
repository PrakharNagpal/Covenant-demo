const { verifySession } = require('../auth');

// Stateful session auth. This requires a server-side session lookup on every request.
function authGuard(req, res, next) {
  const sessionId = req.cookies?.session_id || req.get('x-session-id');

  if (!sessionId) {
    return res.status(401).json({ error: 'Session required' });
  }

  try {
    const session = verifySession(sessionId);
    req.user = {
      id: session.sub,
      role: session.role
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

module.exports = authGuard;
