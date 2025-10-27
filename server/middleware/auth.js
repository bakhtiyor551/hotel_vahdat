const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Нет доступа' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Невалидный токен' });
  }
};

// Middleware для проверки ролей
module.exports.requireRole = (...roles) => {
  return async (req, res, next) => {
    const db = require('../config/database');
    
    try {
      const [users] = await db.query('SELECT role FROM admins WHERE id = ?', [req.user.id]);
      
      if (users.length === 0 || !roles.includes(users[0].role)) {
        return res.status(403).json({ error: 'Недостаточно прав доступа' });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  };
};
