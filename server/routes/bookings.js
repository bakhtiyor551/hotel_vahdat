const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Создать бронирование
router.post('/', async (req, res) => {
  try {
    const { room_id, check_in, check_out, guests, guest_name, guest_email, guest_phone, special_requests } = req.body;
    
    // Валидация обязательных полей
    if (!room_id || !check_in || !check_out || !guests || !guest_name || !guest_phone) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }
    
    // Проверка доступности номера
    const [existing] = await db.query(
      `SELECT * FROM bookings 
       WHERE room_id = ? 
       AND status IN ('pending', 'confirmed') 
       AND ((check_in <= ? AND check_out >= ?) OR (check_in <= ? AND check_out >= ?))`,
      [room_id, check_out, check_in, check_in, check_out]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Номер уже забронирован на эти даты' });
    }
    
    // Создаем бронирование (email теперь nullable)
    const [result] = await db.query(
      `INSERT INTO bookings (room_id, check_in, check_out, guests, guest_name, guest_email, guest_phone, special_requests, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
      [room_id, check_in, check_out, guests, guest_name, guest_email || null, guest_phone, special_requests || null]
    );
    
    res.json({ 
      message: 'Заявка на бронирование отправлена',
      booking_id: result.insertId 
    });
  } catch (error) {
    console.error('Ошибка создания бронирования:', error);
    res.status(500).json({ error: error.message || 'Ошибка сервера' });
  }
});

// Получить все бронирования
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, r.name as room_name, r.type 
       FROM bookings b 
       JOIN rooms r ON b.room_id = r.id 
       ORDER BY b.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения бронирований:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить статус бронирования
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Статус обновлен' });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить бронирование
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Бронирование удалено' });
  } catch (error) {
    console.error('Ошибка удаления бронирования:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

