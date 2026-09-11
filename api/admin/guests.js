const { getGuestsCollection } = require('../../lib/db');
const { isAdminAuthenticated } = require('../../lib/auth');
const { generateCode } = require('../../lib/codes');

function formatGuest(doc) {
  return {
    name: doc.name,
    code: doc.code,
    link: '/invite/' + doc.code,
    attending: doc.attending || 'pending',
    message: doc.message || '',
    createdAt: doc.createdAt,
    respondedAt: doc.respondedAt || null,
  };
}

module.exports = async function handler(req, res) {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const guests = await getGuestsCollection();

  if (req.method === 'GET') {
    const list = await guests.find({}).sort({ createdAt: -1 }).toArray();
    res.status(200).json(list.map(formatGuest));
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};
    const name = (body.name || '').toString().trim();
    if (!name) {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    let inserted = false;
    let attempts = 0;
    let code;
    while (!inserted && attempts < 5) {
      code = generateCode();
      attempts++;
      try {
        await guests.insertOne({
          name,
          code,
          attending: 'pending',
          message: '',
          createdAt: new Date(),
          respondedAt: null,
        });
        inserted = true;
      } catch (err) {
        if (err && err.code === 11000) continue;
        res.status(500).json({ error: 'server error' });
        return;
      }
    }

    if (!inserted) {
      res.status(500).json({ error: 'could not generate a unique code, try again' });
      return;
    }

    res.status(201).json({ name, code, link: '/invite/' + code });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
