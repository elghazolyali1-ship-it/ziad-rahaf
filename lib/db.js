const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'wedding';

function getClientPromise() {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

async function getDb() {
  const client = await getClientPromise();
  return client.db(dbName);
}

async function getGuestsCollection() {
  const db = await getDb();
  const collection = db.collection('guests');
  if (!global._guestsIndexEnsured) {
    global._guestsIndexEnsured = collection
      .createIndex({ code: 1 }, { unique: true })
      .catch(() => {});
  }
  await global._guestsIndexEnsured;
  return collection;
}

module.exports = { getDb, getGuestsCollection };
