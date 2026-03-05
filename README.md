# Notes Service

Сервис заметок с авторизацией, категориями и поиском.

## Технологии
Backend:
- Node.js
- TypeScript
- Moleculer
- TypeORM
- PostgreSQL

Frontend:
- Vue 3
- Vite
- TypeScript

## Запуск вручную
1. Backend:
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
2. Frontend:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
3. Поднимите локальный PostgreSQL (по умолчанию `localhost:5432`) с параметрами из `backend/.env`.

После запуска:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## Запуск через Docker
1. Подготовьте env:
```bash
cp .env.example .env
```
2. Заполните в `.env` минимум:
- `DB_PASSWORD`
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
3. Запустите:
```bash
docker compose up --build
```

После запуска:
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
