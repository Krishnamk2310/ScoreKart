const router = require('express').Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const auth = require('../middleware/auth');
const { pwRe } = require('../validation');

router.put('/me/password', auth(), async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ data: null, error: 'Both current and new password are required' });
  }
  if (!pwRe.test(new_password)) {
    return res.status(400).json({
      data: null,
      error: 'New password must be 8–16 chars with at least 1 uppercase and 1 special character',
    });
  }

  try {
    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(current_password, user.password_hash))) {
      return res.status(401).json({ data: null, error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ data: { message: 'Password updated' }, error: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ data: null, error: 'Server error' });
  }
});

// Store owner: get their store + all users who rated it
router.get('/me/store', auth(['store_owner']), async (req, res) => {
  try {
    const storeResult = await db.query(
      `SELECT s.id, s.name, s.email, s.address,
         COALESCE(ROUND(AVG(r.value)::numeric, 1), 0) as avg_rating,
         COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [req.user.id]
    );

    if (!storeResult.rows.length) {
      return res.status(404).json({ data: null, error: 'No store found for this account' });
    }

    const store = storeResult.rows[0];

    const ratingsResult = await db.query(
      `SELECT u.name, u.email, r.value, r.created_at, r.updated_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    res.json({ data: { store, ratings: ratingsResult.rows }, error: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ data: null, error: 'Server error' });
  }
});

module.exports = router;
