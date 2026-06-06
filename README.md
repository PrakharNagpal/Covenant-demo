# covenant-demo

> A demo e-commerce API used as the live target repository for **Covenant** — the autonomous decision enforcement agent.
>
> Every architectural decision in this codebase traces back to a logged decision in the Covenant Decision Ledger. When a commit violates a past decision, Covenant automatically posts a PR comment citing the original decision, the date, and the people who made it.

---

## The decisions baked into this codebase

This project exists to demonstrate Covenant in action. Every major technical choice was logged as a decision before a line of code was written. The ten decisions that shape this codebase:

| # | Decision | Date | Who |
|---|---|---|---|
| 1 | Use JWT for authentication (not sessions) | Jan 14, 2026 | @alice, @bob |
| 2 | Use PostgreSQL as primary database (not MongoDB) | Feb 3, 2026 | @priya, @raj |
| 3 | Checkout flow is exactly 3 steps: Cart -> Delivery -> Payment | Feb 28, 2026 | @alice, @design-lead |
| 4 | No PII stored in the orders table -- user_id FK only | Mar 15, 2026 | @priya, @security-lead |
| 5 | Deploy frontend to Vercel, backend to Railway | Apr 2, 2026 | @bob |
| 6 | Exponential backoff with jitter for all external API retries | Apr 20, 2026 | @raj |
| 7 | API versioning via URL path prefixes `/v1/`, `/v2/` (not headers) | May 8, 2026 | @priya |
| 8 | Rate limit: 100 requests per minute per authenticated user | May 22, 2026 | @bob |
| 9 | Redis for rate-limit counters and session cache only -- not a primary store | Jun 10, 2026 | @raj |
| 10 | Monorepo: single Git repo for frontend, backend, and shared types | Jun 28, 2026 | @alice, @bob |

---

## Project structure

```text
covenant-demo/
├── README.md
├── package.json
├── .gitignore
├── server.js                   # Express entry point
├── auth.js                     # JWT auth -- Decision #1
├── orders.js                   # Orders model -- Decision #4 (no PII)
├── checkout.js                 # 3-step checkout -- Decision #3
├── middleware/
│   └── authGuard.js            # JWT verification middleware -- Decision #1
├── utils/
│   └── retry.js                # Exponential backoff -- Decision #6
└── tests/
    └── auth.test.js            # Auth unit tests
```

---

## Tech stack

| Layer | Choice | Decision |
|---|---|---|
| Authentication | JWT (jsonwebtoken) | #1 -- Jan 14 |
| Database | PostgreSQL (via pg) | #2 -- Feb 3 |
| Checkout | 3-step flow | #3 -- Feb 28 |
| PII handling | Isolated in users table | #4 -- Mar 15 |
| Deployment | Vercel + Railway | #5 -- Apr 2 |
| Retry logic | Exponential backoff + jitter | #6 -- Apr 20 |
| API versioning | URL path `/v1/` | #7 -- May 8 |
| Rate limiting | 100 req/min/user | #8 -- May 22 |
| Cache | Redis (counters only) | #9 -- Jun 10 |
| Repo structure | Monorepo | #10 -- Jun 28 |

---

## How Covenant watches this repo

Covenant monitors every push to this repository via a GitHub webhook. When a commit is received:

1. The diff is extracted and sent to the Covenant contradiction agent
2. The agent checks the diff against all 10 decisions in the Decision Ledger using semantic search
3. If a violation is detected, Covenant posts a PR comment in this format:

```text
Covenant -- Promise Check

This change may break a promise your team made.

Past decision (made on Jan 14, 2026 by @alice and @bob):
> Use JWT for stateless authentication

Their reasoning:
> Statelessness, works for mobile clients, avoids session store complexity

What this commit does:
> Replaces JWT with session-based auth using an in-memory store

Why I flagged it (structural):
> This commit introduces stateful server-side sessions, directly
  contradicting the Jan 14 decision to use JWT for statelessness.

Is this intentional? thumbs up to confirm, thumbs down to flag for review.
```

---

## Running locally

```bash
npm install
node server.js
# Server starts on port 3001
```

```bash
# Run auth tests
npm test
```

---

## The demo commits

Two patch files are prepared for the live hackathon demo:

### `001-session-auth.patch` -- The money commit

Replaces the JWT implementation in `auth.js` and `middleware/authGuard.js` with session-based auth. This directly violates Decision #1 (JWT, Jan 14).

**Expected Covenant response:** PR comment within 30 seconds citing the Jan 14 JWT decision, @alice and @bob as participants, and a structural severity rating.

To apply:

```bash
git apply seed/demo_commits/001-session-auth.patch
git add -A
git commit -m "refactor: switch auth to session-based for easier revocation"
git push
```

