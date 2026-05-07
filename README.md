# Інформаційна система центру зайнятості

Курсова робота з дисципліни «Організація баз даних і знань».

## Стек технологій

- **СКБД:** PostgreSQL 16
- **Серверна частина:** Node.js 20 + Express 4 + EJS
- **Клієнт PostgreSQL:** pg (node-postgres)
- **Контейнеризація:** Docker + Docker Compose

---

## Запуск через Docker (рекомендовано)

### Вимоги

- [Docker](https://docs.docker.com/get-docker/) 24+
- [Docker Compose](https://docs.docker.com/compose/install/) v2

### Запуск

```bash
docker compose up

```
Відкрийте браузер: **http://localhost:3000**

### Перевірка SQL-запитів

```bash
docker compose exec db psql -U ec_admin -d employment_center -f /docker-entrypoint-initdb.d/../sql/03_queries.sql
```

або з хоста:

```bash
PGPASSWORD=ec_pass psql -h localhost -U ec_admin -d employment_center -f sql/03_queries.sql
```

### Налаштування

Значення за замовчуванням визначені в `docker-compose.yml`. Для перевизначення створіть файл `.env` поряд із `docker-compose.yml`:

```env
POSTGRES_DB=employment_center
POSTGRES_USER=ec_admin
POSTGRES_PASSWORD=ec_pass
POSTGRES_PORT=5432
PORT=3000
```

---

## 🛠 Запуск без Docker (локально)

### Вимоги

- PostgreSQL 16
- Node.js 20+

### 1. Створення бази даних

```bash
sudo -u postgres psql -c "CREATE DATABASE employment_center;"
sudo -u postgres psql -c "CREATE USER ec_admin WITH PASSWORD 'ec_pass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE employment_center TO ec_admin;"
sudo -u postgres psql -c "ALTER DATABASE employment_center OWNER TO ec_admin;"
```

### 2. Створення схеми та наповнення даними

```bash
PGPASSWORD=ec_pass psql -h localhost -U ec_admin -d employment_center -f sql/01_schema.sql
PGPASSWORD=ec_pass psql -h localhost -U ec_admin -d employment_center -f sql/02_data.sql
```

### 3. Перевірка запитів

```bash
PGPASSWORD=ec_pass psql -h localhost -U ec_admin -d employment_center -f sql/03_queries.sql
```

### 4. Запуск веб-додатку

```bash
cd app
cp .env.example .env   # за потреби відредагуйте значення
npm install
npm start
```

Сервер запускається за адресою `http://localhost:3000`.

---

## Перелік таблиць БД

| Таблиця               | Призначення                         | Записів |
|-----------------------|-------------------------------------|---------|
| professions           | Класифікатор професій               | 20      |
| consultants           | Консультанти центру зайнятості      | 15      |
| job_seekers           | Шукачі роботи                       | 20      |
| education             | Освіта шукачів                      | 20      |
| work_experience       | Попередній досвід роботи            | 20      |
| employers             | Роботодавці                         | 16      |
| vacancies             | Вакансії                            | 20      |
| applications          | Заявки на вакансії                  | 22      |
| placements            | Успішні працевлаштування            | 6       |
| trainings             | Навчальні програми                  | 15      |
| training_enrollments  | Записи на навчання                  | 18      |

## Маршрути додатку

- `/` — Головна (статистика)
- `/seekers` — Список шукачів роботи (з пошуком та фільтром)
- `/seekers/new` — Реєстрація нового шукача
- `/seekers/:id` — Детальна картка шукача
- `/match/:seekerId` — **Інтелектуальний підбір вакансій** (модуль автоматизації)
- `/vacancies` — Активні вакансії
- `/vacancies/new` — Додавання нової вакансії
- `/employers` — Реєстр роботодавців
- `/applications` — Обробка заявок (швидка зміна статусу)
- `/trainings` — Навчальні програми
- `/analytics` — **Аналітика та звіти**

## Особливості реалізації

### Нормалізація

Усі відношення приведені до 3-ї нормальної форми:
- 1НФ — атрибути атомарні
- 2НФ — повна функціональна залежність від PK
- 3НФ — відсутність транзитивних залежностей

### Цілісність даних

- Усі зв'язки реалізовані через `FOREIGN KEY`
- Перевірочні обмеження (`CHECK`) на статуси, гендер, числові поля
- Унікальні обмеження (`UNIQUE`) на паспорт, ЄДРПОУ, ІПН
- Каскадне видалення для дочірніх таблиць

### Алгоритм підбору вакансій (smart matching)

```sql
SELECT v.*, e.company_name,
       CASE
         WHEN v.profession_id = $1 THEN 100  -- збіг професії
         WHEN v.salary_max >= $2 THEN 70     -- з/п підходить
         ELSE 40                              -- близько за з/п
       END AS match_score
FROM vacancies v
JOIN employers e ON v.employer_id = e.employer_id
WHERE v.status = 'Активна'
  AND (v.profession_id = $1 OR v.salary_max >= $2 * 0.8)
ORDER BY match_score DESC, v.salary_max DESC;
```

## Доступ

- БД: `postgresql://ec_admin:ec_pass@localhost:5432/employment_center`
- Веб: `http://localhost:3000`
