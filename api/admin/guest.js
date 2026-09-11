const { getGuestsCollection } = require('../../lib/db');
const { isAdminAuthenticated } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const code = (req.query.code || '').toString().trim();
  if (!code) {
    res.status(400).json({ error: 'code is required' });
    return;
  }

  const guests = await getGuestsCollection();

  if (req.method === 'DELETE') {
    const result = await guests.deleteOne({ code });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'PATCH') {
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
    const result = await guests.updateOne({ code }, { $set: { name } });
    if (result.matchedCount === 0) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
