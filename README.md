# 🏨 HOTEL VAHDAT - Веб-сайт гостиницы

Современный, многоязычный веб-сайт для гостиницы HOTEL VAHDAT в Душанбе, Таджикистан.

## 📋 Описание

Проект представляет собой полнофункциональный веб-сайт для гостиницы с функциями:
- 📱 Адаптивный дизайн (десктоп, планшет, мобильный)
- 🌍 Многоязычность (Русский, Таджикский, Английский)
- 🛏️ Онлайн-бронирование номеров
- 💬 Форма обратной связи
- ⭐ Система отзывов
- 🔐 Админ-панель для управления контентом

## 🛠️ Технологии

### Backend
- **Node.js** с Express
- **SQLite** база данных (better-sqlite3)
- RESTful API
- JWT аутентификация

### Frontend
- **React** + Vite
- **React Router** для роутинга
- **TailwindCSS** для стилей
- **React i18next** для переводов

## 🚀 Быстрый старт

### Предварительные требования
- Node.js (v16 или выше)
- npm или yarn

### Установка

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/yourusername/hotel-vahdat.git
cd hotel-vahdat
```

2. **Настройка Backend:**

```bash
cd server
npm install
```

Запустите миграцию:
```bash
npm run db:migrate
```

Запустите сервер:
```bash
npm run dev
# или
npm start
```

Backend будет на http://localhost:5000

3. **Настройка Frontend:**

```bash
cd client
npm install
```

Запустите dev server:
```bash
npm run dev
```

Frontend будет на http://localhost:3000

## 📁 Структура проекта

```
hotel-vahdat/
├── server/           # Backend (Node.js + Express)
│   ├── routes/      # API роуты
│   ├── config/      # Конфигурация БД
│   ├── middleware/  # Middleware
│   └── scripts/     # Скрипты миграции
├── client/          # Frontend (React)
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── pages/       # Страницы
│   │   ├── utils/       # Утилиты
│   │   └── locales/     # Переводы
└── README.md
```

## 🔑 Дефолтный админ

При запуске миграции создается дефолтный администратор:
- **Username:** admin
- **Password:** admin123

⚠️ **ИЗМЕНИТЕ ПАРОЛЬ В ПРОДАКШЕНЕ!**

## 📝 API Endpoints

### Публичные
- `GET /api/rooms` - Список номеров
- `GET /api/rooms/:id` - Детали номера
- `POST /api/bookings` - Создать бронирование
- `GET /api/services` - Список услуг
- `GET /api/reviews` - Отзывы
- `POST /api/reviews` - Добавить отзыв
- `GET /api/contacts` - Контакты
- `POST /api/contacts/message` - Отправить сообщение

### Админ (требуют авторизации)
- `POST /api/auth/login` - Вход
- `GET /api/admin/stats` - Статистика
- `GET /api/admin/rooms` - Управление номерами
- `GET /api/admin/bookings` - Управление бронированиями
- `GET /api/admin/reviews` - Управление отзывами

## 🎨 Особенности дизайна

- Цветовая схема: Золотисто-бежевый (#D4AF37) и темно-синий (#1a237e)
- Современный, минималистичный дизайн
- Анимации и плавные переходы
- Адаптивная верстка для всех устройств

## 🌍 Многоязычность

Сайт поддерживает три языка:
- 🇷🇺 Русский (ru)
- 🇹🇯 Таджикский (tg)
- 🇬🇧 Английский (en)

Переключение доступно в навигационном меню.

## 📞 Контакты

**Hotel Vahdat**  
📍 Душанбе, проспект Рудаки, 84  
📞 +992 (37) 227-77-77  
📧 info@hotelvahdat.com  
💬 WhatsApp: +992 93 500-77-77  
✈️ Telegram: @hotelvahdat

## 📄 Лицензия

Copyright © 2025 HOTEL VAHDAT. Все права защищены.

