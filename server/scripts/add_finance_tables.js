const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'hotel_vahdat.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

console.log('✓ Подключен к SQLite');

// Создаем финансовые таблицы
try {
  db.exec(`
    -- Доходы
    CREATE TABLE IF NOT EXISTS financial_incomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount DECIMAL(10, 2) NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('Номер', 'Ресторан', 'Услуги', 'Прочее')),
      booking_id INTEGER,
      date DATE NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
    );

    -- Расходы
    CREATE TABLE IF NOT EXISTS financial_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount DECIMAL(10, 2) NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('Персонал', 'Коммунальные услуги', 'Закупки', 'Прочее')),
      date DATE NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('✓ Финансовые таблицы созданы');
  
  // Индексируем для быстрых запросов
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_incomes_date ON financial_incomes(date);
    CREATE INDEX IF NOT EXISTS idx_incomes_type ON financial_incomes(type);
    CREATE INDEX IF NOT EXISTS idx_incomes_booking ON financial_incomes(booking_id);
    
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON financial_expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_type ON financial_expenses(type);
  `);
  
  console.log('✓ Индексы созданы');
  
} catch (error) {
  console.error('Ошибка создания таблиц:', error);
  db.close();
  process.exit(1);
}

console.log('\n✅ Финансовая миграция завершена!');
db.close();
process.exit(0);

