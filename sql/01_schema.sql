-- ============================================================
-- ІНФОРМАЦІЙНА СИСТЕМА ЦЕНТРУ ЗАЙНЯТОСТІ
-- Схема бази даних (PostgreSQL)
-- ============================================================

-- Очищення (для повторного запуску)
DROP TABLE IF EXISTS placements          CASCADE;
DROP TABLE IF EXISTS applications        CASCADE;
DROP TABLE IF EXISTS training_enrollments CASCADE;
DROP TABLE IF EXISTS trainings           CASCADE;
DROP TABLE IF EXISTS work_experience     CASCADE;
DROP TABLE IF EXISTS education           CASCADE;
DROP TABLE IF EXISTS vacancies           CASCADE;
DROP TABLE IF EXISTS employers           CASCADE;
DROP TABLE IF EXISTS job_seekers         CASCADE;
DROP TABLE IF EXISTS professions         CASCADE;
DROP TABLE IF EXISTS consultants         CASCADE;

-- ============================================================
-- 1. Довідник професій
-- ============================================================
CREATE TABLE professions (
    profession_id   SERIAL PRIMARY KEY,
    code            VARCHAR(10)  NOT NULL UNIQUE,
    name            VARCHAR(150) NOT NULL,
    category        VARCHAR(80)  NOT NULL,
    description     TEXT
);

COMMENT ON TABLE  professions IS 'Довідник професій (класифікатор)';
COMMENT ON COLUMN professions.code IS 'Код професії згідно класифікатора';

-- ============================================================
-- 2. Консультанти центру зайнятості
-- ============================================================
CREATE TABLE consultants (
    consultant_id   SERIAL PRIMARY KEY,
    last_name       VARCHAR(50)  NOT NULL,
    first_name      VARCHAR(50)  NOT NULL,
    middle_name     VARCHAR(50),
    position        VARCHAR(100) NOT NULL,
    phone           VARCHAR(20)  NOT NULL,
    email           VARCHAR(100) UNIQUE,
    hire_date       DATE         NOT NULL,
    office_room     VARCHAR(10)
);

COMMENT ON TABLE consultants IS 'Працівники (консультанти) центру зайнятості';

-- ============================================================
-- 3. Шукачі роботи (безробітні / претенденти)
-- ============================================================
CREATE TABLE job_seekers (
    seeker_id       SERIAL PRIMARY KEY,
    last_name       VARCHAR(50)  NOT NULL,
    first_name      VARCHAR(50)  NOT NULL,
    middle_name     VARCHAR(50),
    birth_date      DATE         NOT NULL,
    gender          CHAR(1)      NOT NULL CHECK (gender IN ('Ч','Ж')),
    passport_number VARCHAR(15)  NOT NULL UNIQUE,
    tax_id          VARCHAR(10)  UNIQUE,
    phone           VARCHAR(20)  NOT NULL,
    email           VARCHAR(100),
    address         VARCHAR(200) NOT NULL,
    registration_date DATE       NOT NULL DEFAULT CURRENT_DATE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'Шукає'
                    CHECK (status IN ('Шукає','Працевлаштований','На навчанні','Знятий з обліку')),
    desired_salary  NUMERIC(10,2) CHECK (desired_salary >= 0),
    profession_id   INT NOT NULL REFERENCES professions(profession_id),
    consultant_id   INT REFERENCES consultants(consultant_id)
);

COMMENT ON TABLE job_seekers IS 'Шукачі роботи, зареєстровані в центрі зайнятості';

-- ============================================================
-- 4. Освіта шукачів
-- ============================================================
CREATE TABLE education (
    education_id    SERIAL PRIMARY KEY,
    seeker_id       INT NOT NULL REFERENCES job_seekers(seeker_id) ON DELETE CASCADE,
    institution     VARCHAR(200) NOT NULL,
    degree          VARCHAR(50)  NOT NULL
                    CHECK (degree IN ('Середня','Професійно-технічна','Молодший спеціаліст',
                                      'Бакалавр','Магістр','Кандидат наук','Доктор наук')),
    specialty       VARCHAR(150) NOT NULL,
    start_year      INT          NOT NULL CHECK (start_year BETWEEN 1950 AND 2100),
    end_year        INT          CHECK (end_year BETWEEN 1950 AND 2100),
    CHECK (end_year IS NULL OR end_year >= start_year)
);

COMMENT ON TABLE education IS 'Записи про освіту шукачів роботи';

-- ============================================================
-- 5. Досвід роботи
-- ============================================================
CREATE TABLE work_experience (
    experience_id   SERIAL PRIMARY KEY,
    seeker_id       INT NOT NULL REFERENCES job_seekers(seeker_id) ON DELETE CASCADE,
    company_name    VARCHAR(200) NOT NULL,
    position        VARCHAR(150) NOT NULL,
    start_date      DATE         NOT NULL,
    end_date        DATE,
    reason_left     VARCHAR(200),
    CHECK (end_date IS NULL OR end_date >= start_date)
);

COMMENT ON TABLE work_experience IS 'Попередній досвід роботи шукачів';

