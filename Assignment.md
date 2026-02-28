# Assignment

## Инструкция по запуску

### Вариант 1 (рекомендуется): через Docker Compose
1. Подготовить `.env`:
   - Скопировать `.env.example` в `.env`.
   - Указать минимум:
     - `POSTGRES_PASSWORD`
     - `JWT_SECRET`
     - `REFRESH_TOKEN_SECRET`
2. Запустить сервисы:
   ```bash
   docker compose up --build
   ```
3. Открыть в браузере:
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:3000`
   - PostgreSQL: `localhost:5432`

### Вариант 2: локальный запуск без Docker
1. Запустить PostgreSQL локально с параметрами из `backend/.env` (или совместимыми с настройками приложения).
2. Backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Адреса:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

## Краткое описание архитектуры

- **Frontend**: Vue 3 + Vite + TypeScript, состояние на Pinia, формы/валидация через `vee-validate` + `zod`, пользовательские уведомления через toast.
- **Backend**: Moleculer (микросервисный подход) + TypeScript + TypeORM.
- **Сервисы backend**:
  - `api` (gateway, HTTP маршруты)
  - `auth` / `tokens` (JWT access/refresh, refresh-сессии)
  - `users`
  - `notes`
  - `categories`
  - `rate-limiter`
- **Хранение данных**: PostgreSQL.
- **Поиск заметок**: серверный поиск на уровне БД (full-text + `ILIKE`) с индексом GIN.
- **Миграции**: TypeORM migrations для схемы, индексов и seed-данных.
- **Инфраструктура**:
  - Dockerfile для backend и frontend
  - `docker-compose.yml` для запуска полного стенда
  - `k8s/notes-app.yaml` для деплоя в Kubernetes/k3s
  - CI через GitHub Actions (`.github/workflows/ci.yml`)

## Выполненные дополнительные пункты

Все дополнительные пункты из задания выполнены.

- [x] **Аутентификация**: JWT + учет пользователей (access/refresh токены, refresh-сессии)
- [x] **Категории заметок**: группировка заметок по категориям
- [x] **Полнотекстовый поиск**: поиск по содержимому заметок на backend/DB
- [x] **Миграции**: использование миграций TypeORM
- [x] **Обработка ошибок**:
  - Ошибки API обрабатываются без падения UI
  - Есть глобальные обработчики фатальных ошибок на frontend
  - Пользователю показываются уведомления, детали пишутся в консоль
- [x] **Валидация**:
  - Frontend: формы и поля (zod + vee-validate)
  - API: валидация входных данных на backend
- [x] **Moleculer**: разделение backend на сервисы (`notes`, `users`, `auth`, `tokens`, и др.)
- [x] **Docker**: Dockerfile для backend и frontend
- [x] **docker-compose**: один командой поднимаются backend, frontend и PostgreSQL
- [x] **Тесты**: Unit + Integration тесты API (Vitest, включая интеграционные сценарии)
- [x] **Kubernetes / k3s**: манифесты Deployment/Service/ConfigMap/Secret (и Ingress/PVC)
- [x] **CI/CD**: GitHub Actions (lint/test/build + проверка сборки Docker-образов)
