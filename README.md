# Real-Time Kanban Board

Это приложение представляет собой Kanban-доску в реальном времени. Оно состоит из фронтенда (React + Vite, Tailwind CSS) и бэкенда (NestJS, WebSockets, Prisma, PostgreSQL).

## 🐳 Запуск через Docker 

Самый простой способ запустить всё приложение (базу данных, бэкенд и раздачу статики фронтенда через Nginx) — использовать `docker-compose`.

1. Убедитесь, что у вас установлен Docker и Docker Compose.
2. Находясь в корне проекта, выполните команду:

```bash
docker compose up -d --build
```

Docker скачает нужные образы, сбилдит TypeScript-код бэкенда, скомпилирует фронтенд в статику (`dist`), сгенерирует клиента Prisma, накатит миграции и запустит 3 контейнера:
- **kanban-db**: PostgreSQL база данных (порт `5433`)
- **kanban-backend**: NestJS сервер с WebSockets (порт `3000`)
- **kanban-frontend**: Nginx раздающий статику React (порт `8080`)

После сообщения об успешном запуске (может занять 1-2 минуты при первой сборке), откройте в браузере:
👉 **http://localhost:8080**

Остановить контейнеры:
```bash
docker compose down
```

---

## 🛠 Запуск локально для разработки (Dev-режим)


### 1. Запуск БД и бэкенда
Убедитесь, что в файле `backend/.env` прописаны корректные доступы к БД (`DATABASE_URL`). Для локальной разработки можно запустить только базу из docker-compose:
```bash
docker-compose up -d postgres
```

Затем запустить сам бэкенд:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

### 2. Запуск фронтенда
Откройте **новую вкладку терминала**.

```bash
cd frontend
npm install
npm run dev
```

После этого фронтенд будет доступен по адресу: http://localhost:5173

---

## 💻 Технологии

- **Frontend:** React, TypeScript, Zustand, Tailwind CSS v4, Lucide React, dnd-kit (drag-and-drop).
- **Backend:** NestJS, TypeScript, WebSockets (Socket.io), Prisma ORM, PostgreSQL.
