# Бекенд для интернет-магазина (JS)

[![hexlet-check](https://github.com/isour/test-program-please-ignore-middle-nodejs-project-437/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/isour/test-program-please-ignore-middle-nodejs-project-437/actions)

Реализуйте бекенд интернет-магазина комплектующих: регистрацию и авторизацию, каталог с
фильтрами и пагинацией, промо-блоки главной, оформление заказа и личный кабинет с историей.
Фреймворк выбираете сами, данные храните в PostgreSQL. Фронтенд предоставляет Хекслет —
готовое приложение, которое подключается к вашему API и работает только тогда, когда API
отвечает по описанному контракту.

Учебный проект Хекслета: https://ru.hexlet.io/programs/test-program-please-ignore-middle-nodejs
Как это должно работать: https://files.hexlet.app/a/qf7bsq

## Стек

- JavaScript

## Установка

<!-- Опишите установку: клонирование, зависимости, переменные окружения -->

```bash
git clone https://github.com/isour/test-program-please-ignore-middle-nodejs-project-437.git
cd test-program-please-ignore-middle-nodejs-project-437
```

## Использование

<!-- Добавьте примеры запуска и запись asciinema — именно это смотрит работодатель -->

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.

## Запуск

```bash
npm install
npm start
```

API доступен локально на `http://localhost:8080` и в production на https://test-program-please-ignore-middle-nodejs.onrender.com/. Для PostgreSQL задайте `DATABASE_URL`.

## Production

- URL приложения: https://test-program-please-ignore-middle-nodejs.onrender.com/
- Health check: https://test-program-please-ignore-middle-nodejs.onrender.com/api/health

## Sentry

1. Создайте проект Node.js в [Sentry](https://sentry.io/).
2. Откройте **Settings → Projects → ваш проект → Client Keys (DSN)** и скопируйте DSN.
3. В Render откройте **Web Service → Environment → Environment Variables**.
4. Добавьте переменную:

```text
SENTRY_DSN=https://...@o....ingest.sentry.io/...
```

5. Сохраните изменения и выполните redeploy.

Приложение читает `SENTRY_DSN` из окружения. Если переменная не задана, приложение продолжает работать без отправки событий в Sentry. В production не добавляйте DSN в исходники и не коммитьте его в Git.

Чтобы проверить отправку серверных ошибок, выполните временный скрипт с тем же `SENTRY_DSN` в окружении:

```bash
node --input-type=module -e "import * as Sentry from '@sentry/node'; Sentry.init({ dsn: process.env.SENTRY_DSN }); Sentry.captureException(new Error('Test Sentry error')); await Sentry.flush(2000)"
```

После этого откройте **Issues** в Sentry. Ошибки браузера требуют отдельного подключения `@sentry/react` во фронтенде; серверный `SENTRY_DSN` их автоматически не перехватывает.

Проверка доступности:

```bash
curl https://test-program-please-ignore-middle-nodejs.onrender.com/api/health
```

## CI and deployment

Workflow: [tests](https://github.com/isour/test-program-please-ignore-middle-nodejs-project-437/actions/workflows/test.yml). Configure `DATABASE_URL` and optionally `SENTRY_DSN` in the hosting environment.

## API

The server exposes the documented endpoints under `/api`: health, authentication, categories, promos, products, and orders. Run `make lint`, `make test`, and `make contract` before deployment.

## Render

Create a PostgreSQL instance and a Docker Web Service, set `DATABASE_URL`, `PORT=8080`, and optionally `SENTRY_DSN`. Auto-deploy is enabled by the repository workflow configuration; deployment itself requires access to the Render account.
