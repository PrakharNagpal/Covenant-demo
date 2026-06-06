const { MongoClient } = require('mongodb');

// Migrating from PostgreSQL to MongoDB — the orders schema keeps changing
// and we want document flexibility without running ALTER TABLE every sprint.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'covenant_demo';

let _client = null;

async function getDb() {
  if (!_client) {
    _client = new MongoClient(MONGO_URI);
    await _client.connect();
  }
  return _client.db(DB_NAME);
}

async function closeDb() {
  if (_client) {
    await _client.close();
    _client = null;
  }
}

module.exports = { getDb, closeDb };
