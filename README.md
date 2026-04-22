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
- React 18 + TypeScript
- Vite - сборка и dev сервер
- Mantine UI - компоненты интерфейса
- React Router - навигация
- TanStack Query - управление серверным состоянием
- Zod - валидация форм

### Инфраструктура
- Docker + Docker Compose
- SQLite (будет добавлена при разработке .NET backend)

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
   - Prism API: http://localhost:8080

### Локальная разработка (без Docker)

1. Установите зависимости TypeSpec и сгенерируйте OpenAPI:
```bash
cd spec
npm install
npm run build
cd ..
```

2. Установите зависимости frontend и сгенерируйте типы:
```bash
cd frontend
npm install
npm run generate:api
```

3. Запустите Prism mock сервер (в отдельном терминале):
```bash
npx @stoplight/prism-cli mock ../spec/tsp-output/openapi.yaml -p 8080
```

4. Запустите frontend dev сервер:
```bash
npm run dev
```

5. Откройте http://localhost:5173

## Доступные скрипты

### Frontend
- `npm run dev` - Запуск dev сервера
- `npm run build` - Сборка production
- `npm run preview` - Просмотр production сборки
- `npm run lint` - Проверка ESLint
- `npm run format` - Форматирование Prettier
- `npm run generate:api` - Генерация TypeScript типов из OpenAPI

### TypeSpec
- `npm run build` (в директории `spec/`) - Компиляция TypeSpec в OpenAPI

## Страницы приложения

- `/` - Главная страница с описанием
- `/event-types` - Выбор типа события для бронирования
- `/book/:id` - Выбор даты и времени
- `/book/:id/confirm` - Форма подтверждения бронирования
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
```

## Лицензия

MIT
