const assert = require('assert');
const {
  issueTokens,
  verifyToken,
  refreshAccessToken
} = require('../auth');

function testIssueAndVerifyAccessToken() {
  const { accessToken } = issueTokens({ id: 'user-123', role: 'customer' });
  const decoded = verifyToken(accessToken);

  assert.strictEqual(decoded.sub, 'user-123');
  assert.strictEqual(decoded.role, 'customer');
}

function testRefreshTokenCreatesNewAccessToken() {
  const { refreshToken } = issueTokens({ id: 'user-456', role: 'admin' });
  const accessToken = refreshAccessToken(refreshToken);
  const decoded = verifyToken(accessToken);

  assert.strictEqual(decoded.sub, 'user-456');
  assert.strictEqual(decoded.role, 'admin');
}

function testInvalidTokenThrows() {
  assert.throws(() => verifyToken('not-a-real-token'));
}

testIssueAndVerifyAccessToken();
testRefreshTokenCreatesNewAccessToken();
testInvalidTokenThrows();

console.log('auth tests passed');
