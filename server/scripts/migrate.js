const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const backupsDir = path.join(dataDir, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'hotel_vahdat.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

console.log('✓ Подключен к SQLite');

// Создаем таблицы
try {
  db.exec(`
    -- Номера
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('economy', 'standard', 'luxury', 'suite')),
      price REAL NOT NULL,
      currency TEXT DEFAULT 'TJS',
      description TEXT,
      full_description TEXT,
      amenities TEXT,
      capacity INTEGER DEFAULT 2,
      area REAL,
      beds TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      sort_order INTEGER DEFAULT 0,
      seo_title TEXT,
      seo_description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Мультиязычный контент для номеров
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
    
    -- Фотографии номеров
    CREATE TABLE IF NOT EXISTS room_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      photo_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );
    
    -- Бронирования
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INTEGER NOT NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      special_requests TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );
    
    -- Услуги
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Отзывы
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Контакты
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT,
      phone TEXT,
      email TEXT,
      whatsapp TEXT,
      telegram TEXT,
      website TEXT,
      map_embed TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Сообщения из формы обратной связи
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Администраторы
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'manager', 'editor')),
      is_active INTEGER DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Логи действий
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
    );
    
    -- Настройки сайта
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT,
      type TEXT DEFAULT 'text',
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Мультиязычный контент для страниц
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      template TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS page_contents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_id INTEGER NOT NULL,
      language TEXT NOT NULL DEFAULT 'ru' CHECK (language IN ('ru', 'en', 'tg')),
      title TEXT,
      content TEXT,
      meta_title TEXT,
      meta_description TEXT,
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    );
    
    -- Триггер для обновления updated_at
    CREATE TRIGGER IF NOT EXISTS update_rooms_timestamp 
    AFTER UPDATE ON rooms
    BEGIN
      UPDATE rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
    
    CREATE TRIGGER IF NOT EXISTS update_bookings_timestamp 
    AFTER UPDATE ON bookings
    BEGIN
      UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
    
    CREATE TRIGGER IF NOT EXISTS update_contacts_timestamp 
    AFTER UPDATE ON contacts
    BEGIN
      UPDATE contacts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);
  
  console.log('✓ Таблицы созданы');
} catch (error) {
  console.error('Ошибка создания таблиц:', error);
  db.close();
  process.exit(1);
}

// Создаем дефолтного админа
async function createAdmin() {
  try {
    const count = db.prepare('SELECT COUNT(*) as count FROM admins').get();
    
    if (count.count > 0) {
      console.log('✓ Админ уже существует');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    db.prepare('INSERT INTO admins (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)')
      .run('admin', 'admin@hotelvahdat.com', hashedPassword, 'admin', 1);
    
    console.log('✓ Дефолтный админ создан (username: admin, password: admin123, role: admin)');
  } catch (error) {
    console.error('Ошибка создания админа:', error);
  }
}

// Добавляем тестовые данные
function addTestData() {
  const count = db.prepare('SELECT COUNT(*) as count FROM rooms').get();
  
  if (count.count > 0) {
    console.log('✓ Тестовые данные уже существуют');
    return;
  }
  
  const testRooms = [
    {
      name: 'Эконом номер',
      type: 'economy',
      price: 80,
      description: 'Комфортный номер для экономных путешественников',
      amenities: JSON.stringify(['Wi-Fi', 'Телевизор', 'Кондиционер']),
      capacity: 2,
      status: 'active'
    },
    {
      name: 'Стандартный номер',
      type: 'standard',
      price: 120,
      description: 'Уютный номер со всеми удобствами',
      amenities: JSON.stringify(['Wi-Fi', 'Телевизор', 'Кондиционер', 'Мини-бар', 'Сейф']),
      capacity: 2,
      status: 'active'
    },
    {
      name: 'Люкс номер',
      type: 'luxury',
      price: 200,
      description: 'Просторный номер премиум класса',
      amenities: JSON.stringify(['Wi-Fi', 'Smart TV', 'Кондиционер', 'Мини-бар', 'Сейф', 'Джакузи']),
      capacity: 2,
      status: 'active'
    },
    {
      name: 'Люкс сьют',
      type: 'suite',
      price: 350,
      description: 'Роскошный сьют с гостиной и спальней',
      amenities: JSON.stringify(['Wi-Fi', 'Smart TV', 'Кондиционер', 'Мини-бар', 'Сейф', 'Джакузи', 'Терасса', 'Булер']),
      capacity: 4,
      status: 'active'
    }
  ];
  
  const insertRoom = db.prepare('INSERT INTO rooms (name, type, price, description, amenities, capacity, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  
  const insertManyRooms = db.transaction((rooms) => {
    for (const room of rooms) {
      insertRoom.run(room.name, room.type, room.price, room.description, room.amenities, room.capacity, room.status);
    }
  });
  
  try {
    insertManyRooms(testRooms);
    console.log('✓ Тестовые номера добавлены');
  } catch (error) {
    console.error('Ошибка добавления тестовых номеров:', error);
  }
  
  // Добавляем тестовые услуги
  const testServices = [
    ['Завтрак', 'Вкусный завтрак "шведский стол"', 'restaurant', 'active', 1],
    ['Трансфер', 'Встреча и проводы гостей', 'car', 'active', 2],
    ['Конференц-зал', 'Для деловых встреч и мероприятий', 'conference', 'active', 3],
    ['Прачечная', 'Стирка и химчистка', 'laundry', 'active', 4],
    ['Room Service', 'Обслуживание в номере', 'room-service', 'active', 5],
    ['Парковка', 'Охраняемая стоянка', 'parking', 'active', 6]
  ];
  
  const insertService = db.prepare('INSERT INTO services (name, description, icon, status, sort_order) VALUES (?, ?, ?, ?, ?)');
  const insertManyServices = db.transaction((services) => {
    for (const service of services) {
      insertService.run(...service);
    }
  });
  
  try {
    insertManyServices(testServices);
    console.log('✓ Тестовые услуги добавлены');
  } catch (error) {
    console.error('Ошибка добавления услуг:', error);
  }
  
  // Добавляем контакты
  try {
    db.prepare(`
      INSERT INTO contacts (address, phone, email, whatsapp, telegram, website)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'Душанбе, проспект Рудаки, 84',
      '+992 (37) 227-77-77',
      'info@hotelvahdat.com',
      '+992 93 500-77-77',
      '@hotelvahdat',
      'www.hotelvahdat.com'
    );
    console.log('✓ Контакты добавлены');
  } catch (error) {
    if (!error.message.includes('UNIQUE constraint')) {
      console.error('Ошибка добавления контактов:', error);
    }
  }
  
  // Добавляем тестовые отзывы
  const testReviews = [
    ['Александр', 5, 'Отличный отель! Очень чисто и уютно. Персонал приветливый.', 'approved'],
    ['Зайнаб', 4, 'Прекрасное место для отдыха. Рекомендую!', 'approved'],
    ['John Smith', 5, 'Great hotel! Very clean and comfortable.', 'approved']
  ];
  
  const insertReview = db.prepare('INSERT INTO reviews (guest_name, rating, comment, status) VALUES (?, ?, ?, ?)');
  const insertManyReviews = db.transaction((reviews) => {
    for (const review of reviews) {
      insertReview.run(...review);
    }
  });
  
  try {
    insertManyReviews(testReviews);
    console.log('✓ Тестовые отзывы добавлены');
  } catch (error) {
    console.error('Ошибка добавления отзывов:', error);
  }
}

// Запускаем миграцию
async function migrate() {
  await createAdmin();
  addTestData();
  
  console.log('\n✅ Миграция базы данных завершена!');
  db.close();
  process.exit(0);
}

migrate().catch(error => {
  console.error('Ошибка миграции:', error);
  db.close();
  process.exit(1);
});
