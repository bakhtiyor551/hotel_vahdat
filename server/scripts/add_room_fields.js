const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'hotel_vahdat.db');

if (!fs.existsSync(dbPath)) {
  console.log('База данных не найдена. Запустите migrate.js сначала.');
  process.exit(0);
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('✓ Подключен к SQLite');

// Добавляем новые поля в таблицу rooms
try {
  // Проверяем, существуют ли уже новые поля
  const checkColumns = db.prepare(`
    SELECT sql FROM sqlite_master WHERE type='table' AND name='rooms'
  `).get();
  
  if (checkColumns && checkColumns.sql) {
    console.log('Проверяем существующие поля...');
    
    // Добавляем новые колонки только если их еще нет
    const columns = [
      { name: 'currency', type: 'TEXT DEFAULT \'TJS\'' },
      { name: 'full_description', type: 'TEXT' },
      { name: 'area', type: 'REAL' },
      { name: 'beds', type: 'TEXT' },
      { name: 'sort_order', type: 'INTEGER DEFAULT 0' },
      { name: 'seo_title', type: 'TEXT' },
      { name: 'seo_description', type: 'TEXT' }
    ];
    
    columns.forEach(col => {
      if (!checkColumns.sql.includes(`"${col.name}"`)) {
        try {
          db.exec(`ALTER TABLE rooms ADD COLUMN ${col.name} ${col.type}`);
          console.log(`✓ Добавлено поле: ${col.name}`);
        } catch (error) {
          if (error.message.includes('duplicate column name')) {
            console.log(`- Поле ${col.name} уже существует`);
          } else {
            console.error(`Ошибка добавления ${col.name}:`, error.message);
          }
        }
      } else {
        console.log(`- Поле ${col.name} уже существует`);
      }
    });
    
    // Создаем таблицу для переводов если её нет
    const checkTranslations = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='room_translations'
    `).get();
    
    if (!checkTranslations) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS room_translations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_id INTEGER NOT NULL,
          language TEXT NOT NULL DEFAULT 'ru' CHECK (language IN ('ru', 'en', 'tj')),
          name TEXT,
          description TEXT,
          full_description TEXT,
          FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
          UNIQUE(room_id, language)
        );
      `);
      console.log('✓ Таблица room_translations создана');
    } else {
      console.log('- Таблица room_translations уже существует');
    }
    
    console.log('\n✅ Миграция завершена!');
  }
  
} catch (error) {
  console.error('Ошибка миграции:', error);
  db.close();
  process.exit(1);
}

db.close();
process.exit(0);

