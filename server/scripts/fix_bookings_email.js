const db = require('../config/database');
const path = require('path');
const fs = require('fs');

console.log('Начинаем миграцию таблицы bookings...');

try {
  // Проверяем структуру таблицы
  const tableInfo = db.prepare('PRAGMA table_info(bookings)').all();
  console.log('Текущая структура:', tableInfo);
  
  // Проверяем, нужно ли обновлять
  const emailColumn = tableInfo.find(col => col.name === 'guest_email');
  
  if (emailColumn && emailColumn.notnull === 1) {
    // Отключаем foreign keys временно
    db.pragma('foreign_keys = OFF');
    
    // Создаем резервную копию
    console.log('Создание резервной копии...');
    const backupPath = path.join(__dirname, '..', 'data', 'backups', `hotel_vahdat_backup_${Date.now()}.db`);
    fs.copyFileSync(
      path.join(__dirname, '..', 'data', 'hotel_vahdat.db'),
      backupPath
    );
    console.log('✓ Резервная копия создана:', backupPath);
    
    // Пересоздаем таблицу с nullable guest_email
    console.log('Пересоздание таблицы bookings...');
    
    db.exec(`
      -- Создаем временную таблицу
      CREATE TABLE bookings_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        guests INTEGER NOT NULL,
        guest_name TEXT NOT NULL,
        guest_email TEXT,
        guest_phone TEXT NOT NULL,
        special_requests TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      );
      
      -- Копируем данные
      INSERT INTO bookings_new SELECT * FROM bookings;
      
      -- Удаляем старую таблицу
      DROP TABLE bookings;
      
      -- Переименовываем новую таблицу
      ALTER TABLE bookings_new RENAME TO bookings;
    `);
    
    // Включаем foreign keys обратно
    db.pragma('foreign_keys = ON');
    
    console.log('✓ Таблица bookings успешно обновлена');
  } else {
    console.log('✓ Таблица уже имеет правильную структуру');
  }
  
  // Проверяем финальную структуру
  const finalInfo = db.prepare('PRAGMA table_info(bookings)').all();
  console.log('Финальная структура:', finalInfo);
  
} catch (error) {
  console.error('Ошибка миграции:', error);
  process.exit(1);
}

console.log('✓ Миграция завершена');
process.exit(0);

