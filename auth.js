const jwt = require('jsonwebtoken');

// Decision #1: JWT authentication, Jan 14 2026, @alice and @bob.
// Stateless token verification keeps the API mobile-friendly and avoids a session store.
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'covenant-demo-dev-secret';

function issueTokens(user) {
  const payload = {
    sub: String(user.id),
    role: user.role || 'customer'
  };

  return {
    accessToken: jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
      issuer: 'covenant-demo',
      audience: 'covenant-demo-api'
    }),
    refreshToken: jwt.sign({ ...payload, typ: 'refresh' }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_TTL,
      issuer: 'covenant-demo',
      audience: 'covenant-demo-api'
    })
  };
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'covenant-demo',
    audience: 'covenant-demo-api'
  });
}

function refreshAccessToken(refreshToken) {
  const decoded = verifyToken(refreshToken);
  if (decoded.typ !== 'refresh') {
    throw new Error('Refresh token required');
  }

  return issueTokens({ id: decoded.sub, role: decoded.role }).accessToken;
}

module.exports = {
  issueTokens,
  verifyToken,
  refreshAccessToken
};
