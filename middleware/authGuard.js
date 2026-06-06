const { verifyToken } = require('../auth');

// Decision #1: stateless JWT auth. No database lookup and no session lookup happen here.
function authGuard(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Bearer token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authGuard;
