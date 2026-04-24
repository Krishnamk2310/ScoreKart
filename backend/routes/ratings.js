const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth(['user']), async (req, res) => {
  const { store_id, value } = req.body;

  if (!store_id || !value) {
    return res.status(400).json({ data: null, error: 'store_id and value are required' });
  }
  if (!Number.isInteger(Number(value)) || value < 1 || value > 5) {
    return res.status(400).json({ data: null, error: 'Rating must be an integer between 1 and 5' });
  }

  try {
    const storeCheck = await db.query('SELECT id FROM stores WHERE id = $1', [store_id]);
    if (!storeCheck.rows.length) {
      return res.status(404).json({ data: null, error: 'Store not found' });
    }

    const result = await db.query(
      `INSERT INTO ratings (user_id, store_id, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
       RETURNING *`,
      [req.user.id, store_id, value]
    );

    res.json({ data: result.rows[0], error: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ data: null, error: 'Server error' });
  }
});

module.exports = router;
