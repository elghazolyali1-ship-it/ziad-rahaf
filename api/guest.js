const { getGuestsCollection } = require('../lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const code = (req.query.code || '').toString().trim();
  if (!code) {
    res.status(400).json({ error: 'code is required' });
    return;
  }

  try {
    const guests = await getGuestsCollection();
    const guest = await guests.findOne({ code });
    if (!guest) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    res.status(200).json({
      name: guest.name,
      attending: guest.attending || 'pending',
      message: guest.message || '',
    });
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
};
