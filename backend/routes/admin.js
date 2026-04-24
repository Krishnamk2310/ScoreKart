const router = require('express').Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const auth = require('../middleware/auth');
const { validateUser, validateStore } = require('../validation');

router.use(auth(['admin']));

router.get('/stats', async (req, res) => {
  try {
    const [users, stores, ratings] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query('SELECT COUNT(*) FROM stores'),
      db.query('SELECT COUNT(*) FROM ratings'),
    ]);
    res.json({
      data: {
        total_users: parseInt(users.rows[0].count),
        total_stores: parseInt(stores.rows[0].count),
        total_ratings: parseInt(ratings.rows[0].count),
      },
      error: null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ data: null, error: 'Server error' });
  }
});

router.get('/users', async (req, res) => {
  const { name, email, address, role, sort = 'name', order = 'asc' } = req.query;

  const conditions = [];
  const params = [];
  let idx = 1;

  if (name) { conditions.push(`name ILIKE $${idx++}`); params.push(`%${name}%`); }
  if (email) { conditions.push(`email ILIKE $${idx++}`); params.push(`%${email}%`); }
  if (address) { conditions.push(`address ILIKE $${idx++}`); params.push(`%${address}%`); }
  if (role) { conditions.push(`role = $${idx++}`); params.push(role); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const safeSort = ['name', 'email'].includes(sort) ? sort : 'name';
  const safeOrder = order === 'desc' ? 'DESC' : 'ASC';

  try {
    const result = await db.query(
      `SELECT id, name, email, address, role, created_at FROM users ${where} ORDER BY ${safeSort} ${safeOrder}`,
      params
    );
    res.json({ data: result.rows, error: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ data: null, error: 'Server error' });
  }
});

router.post('/users', async (req, res) => {
  const { name, email, password, address, role } = req.body;

  const err = validateUser({ name, email, password, address });
  if (err) return res.status(400).json({ data: null, error: err });
  if (!['admin', 'user', 'store_owner'].includes(role)) {
    return res.status(400).json({ data: null, error: 'Invalid role' });
  }

  try {
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length) return res.status(409).json({ data: null, error: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at`,
      [name.trim(), email.toLowerCase(), hash, address?.trim() || null, role]
    );
    res.status(201).json({ data: result.rows[0], error: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ data: null, error: 'Server error' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!userResult.rows.length) return res.status(404).json({ data: null, error: 'User not found' });

    const user = userResult.rows[0];

    let store = null;
    if (user.role === 'store_owner') {
      const storeResult = await db.query(
        `SELECT s.id, s.name, s.email, s.address,
           COALESCE(ROUND(AVG(r.value)::numeric, 1), 0) as avg_rating,
           COUNT(r.id) as total_ratings
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = $1
         GROUP BY s.id`,
        [user.id]
      );
      store = storeResult.rows[0] || null;
    }

    res.json({ data: { user, store }, error: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ data: null, error: 'Server error' });
  }
});

router.get('/stores', async (req, res) => {
  const { name, email, address, sort = 'name', order = 'asc' } = req.query;

  const conditions = [];
  const params = [];
  let idx = 1;

  if (name) { conditions.push(`s.name ILIKE $${idx++}`); params.push(`%${name}%`); }
  if (email) { conditions.push(`s.email ILIKE $${idx++}`); params.push(`%${email}%`); }
  if (address) { conditions.push(`s.address ILIKE $${idx++}`); params.push(`%${address}%`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortMap = { name: 's.name', email: 's.email', address: 's.address', avg_rating: 'avg_rating' };
  const safeSort = sortMap[sort] || 's.name';
  const safeOrder = order === 'desc' ? 'DESC' : 'ASC';

  try {
    const result = await db.query(
      `SELECT s.id, s.name, s.email, s.address, s.created_at,
         u.name as owner_name, u.id as owner_id,
         COALESCE(ROUND(AVG(r.value)::numeric, 1), 0) as avg_rating,
         COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN users u ON u.id = s.owner_id
       LEFT JOIN ratings r ON r.store_id = s.id
       ${where}
       GROUP BY s.id, u.name, u.id
       ORDER BY ${safeSort} ${safeOrder}`,
      params
    );
    res.json({ data: result.rows, error: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ data: null, error: 'Server error' });
  }
});

router.post('/stores', async (req, res) => {
  const { name, email, address, owner_id } = req.body;

  const err = validateStore({ name, email, address });
  if (err) return res.status(400).json({ data: null, error: err });

  try {
    if (owner_id) {
      const owner = await db.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'store_owner'",
        [owner_id]
      );
      if (!owner.rows.length) {
        return res.status(400).json({ data: null, error: 'Owner must be a store_owner user' });
      }
    }

    const result = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), email.toLowerCase(), address?.trim() || null, owner_id || null]
    );
    res.status(201).json({ data: result.rows[0], error: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ data: null, error: 'Server error' });
  }
});

module.exports = router;
