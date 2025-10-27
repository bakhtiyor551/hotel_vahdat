const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'rooms');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'room-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Допустимы только изображения (JPEG, PNG, WebP)'));
  }
});

// Логирование действий
function logAction(req, action, resourceType, resourceId, details) {
  const ip = req.ip || req.connection.remoteAddress;
  db.prepare(
    'INSERT INTO activity_logs (admin_id, action, resource_type, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user?.id, action, resourceType, resourceId, details, ip);
}

// Публичный роут для галереи (без авторизации)
router.get('/gallery/public', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM gallery ORDER BY created_at DESC');
    const images = result[0]; // Получаем первый элемент массива
    // Преобразуем пути к полным URL
    const imagesWithFullUrl = images.map(img => ({
      ...img,
      image_url: img.image_url.startsWith('http') ? img.image_url : `http://localhost:5000${img.image_url}`
    }));
    res.json(imagesWithFullUrl);
  } catch (error) {
    console.error('Ошибка получения галереи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Все роуты админки требуют авторизации
router.use(auth);

// ========== ПАНЕЛЬ УПРАВЛЕНИЯ ==========
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Статистика номеров
    const roomsStats = db.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as active FROM rooms').get('active');
    
    // Статистика бронирований
    const [bookingsAll] = await db.query('SELECT COUNT(*) as count FROM bookings');
    const [bookingsPending] = await db.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");
    const [bookingsToday] = await db.query('SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = ?', [today]);
    
    // Доходы за текущий месяц
    const [revenue] = await db.query(`
      SELECT SUM(
        CAST(julianday(booking.check_out) - julianday(booking.check_in) AS INTEGER) * room.price
      ) as total
      FROM bookings booking
      JOIN rooms room ON booking.room_id = room.id
      WHERE booking.status = 'confirmed' 
        AND strftime('%Y-%m', booking.check_in) = strftime('%Y-%m', date('now'))
    `);
    
    // Загрузка номеров (процент занятых номеров в этом месяце)
    const [occupancy] = await db.query(`
      SELECT 
        (
          SELECT COUNT(DISTINCT room_id) 
          FROM bookings 
          WHERE status = 'confirmed' 
            AND strftime('%Y-%m', check_in) = strftime('%Y-%m', date('now'))
        ) * 100.0 / 
        (
          SELECT COUNT(*) FROM rooms WHERE status = 'active'
        ) as percentage
    `);
    
    res.json({
      rooms: roomsStats,
      bookings: {
        total: bookingsAll[0].count,
        pending: bookingsPending[0].count,
        today: bookingsToday[0].count
      },
      revenue: revenue[0]?.total || 0,
      occupancy: occupancy[0]?.percentage || 0
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== НОМЕРА ==========
router.get('/rooms', async (req, res) => {
  try {
    const { search, status, type, sortBy = 'id', sortOrder = 'DESC' } = req.query;
    let query = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    const [rows] = await db.query(query, params);
    
    // Получаем фото для каждого номера
    for (const room of rows) {
      const photos = db.prepare('SELECT * FROM room_photos WHERE room_id = ? ORDER BY is_primary DESC').all(room.id);
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

router.get('/rooms/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Номер не найден' });
    }
    const photos = db.prepare('SELECT * FROM room_photos WHERE room_id = ? ORDER BY is_primary DESC').all(req.params.id);
    // Преобразуем относительные пути в полные URL
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      photo_url: photo.photo_url.startsWith('http') ? photo.photo_url : `http://localhost:5000${photo.photo_url}`
    }));
    res.json({ ...rows[0], photos: photosWithUrls });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/rooms', upload.array('photos', 10), async (req, res) => {
  try {
    // Получаем данные из формы
    const name = req.body.name;
    const type = req.body.type;
    const price = parseFloat(req.body.price);
    const currency = req.body.currency || 'TJS';
    const description = req.body.description || '';
    const full_description = req.body.full_description || '';
    let amenities = req.body.amenities || '';
    
    // Если amenities приходит как JSON строка, парсим её
    if (typeof amenities === 'string' && amenities.startsWith('[')) {
      try {
        amenities = JSON.parse(amenities);
      } catch (e) {
        console.log('Ошибка парсинга amenities:', e);
      }
    }
    
    // Преобразуем amenities в строку для БД
    const amenitiesString = Array.isArray(amenities) ? JSON.stringify(amenities) : amenities;
    
    const capacity = parseInt(req.body.capacity) || 2;
    const area = req.body.area ? parseFloat(req.body.area) : null;
    const beds = req.body.beds || '';
    const status = req.body.status || 'active';
    const sort_order = parseInt(req.body.sort_order) || 0;
    const seo_title = req.body.seo_title || '';
    const seo_description = req.body.seo_description || '';
    
    // Валидация обязательных полей
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ error: 'Название должно быть не менее 3 символов' });
    }
    if (!type) {
      return res.status(400).json({ error: 'Тип номера обязателен' });
    }
    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Цена должна быть больше 0' });
    }
    if (!capacity || capacity < 1) {
      return res.status(400).json({ error: 'Количество гостей должно быть минимум 1' });
    }
    
    // Проверяем на дубликат названия
    const existing = db.prepare('SELECT id FROM rooms WHERE name = ?').get(name);
    if (existing) {
      return res.status(400).json({ error: 'Номер с таким названием уже существует' });
    }
    
    // Фото больше не обязательны
    
    // Вставляем номер в базу
    const result = db.prepare(
      'INSERT INTO rooms (name, type, price, currency, description, full_description, amenities, capacity, area, beds, status, sort_order, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, type, price, currency, description, full_description, amenitiesString, capacity, area, beds, status, sort_order, seo_title, seo_description);
    
    const roomId = result.lastInsertRowid;
    
    // Сохраняем фото
    if (req.files && req.files.length > 0) {
      const insertPhoto = db.prepare('INSERT INTO room_photos (room_id, photo_url, is_primary) VALUES (?, ?, ?)');
      
      req.files.forEach((file, index) => {
        const photoUrl = `/uploads/rooms/${file.filename}`;
        insertPhoto.run(roomId, photoUrl, index === 0 ? 1 : 0);
      });
    }
    
    logAction(req, 'create', 'room', roomId, `Создан номер: ${name}`);
    
    res.json({ message: 'Номер успешно добавлен', id: roomId });
  } catch (error) {
    console.error('Ошибка создания номера:', error);
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

// Обновление номера
router.put('/rooms/:id', upload.array('photos', 10), async (req, res) => {
  try {
    let { 
      name, type, price, currency, description, full_description, amenities, 
      capacity, status, area, beds, seo_title, seo_description, sort_order,
      existing_photo_ids 
    } = req.body;
    
    // Если amenities приходит как JSON строка, парсим её
    if (typeof amenities === 'string' && amenities.startsWith('[')) {
      try {
        amenities = JSON.parse(amenities);
      } catch (e) {
        console.log('Ошибка парсинга amenities:', e);
      }
    }
    
    // Преобразуем amenities в строку для БД
    const amenitiesString = Array.isArray(amenities) ? JSON.stringify(amenities) : amenities;
    
    await db.query(
      `UPDATE rooms SET 
        name = ?, type = ?, price = ?, currency = ?, description = ?, 
        full_description = ?, amenities = ?, capacity = ?, status = ?,
        area = ?, beds = ?, seo_title = ?, seo_description = ?, sort_order = ?
      WHERE id = ?`,
      [name, type, price, currency, description, full_description, amenitiesString, 
       capacity, status, area, beds, seo_title, seo_description, sort_order, req.params.id]
    );
    
    // Удаляем фото, которые не в списке сохраняемых
    if (existing_photo_ids) {
      const photoIds = JSON.parse(existing_photo_ids);
      const [allPhotos] = await db.query('SELECT id FROM room_photos WHERE room_id = ?', [req.params.id]);
      const photosToDelete = allPhotos.filter(p => !photoIds.includes(p.id));
      
      for (const photo of photosToDelete) {
        const [photoData] = await db.query('SELECT photo_url FROM room_photos WHERE id = ?', [photo.id]);
        if (photoData.length > 0) {
          const filePath = path.join(__dirname, '..', photoData[0].photo_url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        await db.query('DELETE FROM room_photos WHERE id = ?', [photo.id]);
      }
    }
    
    // Добавляем новые фото
    if (req.files && req.files.length > 0) {
      const insertPhoto = db.prepare('INSERT INTO room_photos (room_id, photo_url, is_primary) VALUES (?, ?, ?)');
      req.files.forEach(file => {
        const photoUrl = `/uploads/rooms/${file.filename}`;
        insertPhoto.run(req.params.id, photoUrl, 0);
      });
    }
    
    logAction(req, 'update', 'room', req.params.id, `Обновлен номер: ${name}`);
    
    res.json({ message: 'Номер обновлен' });
  } catch (error) {
    console.error('Ошибка обновления номера:', error);
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

router.delete('/rooms/:id', async (req, res) => {
  try {
    // Удаляем фото
    const [photos] = await db.query('SELECT photo_url FROM room_photos WHERE room_id = ?', [req.params.id]);
    
    // Удаляем файлы
    photos.forEach(photo => {
      const filePath = path.join(__dirname, '..', photo.photo_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    await db.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
    
    logAction(req, 'delete', 'room', req.params.id, 'Удален номер');
    
    res.json({ message: 'Номер удален' });
  } catch (error) {
    console.error('Ошибка удаления номера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/rooms/:id/photos/:photoId', async (req, res) => {
  try {
    const [photo] = await db.query('SELECT photo_url FROM room_photos WHERE id = ?', [req.params.photoId]);
    
    if (photo.length > 0) {
      const filePath = path.join(__dirname, '..', photo[0].photo_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await db.query('DELETE FROM room_photos WHERE id = ?', [req.params.photoId]);
    res.json({ message: 'Фото удалено' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Массовое изменение
router.post('/rooms/bulk-update', async (req, res) => {
  try {
    const { ids, field, value } = req.body;
    const idsStr = ids.join(',');
    
    await db.query(`UPDATE rooms SET ${field} = ? WHERE id IN (${idsStr})`, [value]);
    
    logAction(req, 'bulk_update', 'room', idsStr, `Массовое изменение: ${field} = ${value}`);
    
    res.json({ message: 'Изменения применены' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== БРОНИРОВАНИЯ ==========
router.get('/bookings', async (req, res) => {
  try {
    const { status, startDate, endDate, roomId } = req.query;
    let query = `
      SELECT b.*, r.name as room_name, r.type as room_type, r.price as room_price 
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    if (startDate) {
      query += ' AND b.created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND b.created_at <= ?';
      params.push(endDate);
    }
    if (roomId) {
      query += ' AND b.room_id = ?';
      params.push(roomId);
    }
    
    query += ' ORDER BY b.created_at DESC';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения бронирований:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/bookings/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT b.*, r.name as room_name, r.type, r.price FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    
    logAction(req, 'update', 'booking', req.params.id, `Статус изменен на: ${status}`);
    
    res.json({ message: 'Статус обновлен' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/bookings/:id', async (req, res) => {
  try {
    const { check_in, check_out, guests, guest_name, guest_email, guest_phone, special_requests } = req.body;
    
    await db.query(
      'UPDATE bookings SET check_in = ?, check_out = ?, guests = ?, guest_name = ?, guest_email = ?, guest_phone = ?, special_requests = ? WHERE id = ?',
      [check_in, check_out, guests, guest_name, guest_email, guest_phone, special_requests, req.params.id]
    );
    
    logAction(req, 'update', 'booking', req.params.id, 'Бронирование обновлено');
    
    res.json({ message: 'Бронирование обновлено' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/bookings/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    logAction(req, 'delete', 'booking', req.params.id, 'Бронирование удалено');
    res.json({ message: 'Бронирование удалено' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== ОТЗЫВЫ ==========
router.get('/reviews', async (req, res) => {
  try {
    const { status, rating, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    let query = 'SELECT * FROM reviews WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (rating) {
      query += ' AND rating = ?';
      params.push(rating);
    }
    if (search) {
      query += ' AND (guest_name LIKE ? OR comment LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const { guest_name, rating, comment } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO reviews (guest_name, rating, comment, status) VALUES (?, ?, ?, ?)',
      [guest_name, rating, comment, 'pending']
    );
    
    logAction(req, 'create', 'review', result.insertId, `Создан отзыв от: ${guest_name}`);
    
    res.json({ message: 'Отзыв создан', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/reviews/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    
    logAction(req, 'update', 'review', req.params.id, `Статус изменен на: ${status}`);
    
    res.json({ message: 'Статус обновлен' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    logAction(req, 'delete', 'review', req.params.id, 'Отзыв удален');
    res.json({ message: 'Отзыв удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== УСЛУГИ ==========
router.get('/services', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services ORDER BY sort_order ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/services', async (req, res) => {
  try {
    const { name, description, icon, status, sort_order } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO services (name, description, icon, status, sort_order) VALUES (?, ?, ?, ?, ?)',
      [name, description, icon, status, sort_order]
    );
    
    logAction(req, 'create', 'service', result.insertId, `Создана услуга: ${name}`);
    
    res.json({ message: 'Услуга создана', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/services/:id', async (req, res) => {
  try {
    const { name, description, icon, status, sort_order } = req.body;
    
    await db.query(
      'UPDATE services SET name = ?, description = ?, icon = ?, status = ?, sort_order = ? WHERE id = ?',
      [name, description, icon, status, sort_order, req.params.id]
    );
    
    logAction(req, 'update', 'service', req.params.id, `Обновлена услуга: ${name}`);
    
    res.json({ message: 'Услуга обновлена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    logAction(req, 'delete', 'service', req.params.id, 'Услуга удалена');
    res.json({ message: 'Услуга удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== ПОЛЬЗОВАТЕЛИ ==========
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, role, is_active, last_login, created_at FROM admins ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      'INSERT INTO admins (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, 1]
    );
    
    logAction(req, 'create', 'user', result.insertId, `Создан пользователь: ${username}`);
    
    res.json({ message: 'Пользователь создан', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, role, is_active } = req.body;
    
    await db.query(
      'UPDATE admins SET username = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
      [username, email, role, is_active, req.params.id]
    );
    
    logAction(req, 'update', 'user', req.params.id, `Обновлен пользователь: ${username}`);
    
    res.json({ message: 'Пользователь обновлен' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== НАСТРОЙКИ ==========
router.get('/settings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    for (const [key, value] of Object.entries(settings)) {
      await db.query(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, value]
      );
    }
    
    logAction(req, 'update', 'settings', null, 'Настройки обновлены');
    
    res.json({ message: 'Настройки обновлены' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== ЛОГИ ДЕЙСТВИЙ ==========
router.get('/activity-logs', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const [rows] = await db.query(
      `SELECT al.*, a.username 
       FROM activity_logs al 
       LEFT JOIN admins a ON al.admin_id = a.id 
       ORDER BY al.created_at DESC 
       LIMIT ?`,
      [limit]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== ФИНАНСЫ ==========
// Получить все доходы с фильтрами
router.get('/finance/incomes', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let query = 'SELECT * FROM financial_incomes WHERE 1=1';
    const params = [];
    
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY date DESC, created_at DESC';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения доходов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить доход
router.post('/finance/incomes', async (req, res) => {
  try {
    const { amount, type, booking_id, date, comment } = req.body;
    
    if (!amount || !type || !date) {
      return res.status(400).json({ error: 'Обязательные поля: amount, type, date' });
    }
    
    const [result] = await db.query(
      'INSERT INTO financial_incomes (amount, type, booking_id, date, comment) VALUES (?, ?, ?, ?, ?)',
      [amount, type, booking_id || null, date, comment || null]
    );
    
    logAction(req, 'create', 'finance_income', result.insertId, `Добавлен доход: ${type} - ${amount}`);
    
    res.json({ message: 'Доход успешно добавлен', id: result.insertId });
  } catch (error) {
    console.error('Ошибка добавления дохода:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить доход
router.delete('/finance/incomes/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM financial_incomes WHERE id = ?', [req.params.id]);
    logAction(req, 'delete', 'finance_income', req.params.id, 'Доход удален');
    res.json({ message: 'Доход удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить все расходы с фильтрами
router.get('/finance/expenses', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let query = 'SELECT * FROM financial_expenses WHERE 1=1';
    const params = [];
    
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY date DESC, created_at DESC';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения расходов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить расход
router.post('/finance/expenses', async (req, res) => {
  try {
    const { amount, type, date, comment } = req.body;
    
    if (!amount || !type || !date) {
      return res.status(400).json({ error: 'Обязательные поля: amount, type, date' });
    }
    
    const [result] = await db.query(
      'INSERT INTO financial_expenses (amount, type, date, comment) VALUES (?, ?, ?, ?)',
      [amount, type, date, comment || null]
    );
    
    logAction(req, 'create', 'finance_expense', result.insertId, `Добавлен расход: ${type} - ${amount}`);
    
    res.json({ message: 'Расход успешно добавлен', id: result.insertId });
  } catch (error) {
    console.error('Ошибка добавления расхода:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить расход
router.delete('/finance/expenses/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM financial_expenses WHERE id = ?', [req.params.id]);
    logAction(req, 'delete', 'finance_expense', req.params.id, 'Расход удален');
    res.json({ message: 'Расход удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Статистика финансов
router.get('/finance/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let whereClause = '';
    const params = [];
    
    if (startDate && endDate) {
      whereClause = ' WHERE date >= ? AND date <= ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      whereClause = ' WHERE date >= ?';
      params.push(startDate);
    } else if (endDate) {
      whereClause = ' WHERE date <= ?';
      params.push(endDate);
    }
    
    // Общий доход
    const [totalIncome] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM financial_incomes${whereClause}`,
      params
    );
    
    // Общий расход
    const [totalExpense] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM financial_expenses${whereClause}`,
      params
    );
    
    // Доходы по типам
    const [incomesByType] = await db.query(
      `SELECT type, COALESCE(SUM(amount), 0) as total 
       FROM financial_incomes${whereClause} 
       GROUP BY type`,
      params
    );
    
    // Расходы по типам
    const [expensesByType] = await db.query(
      `SELECT type, COALESCE(SUM(amount), 0) as total 
       FROM financial_expenses${whereClause} 
       GROUP BY type`,
      params
    );
    
    // Помесячная динамика
    const [monthlyIncome] = await db.query(
      `SELECT strftime('%Y-%m', date) as month, COALESCE(SUM(amount), 0) as total 
       FROM financial_incomes${whereClause}
       GROUP BY strftime('%Y-%m', date)
       ORDER BY month DESC
       LIMIT 12`,
      params
    );
    
    const [monthlyExpense] = await db.query(
      `SELECT strftime('%Y-%m', date) as month, COALESCE(SUM(amount), 0) as total 
       FROM financial_expenses${whereClause}
       GROUP BY strftime('%Y-%m', date)
       ORDER BY month DESC
       LIMIT 12`,
      params
    );
    
    // Подтвержденные бронирования как доходы от номеров
    const [bookingIncome] = await db.query(
      `SELECT COALESCE(
        SUM((CAST(julianday(b.check_out) - julianday(b.check_in) AS INTEGER)) * r.price), 0
      ) as total
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.status = 'confirmed'${startDate ? ' AND b.check_in >= ?' : ''}${endDate ? (startDate ? ' AND b.check_out <= ?' : ' AND b.check_out <= ?') : ''}`,
      params.length > 0 ? params : []
    );
    
    res.json({
      totalIncome: totalIncome[0]?.total || 0,
      totalExpense: totalExpense[0]?.total || 0,
      netProfit: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
      bookingIncome: bookingIncome[0]?.total || 0,
      incomesByType,
      expensesByType,
      monthlyIncome,
      monthlyExpense
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== ГАЛЕРЕЯ ==========

// Настройка multer для галереи
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'gallery');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadGallery = multer({ 
  storage: galleryStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Допустимы только изображения (JPEG, PNG, WebP)'));
  }
});

// Получить все фото галереи
router.get('/gallery', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM gallery ORDER BY created_at DESC');
    const images = result[0]; // Получаем первый элемент массива
    res.json(images);
  } catch (error) {
    console.error('Ошибка получения галереи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить фото в галерею
router.post('/gallery', uploadGallery.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Нет файла для загрузки' });
    }
    
    const imageUrl = `/uploads/gallery/${req.file.filename}`;
    
    const result = await db.prepare(
      'INSERT INTO gallery (title, description, image_url) VALUES (?, ?, ?)'
    ).run(title, description || null, imageUrl);
    
    logAction(req, 'create', 'gallery_image', result.lastInsertRowid, `Добавлено фото в галерею: ${title}`);
    
    res.json({ 
      id: result.lastInsertRowid,
      message: 'Фото добавлено в галерею',
      image_url: imageUrl
    });
  } catch (error) {
    console.error('Ошибка добавления фото:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить фото из галереи
router.delete('/gallery/:id', async (req, res) => {
  try {
    const image = await db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Фото не найдено' });
    }
    
    // Удалить физический файл
    // image_url уже содержит /uploads/gallery/filename
    const filePath = path.join(__dirname, '..', 'uploads', 'gallery', path.basename(image.image_url));
    
    console.log('Попытка удалить файл:', filePath);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Файл удален успешно');
    } else {
      console.log('Файл не найден:', filePath);
    }
    
    await db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    logAction(req, 'delete', 'gallery_image', req.params.id, `Удалено фото из галереи: ${image.title}`);
    
    res.json({ message: 'Фото удалено из галереи' });
  } catch (error) {
    console.error('Ошибка удаления фото:', error);
    res.status(500).json({ error: error.message || 'Ошибка сервера' });
  }
});

module.exports = router;
