const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Получить все услуги
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services WHERE status = ? ORDER BY sort_order', ['active']);
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения услуг:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

