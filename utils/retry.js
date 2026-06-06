// utils/retry.js — Exponential backoff with full jitter
// Decision: Apr 20 2026, @raj
// Fixed intervals rejected after Stripe outage caused thundering herd.
// See Decision Ledger: d1a2b3c4-0006

/**
 * Retries an async function with exponential backoff + full jitter.
 * @param {Function} fn        - Async function to retry
 * @param {number}   maxRetries - Max attempts (default 4)
 * @param {number}   baseMs    - Base delay in ms (default 200)
 */
async function withRetry(fn, maxRetries = 4, baseMs = 200) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      // Full jitter: random delay between 0 and (base * 2^attempt)
      const cap = baseMs * Math.pow(2, attempt);
      const delay = Math.random() * cap;
      await sleep(delay);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { withRetry };
