const crypto = require('crypto');

// Session-based authentication. This intentionally replaces the Jan 14 JWT decision.
// Reverts the JWT approach and keeps session-based authentication for this live Covenant demo.
// Session-based authentication webhook retest: reverts the JWT approach again.
const sessions = new Map();
const SESSION_TTL_MS = 15 * 60 * 1000;

function issueSession(user) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    sub: String(user.id),
    role: user.role || 'customer',
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return sessionId;
}

function verifySession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    throw new Error('Session expired');
  }
  return session;
}

function destroySession(sessionId) {
  return sessions.delete(sessionId);
}

function refreshSession(sessionId) {
  const session = verifySession(sessionId);
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  sessions.set(sessionId, session);
  return sessionId;
}

module.exports = {
  issueSession,
  verifySession,
  destroySession,
  refreshSession
};
