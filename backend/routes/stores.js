const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// All authenticated users can browse stores
router.get('/', auth(['user', 'admin', 'store_owner']), async (req, res) => {
  const { search = '' } = req.query;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT s.id, s.name, s.address, s.email,
         COALESCE(ROUND(AVG(r.value)::numeric, 1), 0) as avg_rating,
         COUNT(r.id) as total_ratings,
         ur.value as user_rating,
         ur.id as user_rating_id
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $1
       WHERE s.name ILIKE $2 OR s.address ILIKE $2
       GROUP BY s.id, ur.value, ur.id
       ORDER BY s.name`,
      [userId, `%${search}%`]
    );
    res.json({ data: result.rows, error: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ data: null, error: 'Server error' });
  }
});

module.exports = router;
