# covenant-demo-app

A simple Node.js/Express API used as the demo target repository for **Covenant**.

This repo intentionally uses JWT for authentication (decided by the team on Jan 14, 2026).
Any change to the auth strategy will be caught by the Covenant agent.

## Stack
- Express for routing
- jsonwebtoken for authentication
- 3-step checkout flow

## Running locally
Run `npm install` then `npm start`. Server starts on port 3001.