-- ============================================================
-- 6. Роботодавці
-- ============================================================
CREATE TABLE employers (
    employer_id     SERIAL PRIMARY KEY,
    company_name    VARCHAR(200) NOT NULL,
    legal_form      VARCHAR(20)  NOT NULL
                    CHECK (legal_form IN ('ТОВ','ПП','ФОП','АТ','ДП','КП','ПАТ')),
    edrpou          VARCHAR(10)  NOT NULL UNIQUE,
    industry        VARCHAR(100) NOT NULL,
    address         VARCHAR(200) NOT NULL,
    contact_person  VARCHAR(150) NOT NULL,
    phone           VARCHAR(20)  NOT NULL,
    email           VARCHAR(100),
    employee_count  INT CHECK (employee_count > 0)
);

COMMENT ON TABLE employers IS 'Підприємства-роботодавці';

-- ============================================================
-- 7. Вакансії
-- ============================================================
CREATE TABLE vacancies (
    vacancy_id      SERIAL PRIMARY KEY,
    employer_id     INT NOT NULL REFERENCES employers(employer_id),
    profession_id   INT NOT NULL REFERENCES professions(profession_id),
    title           VARCHAR(150) NOT NULL,
    description     TEXT         NOT NULL,
    salary_min      NUMERIC(10,2) NOT NULL CHECK (salary_min >= 0),
    salary_max      NUMERIC(10,2) NOT NULL CHECK (salary_max >= 0),
    work_schedule   VARCHAR(50)  NOT NULL
                    CHECK (work_schedule IN ('Повний день','Неповний день','Змінний','Гнучкий','Віддалено')),
    experience_required INT      NOT NULL DEFAULT 0 CHECK (experience_required >= 0),
    posted_date     DATE         NOT NULL DEFAULT CURRENT_DATE,
    closing_date    DATE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'Активна'
                    CHECK (status IN ('Активна','Закрита','Призупинена')),
    CHECK (salary_max >= salary_min),
    CHECK (closing_date IS NULL OR closing_date >= posted_date)
);

COMMENT ON TABLE vacancies IS 'Відкриті вакансії від роботодавців';

-- ============================================================
-- 8. Заявки шукачів на вакансії
-- ============================================================
CREATE TABLE applications (
    application_id  SERIAL PRIMARY KEY,
    seeker_id       INT NOT NULL REFERENCES job_seekers(seeker_id),
    vacancy_id      INT NOT NULL REFERENCES vacancies(vacancy_id),
    application_date DATE        NOT NULL DEFAULT CURRENT_DATE,
    status          VARCHAR(30)  NOT NULL DEFAULT 'Подана'
                    CHECK (status IN ('Подана','На розгляді','Відхилена','Запрошено на співбесіду','Прийнята')),
    interview_date  DATE,
    notes           TEXT,
    UNIQUE (seeker_id, vacancy_id)
);

COMMENT ON TABLE applications IS 'Заявки шукачів на конкретні вакансії';

-- ============================================================
-- 9. Працевлаштування (успішні)
-- ============================================================
CREATE TABLE placements (
    placement_id    SERIAL PRIMARY KEY,
    application_id  INT NOT NULL UNIQUE REFERENCES applications(application_id),
    hire_date       DATE         NOT NULL,
    actual_salary   NUMERIC(10,2) NOT NULL CHECK (actual_salary >= 0),
    contract_type   VARCHAR(30)  NOT NULL
                    CHECK (contract_type IN ('Безстроковий','Строковий','Сезонний','Контракт')),
    probation_months INT         CHECK (probation_months BETWEEN 0 AND 6)
);

COMMENT ON TABLE placements IS 'Факти успішного працевлаштування';

-- ============================================================
-- 10. Навчальні програми (перекваліфікація)
-- ============================================================
CREATE TABLE trainings (
    training_id     SERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    profession_id   INT NOT NULL REFERENCES professions(profession_id),
    duration_hours  INT          NOT NULL CHECK (duration_hours > 0),
    start_date      DATE         NOT NULL,
    end_date        DATE         NOT NULL,
    cost            NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    max_students    INT          NOT NULL CHECK (max_students > 0),
    instructor      VARCHAR(150) NOT NULL,
    CHECK (end_date > start_date)
);

COMMENT ON TABLE trainings IS 'Навчальні програми перекваліфікації';

-- ============================================================
-- 11. Записи на навчання
-- ============================================================
CREATE TABLE training_enrollments (
    enrollment_id   SERIAL PRIMARY KEY,
    seeker_id       INT NOT NULL REFERENCES job_seekers(seeker_id),
    training_id     INT NOT NULL REFERENCES trainings(training_id),
    enrollment_date DATE         NOT NULL DEFAULT CURRENT_DATE,
    completion_status VARCHAR(20) NOT NULL DEFAULT 'Зарахований'
                    CHECK (completion_status IN ('Зарахований','Навчається','Завершив','Відрахований')),
    final_grade     INT          CHECK (final_grade BETWEEN 0 AND 100),
    UNIQUE (seeker_id, training_id)
);

COMMENT ON TABLE training_enrollments IS 'Записи шукачів на навчальні програми';

-- ============================================================
-- Індекси для швидкого пошуку
-- ============================================================
CREATE INDEX idx_seekers_status      ON job_seekers(status);
CREATE INDEX idx_seekers_profession  ON job_seekers(profession_id);
CREATE INDEX idx_vacancies_status    ON vacancies(status);
CREATE INDEX idx_vacancies_employer  ON vacancies(employer_id);
CREATE INDEX idx_applications_seeker ON applications(seeker_id);
CREATE INDEX idx_applications_vac    ON applications(vacancy_id);
