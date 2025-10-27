const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Получить отзывы
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM reviews WHERE status = ? ORDER BY created_at DESC LIMIT 20',
      ['approved']
    );
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения отзывов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить отзыв
router.post('/', async (req, res) => {
  try {
    const { guest_name, rating, comment } = req.body;
    
    await db.query(
      'INSERT INTO reviews (guest_name, rating, comment, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [guest_name, rating, comment, 'pending']
    );
    
    res.json({ message: 'Отзыв отправлен на модерацию' });
  } catch (error) {
    console.error('Ошибка добавления отзыва:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

