const jwt = require('jsonwebtoken');

function auth(roles = []) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ data: null, error: 'Authentication required' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ data: null, error: 'Insufficient permissions' });
      }
      next();
    } catch {
      res.status(401).json({ data: null, error: 'Invalid or expired token' });
    }
  };
}

module.exports = auth;
