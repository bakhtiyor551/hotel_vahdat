# 📊 Модуль финансового контроля

Модуль для ведения доходов и расходов, анализа загрузки номеров и получения отчётов.

## 🧩 Возможности

### Доходы
- **Автоматическое добавление** при подтверждении бронирования
- **Ручное добавление** с типами:
  - Номер
  - Ресторан
  - Услуги
  - Прочее
- Фильтрация по дате и типу

### Расходы
- Добавление расходов с типами:
  - Персонал
  - Коммунальные услуги
  - Закупки
  - Прочее
- Фильтрация по дате и категории

### Статистика и отчёты
- 📈 Общий доход за период
- 📉 Общие расходы за период
- 💰 Чистая прибыль (доход - расходы)
- 🏨 Доход от бронирований
- 📊 Диаграммы доходов по типам
- 📊 Диаграммы расходов по категориям
- 📅 История транзакций

## 🏦 База данных

### Таблица `financial_incomes`
```sql
CREATE TABLE financial_incomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Номер', 'Ресторан', 'Услуги', 'Прочее')),
  booking_id INTEGER,
  date DATE NOT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);
```

### Таблица `financial_expenses`
```sql
CREATE TABLE financial_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Персонал', 'Коммунальные услуги', 'Закупки', 'Прочее')),
  date DATE NOT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Эндпоинты

### Доходы
- `GET /admin/finance/incomes` - Получить все доходы
- `POST /admin/finance/incomes` - Добавить доход
- `DELETE /admin/finance/incomes/:id` - Удалить доход

### Расходы
- `GET /admin/finance/expenses` - Получить все расходы
- `POST /admin/finance/expenses` - Добавить расход
- `DELETE /admin/finance/expenses/:id` - Удалить расход

### Статистика
- `GET /admin/finance/stats` - Получить статистику

## 📁 Файлы

### Backend
- `server/scripts/add_finance_tables.js` - Миграция БД
- `server/routes/admin.js` - API роуты (строки 634-855)

### Frontend
- `client/src/components/admin/AdminFinance.jsx` - Компонент
- `client/src/components/admin/AdminFinance.css` - Стили
- `client/src/pages/Admin.jsx` - Роут добавлен
- `client/src/components/admin/AdminLayout.jsx` - Пункт меню добавлен

## 🚀 Использование

1. **Добавление дохода:**
   - Нажмите кнопку "➕ Добавить доход"
   - Заполните форму (сумма, тип, дата, комментарий)
   - Нажмите "💾 Сохранить"

2. **Добавление расхода:**
   - Нажмите кнопку "➖ Добавить расход"
   - Заполните форму (сумма, категория, дата, комментарий)
   - Нажмите "💾 Сохранить"

3. **Фильтрация:**
   - Используйте фильтры по датам (от/до)
   - Таблицы обновятся автоматически

4. **Статистика:**
   - Просматривайте карточки статистики вверху
   - Анализируйте диаграммы доходов и расходов

## 🔧 Установка

Миграция уже выполнена. Таблицы созданы в базе данных `hotel_vahdat.db`.

Если нужно запустить миграцию вручную:
```bash
cd server
node scripts/add_finance_tables.js
```

## 📊 Типы данных

### Типы доходов:
- Номер
- Ресторан
- Услуги
- Прочее

### Типы расходов:
- Персонал
- Коммунальные услуги
- Закупки
- Прочее

### Валюта:
- TJS (таджикские сомони)

## ✅ Функции

- ✅ Добавление доходов и расходов
- ✅ Фильтрация по датам
- ✅ Удаление записей
- ✅ Статистика (общий доход, расходы, прибыль)
- ✅ Диаграммы по типам
- ✅ Просмотр истории транзакций
- ✅ Интеграция с бронированиями
- ✅ Адаптивный дизайн

## 🎨 Интерфейс

Доступен в админ-панели по пути: `/admin/finance`

Пункт меню: **💰 Финансы**

