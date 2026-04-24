const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { validateUser } = require('../validation');

router.post('/signup', async (req, res) => {
  const { name, email, password, address } = req.body;

  const err = validateUser({ name, email, password, address });
  if (err) return res.status(400).json({ data: null, error: err });

  try {
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length) {
      return res.status(409).json({ data: null, error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, 'user')
       RETURNING id, name, email, role`,
      [name.trim(), email.toLowerCase(), hash, address?.trim() || null]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ data: { token, user }, error: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ data: null, error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ data: null, error: 'Email and password required' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ data: null, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      error: null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ data: null, error: 'Server error' });
  }
});

module.exports = router;
