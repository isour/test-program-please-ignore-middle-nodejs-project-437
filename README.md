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

API доступен на `http://localhost:8080`. Для PostgreSQL задайте `DATABASE_URL`.

## CI and deployment

Workflow: [tests](https://github.com/isour/test-program-please-ignore-middle-nodejs-project-437/actions/workflows/test.yml). Configure `DATABASE_URL` and optionally `SENTRY_DSN` in the hosting environment.

## API

The server exposes the documented endpoints under `/api`: health, authentication, categories, promos, products, and orders. Run `make lint`, `make test`, and `make contract` before deployment.

## Render

Create a PostgreSQL instance and a Docker Web Service, set `DATABASE_URL`, `PORT=8080`, and optionally `SENTRY_DSN`. Auto-deploy is enabled by the repository workflow configuration; deployment itself requires access to the Render account.
