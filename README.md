# Backend для управления задачами (To-Do)

Это приложение предоставляет REST API для управления задачами, позволяя пользователям создавать, обновлять и удалять задачи, а также получать список всех своих задач. Действия с задачами защищены авторизацией по JWT и привязаны к отдельному пользователю.

Приложение было выполнено в качестве тестового задания для [Кампуса](https://campusapp.ru/).

## Технологии

![Tech Stack](https://go-skill-icons.vercel.app/api/icons?i=ts,nest,postgres,prisma,swagger,jest)

## Что было сделано

- [x] Система регистрации и аутентификации пользователей с использованием JWT
- [x] Хэширование паролей с использованием argon2
- [x] CRUD операции для задач c привязкой к пользователю
- [x] Фильтрация задач по статусу (TODO, IN_PROGRESS, DONE) с пагинацией
- [x] Swagger документация для API с примерами запросов/ответов
- [x] Обработка ошибок и валидация входящих данных
- [x] Unit-тесты и E2E-тесты
- [x] Docker-контейнеризация
- [x] Rate limiting

## Установка и запуск

### Способ 1: Docker

1. Убедитесь, что у вас установлен Docker.

2. Склонируйте репозиторий:

```bash
git clone https://github.com/incandesc3nce/campus-test
```

3. Перейдите в директорию проекта:

```bash
cd campus-test
```

4. Создайте файл `.env` и заполните его необходимыми переменными окружения. Пример файла `.env`:

```python
# URL базы данных PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/todo"
# JWT секрет для подписи токенов
JWT_SECRET="your_jwt_secret"
# Секрет для хэширования паролей
HASH_SECRET="your_hash_secret"
```

5. Соберите образ и запустите контейнер приложения:

```bash
docker compose up -d --remove-orphans --build
```

При уже собранном образе можно запустить без пересборки:

```bash
docker compose up -d --remove-orphans
```

6. Примените схему базы данных к удаленной БД:

```bash
docker compose run --rm app npx prisma db push
```

7. Приложение будет доступно по адресу: [http://localhost:3000](http://localhost:3000)

### Способ 2: Локальный запуск

1. Убедитесь, что у вас установлен Node.js 22 или выше и npm.

2. Склонируйте репозиторий:

```bash
git clone https://github.com/incandesc3nce/campus-test
```

3. Перейдите в директорию проекта:

```bash
cd campus-test
```

4. Создайте файл `.env` и заполните его необходимыми переменными окружения. Пример файла `.env`:

```python
# URL базы данных PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/todo"
# JWT секрет для подписи токенов
JWT_SECRET="your_jwt_secret"
# Секрет для хэширования паролей
HASH_SECRET="your_hash_secret"
```

5. Установите зависимости:

```bash
npm install
```

5. Примените схему базы данных к удаленной БД:

```bash
npm run prisma:push
```

6. Сгенерируйте клиент Prisma, если он еще не сгенерирован:

```bash
npm run prisma:generate
```

7. Запустите приложение:

```bash
npm run start
```

8. Приложение будет доступно по адресу: [http://localhost:3000](http://localhost:3000)

## Использование API

> API также имеет Swagger документацию. Для этого запустите приложение и перейдите по адресу [http://localhost:3000/api](http://localhost:3000/api).

### Аутентификация

Для получения JWT токена есть два эндпоинта:

- **POST** `/v1/auth/register` - Регистрация нового пользователя. В теле запроса необходимо передать следующие поля:
  - `email` - email пользователя
  - `name` - имя пользователя
  - `password` - пароль пользователя
  - `confirmPassword` - подтверждение пароля

Эндпоинт может вернуть следующие коды ответа:

- `201 Created` - пользователь успешно зарегистрирован
- `400 Bad Request` - ошибка валидации данных (например, не совпадают пароли или указан неверный email)
- `409 Conflict` - пользователь с таким email уже существует

Пример запроса CURL:

```bash
curl -X 'POST' \
  'http://localhost:3000/v1/auth/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "user@nomail.com",
  "name": "username",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}'
```

- **POST** `/v1/auth/login` - Вход в аккаунт пользователя. В теле запроса необходимо передать следующие поля:
  - `email` - email пользователя
  - `password` - пароль пользователя

Эндпоинт может вернуть следующие коды ответа:

- `200 OK` - пользователь успешно авторизован, в ответе будет возвращен JWT токен
- `400 Bad Request` - ошибка валидации данных (email или пароль не подходят под требования)
- `401 Unauthorized` - неверный email или пароль

Пример запроса CURL:

```bash
curl -X 'POST' \
  'http://localhost:3000/v1/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "user@email.com",
  "password": "Password123"
}'
```

### Задачи

Для работы с задачами необходимо передать JWT токен в заголовке `Authorization` в формате `Bearer <token>`. При отсутствии токена или его недействительности будет возвращаться ошибка **401 Unauthorized**.

- **GET** `/v1/tasks` - Получение списка задач текущего пользователя. Можно использовать параметры запроса для фильтрации и пагинации:
  - `status` - статус задачи (TODO, IN_PROGRESS, DONE)
  - `page` - номер страницы (по умолчанию 1)
  - `limit` - количество задач на странице (по умолчанию 10)

Эндпоинт может вернуть следующие коды ответа:

- `200 OK` - список задач успешно получен
- `400 Bad Request` - ошибка валидации параметров запроса (например, неверный статус задачи)

Пример запроса CURL:

```bash
curl -X 'GET' \
  'http://localhost:3000/v1/tasks?status=IN_PROGRESS&offset=5&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <token>'
```

- **POST** `/v1/tasks` - Создание новой задачи. В теле запроса обязательным полем является только `title`:
  - `title` - заголовок задачи
  - `description` - описание задачи (необязательное поле, по умолчанию null)
  - `status` - статус задачи (TODO, IN_PROGRESS, DONE) (необязательное поле, по умолчанию TODO)

Пример запроса CURL:

```bash
curl -X 'POST' \
  'http://localhost:3000/v1/tasks' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "string",
  "description": "string",
  "status": "TODO"
}'
```

- **GET** `/v1/tasks/{id}` - Получение конкретной задачи по ID. В URL необходимо передать ID задачи.

Эндпоинт может вернуть следующие коды ответа:

- `200 OK` - задача успешно найдена и возвращена
- `404 Not Found` - задача с указанным ID не найдена или не принадлежит текущему пользователю
- `401 Unauthorized` - отсутствует или недействительный токен авторизации

Пример запроса CURL:

```bash
curl -X 'GET' \
  'http://localhost:3000/v1/tasks/123e4567-e89b-12d3-a456-426614174000' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <token>'
```

- **PATCH** `/v1/tasks/{id}` - Обновление существующей задачи. В URL необходимо передать ID задачи. В теле запроса можно передать любые из следующих полей для обновления:
  - `title` - новый заголовок задачи
  - `description` - новое описание задачи
  - `status` - новый статус задачи (TODO, IN_PROGRESS, DONE)

Эндпоинт может вернуть следующие коды ответа:

- `200 OK` - задача успешно обновлена
- `400 Bad Request` - ошибка валидации данных (например, неверный статус задачи)
- `404 Not Found` - задача с указанным ID не найдена или не принадлежит текущему пользователю
- `401 Unauthorized` - отсутствует или недействительный токен авторизации

Пример запроса CURL:

```bash
curl -X 'PATCH' \
  'http://localhost:3000/v1/tasks/123e4567-e89b-12d3-a456-426614174000' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Обновленный заголовок",
  "status": "IN_PROGRESS"
}'
```

- **DELETE** `/v1/tasks/{id}` - Удаление задачи. В URL необходимо передать ID задачи.

Эндпоинт может вернуть следующие коды ответа:

- `204 No Content` - задача успешно удалена
- `404 Not Found` - задача с указанным ID не найдена или не принадлежит текущему пользователю
- `401 Unauthorized` - отсутствует или недействительный токен авторизации

Пример запроса CURL:

```bash
curl -X 'DELETE' \
  'http://localhost:3000/v1/tasks/123e4567-e89b-12d3-a456-426614174000' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <token>'
```

### Проверка состояния сервера

- **GET** `/health` - Проверка состояния сервера. Возвращает статус 200 OK, если сервер работает, и 503 если имееются проблемы.

Пример запроса CURL:

```bash
curl -X 'GET' \
  'http://localhost:3000/health' \
  -H 'accept: application/json'
```

## Лицензия

[LICENSE](LICENSE) 

2025 © [incandesc3nce](https://github.com/incandesc3nce). All Rights Reserved.
