# Hotel Vahdat - Backend

Backend для сайта гостиницы HOTEL VAHDAT на Node.js + Express + SQLite

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Запустите миграцию базы данных:
```bash
npm run db:migrate
```

3. (Опционально) Создайте файл `.env` для дополнительных настроек:
```env
PORT=5000
JWT_SECRET=ваш-секретный-ключ
```

4. Запустите сервер:
```bash
# Режим разработки
npm run dev

# Режим продакшн
npm start
```

Сервер будет доступен на http://localhost:5000

## Дефолтный админ

- Username: `admin`
- Password: `admin123`

**ВАЖНО**: Измените пароль в продакшене!

## API Endpoints

### Общедоступные
- `GET /api/rooms` - Список номеров
- `GET /api/rooms/:id` - Детали номера
- `POST /api/bookings` - Создать бронирование
- `GET /api/services` - Список услуг
- `GET /api/reviews` - Отзывы гостей
- `POST /api/reviews` - Добавить отзыв
- `GET /api/contacts` - Контакты
- `POST /api/contacts/message` - Отправить сообщение

### Админ (требуют авторизации)
- `POST /api/auth/login` - Вход
- `GET /api/auth/verify` - Проверка токена
- `GET /api/admin/stats` - Статистика
- `GET /api/admin/rooms` - Управление номерами
- `GET /api/admin/bookings` - Управление бронированиями
- `GET /api/admin/reviews` - Управление отзывами

## Структура базы данных

- `rooms` - Номера
- `room_photos` - Фотографии номеров
- `bookings` - Бронирования
- `services` - Услуги
- `reviews` - Отзывы
- `contacts` - Контакты
- `contact_messages` - Сообщения из формы
- `admins` - Администраторы

