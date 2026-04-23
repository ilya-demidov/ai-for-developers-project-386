### Hexlet tests and linter status:
[![Actions Status](https://github.com/ilya-demidov/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/ilya-demidov/ai-for-developers-project-386/actions)

# Mini Cal - Упрощенный календарь бронирования

Приложение для бронирования встреч, похожее на cal.com, но проще. В проекте две роли: владелец календаря и гости. Без регистрации и авторизации.

## Функциональность

### Владелец календаря (админка)
- Создание типов событий (id, название, описание, длительность)
- Просмотр списка предстоящих встреч всех типов

### Гость
- Просмотр списка типов событий
- Выбор даты в календаре (окно 14 дней)
- Выбор временного слота
- Создание бронирования с указанием имени, email и заметок

## Технологический стек

### Backend (API спецификация)
- TypeSpec - описание API контракта
- OpenAPI 3.0 - генерируется из TypeSpec
- Prism - mock сервер для разработки

### Frontend
- React 19 + TypeScript
- Vite - сборка и dev сервер
- Mantine UI - компоненты интерфейса
- React Router - навигация
- TanStack Query - управление серверным состоянием
- Zod - валидация форм

### Инфраструктура
- Docker + Docker Compose
- .NET 8 Minimal API + in-memory storage

## Структура проекта

```
.
├── spec/                      # TypeSpec API спецификация
│   ├── main.tsp              # Описание моделей и эндпоинтов
│   ├── tspconfig.yaml        # Конфигурация компилятора
│   ├── package.json          # Зависимости TypeSpec
│   └── tsp-output/           # Сгенерированные файлы
│       └── openapi.yaml      # OpenAPI спецификация
├── mock/                      # Mock сервер на Prism
│   └── Dockerfile            # Docker образ для Prism
├── backend/                   # .NET 8 Minimal API
│   ├── Program.cs            # Роуты Minimal API
│   ├── Models/               # Модели и DTO
│   ├── Services/             # Бизнес-логика слотов/бронирований
│   ├── Storage/              # In-memory хранилища
│   └── appsettings.json      # Конфигурация host/work hours/window
├── frontend/                  # React приложение
│   ├── src/
│   │   ├── api/              # API клиент и хуки
│   │   ├── components/       # React компоненты
│   │   ├── lib/              # Утилиты и конфигурация
│   │   ├── pages/            # Страницы приложения
│   │   ├── types/            # TypeScript типы
│   │   ├── App.tsx           # Корневой компонент
│   │   ├── main.tsx          # Точка входа
│   │   ├── routes.tsx        # Маршруты
│   │   └── theme.ts          # Тема Mantine
│   ├── .env.example          # Пример переменных окружения
│   ├── Dockerfile            # Docker образ для frontend
│   └── package.json          # Зависимости
└── docker-compose.yml        # Docker Compose конфигурация
```

## Быстрый старт

### Предварительные требования
- Docker и Docker Compose
- Node.js 20+ (для локальной разработки без Docker)

### Запуск в Docker

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd ai-for-developers-project-386
```

2. Запустите проект:
```bash
docker compose up --build
```

3. Откройте приложение:
   - Frontend: http://localhost:5173
   - API: http://localhost:8081

### Запуск с Prism mock

Чтобы фронтенд ходил в Prism mock вместо backend API:

```bash
VITE_API_PROXY_TARGET=http://mock:8080 docker compose --profile mock up --build
```

Откройте:
- Frontend: http://localhost:5173
- Mock API: http://localhost:8080

### Локальная разработка (без Docker)

Основной сценарий (real backend):

1. Запустите backend:
```bash
cd backend
dotnet run
```

2. Запустите frontend dev сервер (в другом терминале):
```bash
cd frontend
npm install
npm run dev
```

3. Откройте http://localhost:5173

Альтернативный сценарий (Prism mock вместо backend):

1. Сгенерируйте OpenAPI из TypeSpec:
```bash
cd spec
npm install
npm run build
```

2. Запустите Prism mock (в отдельном терминале):
```bash
npx @stoplight/prism-cli mock ./tsp-output/openapi.yaml -p 8080
```

3. Запустите frontend с прокси на mock:
```bash
cd ../frontend
npm install
VITE_API_PROXY_TARGET=http://localhost:8080 npm run dev
```

## Доступные скрипты

### Frontend
- `npm run dev` - Запуск dev сервера
- `npm run build` - Сборка production
- `npm run preview` - Просмотр production сборки
- `npm run lint` - Проверка ESLint
- `npm run format` - Форматирование Prettier
- `npm run generate:api` - Генерация TypeScript типов из OpenAPI
- `npm run e2e:real` - e2e-сценарии против реального backend
- `npm run e2e:mock` - smoke e2e-сценарии против Prism mock

### TypeSpec
- `npm run build` (в директории `spec/`) - Компиляция TypeSpec в OpenAPI

## Страницы приложения

- `/` - Главная страница с описанием
- `/event-types` - Выбор типа события для бронирования
- `/book/:id` - Выбор даты и времени
- `/book/:id/confirm` - Форма подтверждения бронирования
- `/book/success` - Экран успешного бронирования
- `/admin/bookings` - Список предстоящих встреч (админка)
- `/admin/event-types` - Управление типами событий (админка)

## Переменные окружения

Создайте файл `frontend/.env` на основе `.env.example`:

```env
# API configuration
VITE_API_BASE_URL=/api

# Host configuration
VITE_HOST_NAME=Tota
VITE_HOST_ROLE=Host
VITE_HOST_TIMEZONE=Europe/Moscow

# Timezone for date/time display and day boundaries on frontend
# local | host | IANA timezone | +3
VITE_DISPLAY_TIMEZONE=local

# Work hours (used for slot grid generation)
VITE_WORK_START_HOUR=9
VITE_WORK_END_HOUR=18

# Booking window in days (keep in sync with backend BookingWindowOptions:Days)
VITE_BOOKING_WINDOW_DAYS=14
```

`VITE_API_PROXY_TARGET` не входит в `.env.example` и обычно задается в окружении запуска
(`VITE_API_PROXY_TARGET=http://... npm run dev`) или через `docker compose`.

## E2E (Playwright)

Тесты находятся в `frontend/e2e` и разделены по двум режимам:
- `real` — полные пользовательские сценарии спецификации (бронирование, конфликт слота, кросс-тип занятость, CRUD типов событий, валидация, окно записи)
- `mock` — smoke-сценарии UI-цепочки для Prism

Запуск:

1. Реальный backend:
```bash
docker compose up --build
cd frontend && npm run e2e:real
```

2. Prism mock:
```bash
VITE_API_PROXY_TARGET=http://mock:8080 docker compose --profile mock up --build
cd frontend && npm run e2e:mock
```

## Лицензия

MIT
