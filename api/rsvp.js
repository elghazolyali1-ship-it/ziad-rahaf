const { getGuestsCollection } = require('../lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  body = body || {};

  const code = (body.code || '').toString().trim();
  const attending = (body.attending || '').toString().trim();
  const message = (body.message || '').toString().trim().slice(0, 500);

  if (!code) {
    res.status(400).json({ error: 'code is required' });
    return;
  }
  if (attending !== 'yes' && attending !== 'no') {
    res.status(400).json({ error: 'attending must be yes or no' });
    return;
  }

  try {
    const guests = await getGuestsCollection();
    const result = await guests.updateOne(
      { code },
      { $set: { attending, message, respondedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      res.status(404).json({ error: 'guest not found' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
};
