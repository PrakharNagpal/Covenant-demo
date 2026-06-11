const crypto = require('crypto');

// Switching to server-side sessions — better token revocation and
// simpler mobile handling than managing JWT expiry on the client.
const sessions = new Map();
const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes

function createSession(user) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    id: String(user.id),
    role: user.role || 'customer',
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return sessionId;
}

function getSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

function destroySession(sessionId) {
  return sessions.delete(sessionId);
}

function touchSession(sessionId) {
  const session = sessions.get(sessionId);
  if (session) {
    session.expiresAt = Date.now() + SESSION_TTL_MS;
  }
}

module.exports = {
  createSession,
  getSession,
  destroySession,
  touchSession
};
