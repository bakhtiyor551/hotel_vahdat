const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Создаем директорию data если её нет
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Создаем директорию для бэкапов
const backupsDir = path.join(dataDir, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'hotel_vahdat.db');
const db = new Database(dbPath);

// Включаем foreign keys
db.pragma('foreign_keys = ON');

// Добавляем метод query для совместимости с MySQL синтаксисом (Promise-based)
db.query = async (query, params = []) => {
  try {
    const trimmedQuery = query.trim();
    const isSelect = trimmedQuery.toUpperCase().startsWith('SELECT');
    const isShow = trimmedQuery.toUpperCase().startsWith('SHOW');
    
    if (isSelect || isShow) {
      const results = db.prepare(query).all(params);
      return [results]; // Возвращаем массив массивов как в MySQL
    } else {
      // Для INSERT, UPDATE, DELETE возвращаем объект с affectedRows
      const result = db.prepare(query).run(params);
      return [{ affectedRows: result.changes, insertId: result.lastInsertRowid }];
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

module.exports = db;

