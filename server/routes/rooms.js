const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Получить все номера
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rooms WHERE status = ?', ['active']);
    
    // Получаем фотографии для каждого номера
    for (const room of rows) {
      const [photos] = await db.query('SELECT * FROM room_photos WHERE room_id = ? ORDER BY is_primary DESC', [room.id]);
      // Преобразуем относительные пути в полные URL
      room.photos = photos.map(photo => ({
        ...photo,
        photo_url: photo.photo_url.startsWith('http') ? photo.photo_url : `http://localhost:5000${photo.photo_url}`
      }));
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения номеров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить номер по ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rooms WHERE id = ? AND status = ?', 
      [req.params.id, 'active']);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Номер не найден' });
    }
    
    // Получаем фотографии номера
    const [photos] = await db.query('SELECT * FROM room_photos WHERE room_id = ? ORDER BY is_primary DESC', 
      [req.params.id]);
    
    // Преобразуем относительные пути в полные URL
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      photo_url: photo.photo_url.startsWith('http') ? photo.photo_url : `http://localhost:5000${photo.photo_url}`
    }));
    
    res.json({ ...rows[0], photos: photosWithUrls });
  } catch (error) {
    console.error('Ошибка получения номера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

