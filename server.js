const express = require('express');
const { issueTokens, refreshAccessToken } = require('./auth');
const authGuard = require('./middleware/authGuard');
const { router: checkoutRouter } = require('./checkout');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Decision #7: all public API routes are mounted under a URL version prefix.
const v1 = express.Router();

v1.get('/health', (req, res) => {
  res.json({ ok: true, version: 'v1' });
});

v1.post('/auth/login', (req, res) => {
  const { userId, role } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  return res.json(issueTokens({ id: userId, role }));
});

v1.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  try {
    return res.json({ accessToken: refreshAccessToken(refreshToken) });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

v1.use('/checkout', authGuard, checkoutRouter);

v1.get('/orders', authGuard, (req, res) => {
  res.json({
    userId: req.user.id,
    orders: []
  });
});

v1.post('/orders', authGuard, (req, res) => {
  const { totalCents, currency = 'USD' } = req.body;

  if (!Number.isInteger(totalCents) || totalCents < 0) {
    return res.status(400).json({ error: 'totalCents must be a non-negative integer' });
  }

  res.status(201).json({
    id: 'demo-order',
    user_id: req.user.id,
    status: 'pending',
    total_cents: totalCents,
    currency
  });
});

app.use('/v1', v1);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`covenant-demo API listening on port ${port}`);
  });
}

module.exports = app;
