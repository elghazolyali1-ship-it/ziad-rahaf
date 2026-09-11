const crypto = require('crypto');
const { setAdminCookie } = require('../../lib/auth');

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

  const password = (body.password || '').toString();
  const expected = process.env.ADMIN_PASSWORD || '';

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  const match = expected.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!match) {
    res.status(401).json({ error: 'invalid password' });
    return;
  }

  setAdminCookie(res);
  res.status(200).json({ ok: true });
};
