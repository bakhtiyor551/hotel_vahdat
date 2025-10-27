const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Получить контакты
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contacts LIMIT 1');
    
    if (rows.length === 0) {
      return res.json({
        address: 'Душанбе, проспект Рудаки, ...',
        phone: '+992 ...',
        email: 'info@hotelvahdat.com',
        whatsapp: '+992 ...',
        telegram: '@hotelvahdat',
        website: 'www.hotelvahdat.com'
      });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Ошибка получения контактов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отправить сообщение через форму обратной связи
router.post('/message', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    await db.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [name, email, phone, subject, message]
    );
    
    res.json({ message: 'Сообщение отправлено' });
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

