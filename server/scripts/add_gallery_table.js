const path = require('path');
const better_sqlite3 = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'data', 'hotel_vahdat.db');
const db = better_sqlite3(dbPath);

try {
  console.log('📸 Создание таблицы gallery...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ Таблица gallery создана успешно!');
  
  // Проверка существующих колонок
  const columns = db.pragma('table_info(gallery)');
  console.log('\n📋 Колонки таблицы gallery:');
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });
  
} catch (error) {
  console.error('❌ Ошибка создания таблицы:', error);
} finally {
  db.close();
}