### `002-no-violation.patch` -- The sanity check

Adds two lines to README.md. Completely innocuous -- no architectural change.

**Expected Covenant response:** No PR comment. This proves the agent has discrimination and does not fire on every commit.

To apply:

```bash
git apply seed/demo_commits/002-no-violation.patch
git add -A
git commit -m "docs: add local dev instructions to README"
git push
```

---

## File-by-file decision map

### `auth.js` -> Decision #1 (JWT, Jan 14)

The entire file exists because the team chose JWT over sessions on Jan 14. The key design choices -- stateless token verification, no server-side session store, refresh token pattern -- all trace back to that one conversation between @alice and @bob.

**What Covenant watches for:** Any commit that replaces `jwt.sign`, `jwt.verify`, introduces `session`, `cookie-session`, `express-session`, or removes the stateless verification pattern.

### `middleware/authGuard.js` -> Decision #1 (JWT, Jan 14)

The middleware is stateless by design -- it calls `verifyToken()` with no database lookup. This is a direct implementation of the JWT decision's rationale: "no server-side session lookup."

**What Covenant watches for:** Any commit that adds a database call inside this middleware, or replaces token extraction with cookie/session lookup.

### `checkout.js` -> Decision #3 (3-step flow, Feb 28)

`TOTAL_STEPS = 3` is hardcoded. The three routes (`/step/1`, `/step/2`, `/step/3`) map directly to Cart Review, Delivery Details, and Payment. A 4-step flow was prototyped and rejected.

**What Covenant watches for:** Any commit that adds a `/step/4` route, changes `TOTAL_STEPS` to any value other than 3, or splits delivery and payment into separate routes.

### `orders.js` -> Decision #4 (no PII in orders, Mar 15)

The orders model intentionally has no `name`, `email`, or `address` fields -- only `user_id` as a foreign key. PII lives in the users table. This was a legal and compliance requirement.

**What Covenant watches for:** Any commit that adds `name`, `email`, `address`, `phone`, or any other PII field directly to an order record.

### `utils/retry.js` -> Decision #6 (exponential backoff, Apr 20)

Exponential backoff with full jitter is the standard for all external API calls. Fixed intervals and linear backoff were explicitly rejected after a Stripe outage caused a thundering herd of retries.

**What Covenant watches for:** Any commit that replaces the backoff pattern with fixed-interval retries or removes jitter.

### `server.js` -> Decision #7 (URL versioning, May 8)

All routes are mounted under `/v1/`. Header-based versioning was rejected on developer experience grounds.

**What Covenant watches for:** Any commit that introduces `Accept-Version` headers, moves away from the `/v1/` prefix, or adds version detection based on query parameters.

---

## Webhook setup

The GitHub webhook points at the Covenant backend and fires on every push event.

| Setting | Value |
|---|---|
| Payload URL | `https://your-ngrok-domain.ngrok.app/webhooks/github` |
| Content type | `application/json` |
| Events | Just the push event |
| Secret | Stored in `GITHUB_WEBHOOK_SECRET` env var |

To configure:

1. Go to this repo -> **Settings** -> **Webhooks** -> **Add webhook**
2. Fill in the payload URL with your live ngrok URL
3. Set content type to `application/json`
4. Set the secret to match `GITHUB_WEBHOOK_SECRET` in your `.env`
5. Select **Just the push event**
6. Click **Add webhook**

---

## Seeding this repo on hackathon day

On the morning of the hackathon, after creating a fresh Git repo:

```bash
# 1. Create the repo on GitHub (via UI or gh CLI)
gh repo create trisolarans/covenant-demo --public

# 2. Clone it
git clone https://github.com/trisolarans/covenant-demo
cd covenant-demo

# 3. Copy the demo repo files from your knowledge package
cp -r ~/covenant-knowledge/seed-data/demo_repo/* .

# 4. Initial commit
git add -A
git commit -m "initial: covenant demo app -- jwt auth, 3-step checkout, no-pii orders"
git push origin main

# 5. Add the webhook
# Go to repo Settings -> Webhooks -> Add webhook
# URL: https://your-ngrok-domain.ngrok.app/webhooks/github
```

---

## Why this project looks the way it does

If you are wondering why a specific implementation choice was made, ask Covenant:

> "Why are we using JWT?"
> "Why is checkout 3 steps?"
> "Why is there no email field in the orders table?"

Covenant's Archaeology Mode will narrate the full decision history behind any part of the codebase.

---

*This repository is intentionally simple. The complexity lives in Covenant, not here.*

## Local smoke test
Run npm install and npm start to launch the demo API locally.

## Running locally
Use npm test to run the local smoke checks before demo pushes.
