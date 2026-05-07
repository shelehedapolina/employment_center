\echo '======================================================'
\echo '1. Простий запит на вибірку'
\echo '======================================================'
SELECT seeker_id, last_name, first_name, phone, status
FROM job_seekers
ORDER BY seeker_id
LIMIT 10;

\echo ''
\echo '======================================================'
\echo '2. Запит на вибірку з використанням BETWEEN ... AND'
\echo '======================================================'
SELECT vacancy_id, title, salary_min, salary_max
FROM vacancies
WHERE salary_min BETWEEN 15000 AND 25000
ORDER BY salary_min;

\echo ''
\echo '======================================================'
\echo '3. Запит на вибірку з використанням IN'
\echo '======================================================'
SELECT seeker_id, last_name, first_name, status
FROM job_seekers
WHERE status IN ('Працевлаштований','На навчанні');

\echo ''
\echo '======================================================'
\echo '4. Запит на вибірку з використанням LIKE'
\echo '======================================================'
SELECT employer_id, company_name, industry
FROM employers
WHERE company_name LIKE '%Сервіс%' OR company_name LIKE '%Центр%' OR company_name LIKE '%Авто%';

\echo ''
\echo '======================================================'
\echo '5. Запит на вибірку з двома умовами через AND'
\echo '======================================================'
SELECT vacancy_id, title, salary_min, salary_max, work_schedule
FROM vacancies
WHERE status = 'Активна' AND salary_min >= 18000;

\echo ''
\echo '======================================================'
\echo '6. Запит на вибірку з двома умовами через OR'
\echo '======================================================'
SELECT seeker_id, last_name, first_name, desired_salary, status
FROM job_seekers
WHERE desired_salary > 25000 OR status = 'На навчанні';

\echo ''
\echo '======================================================'
\echo '7. Запит на вибірку з використанням DISTINCT'
\echo '======================================================'
SELECT DISTINCT industry
FROM employers
ORDER BY industry;

\echo ''
\echo '======================================================'
\echo '8. Запит з функцією MIN / MAX'
\echo '======================================================'
SELECT MIN(salary_min) AS min_salary,
       MAX(salary_max) AS max_salary
FROM vacancies
WHERE status = 'Активна';

\echo ''
\echo '======================================================'
\echo '9. Запит з функцією SUM / AVG'
\echo '======================================================'
SELECT ROUND(AVG(desired_salary), 2) AS avg_desired_salary,
       SUM(desired_salary)           AS total_desired
FROM job_seekers
WHERE status = 'Шукає';

\echo ''
\echo '======================================================'
\echo '10. Запит з функцією COUNT'
\echo '======================================================'
SELECT COUNT(*) AS active_vacancies_count
FROM vacancies
WHERE status = 'Активна';

\echo ''
\echo '======================================================'
\echo '11. Агрегатна функція + кілька полів (GROUP BY)'
\echo '======================================================'
SELECT status,
       COUNT(*)                    AS seekers_count,
       ROUND(AVG(desired_salary),0) AS avg_salary
FROM job_seekers
GROUP BY status
ORDER BY seekers_count DESC;

\echo ''
\echo '======================================================'
\echo '12. Агрегатна функція з умовою на вибірку поля (WHERE)'
\echo '======================================================'
SELECT work_schedule,
       COUNT(*)                AS vacancies_count,
       ROUND(AVG(salary_max),0) AS avg_max_salary
FROM vacancies
WHERE status = 'Активна'
GROUP BY work_schedule
ORDER BY vacancies_count DESC;

\echo ''
\echo '======================================================'
\echo '13. Агрегатна функція з умовою на агрегатну функцію (HAVING)'
\echo '======================================================'
SELECT profession_id,
       COUNT(*) AS seekers_per_profession
FROM job_seekers
GROUP BY profession_id
HAVING COUNT(*) > 1
ORDER BY seekers_per_profession DESC;

\echo ''
\echo '======================================================'
\echo '14. Агрегатна функція + HAVING + WHERE + ORDER BY'
\echo '======================================================'
SELECT employer_id,
       COUNT(*)                AS active_count,
       ROUND(AVG(salary_max),0) AS avg_salary
FROM vacancies
WHERE status = 'Активна'
GROUP BY employer_id
HAVING COUNT(*) >= 2
ORDER BY active_count DESC, avg_salary DESC;

\echo ''
\echo '======================================================'
\echo '15. INNER JOIN'
\echo '======================================================'
SELECT v.vacancy_id, v.title, e.company_name, e.industry
FROM vacancies v
INNER JOIN employers e ON v.employer_id = e.employer_id
ORDER BY v.vacancy_id
LIMIT 15;

\echo ''
\echo '======================================================'
\echo '16. LEFT JOIN (всі шукачі та їх заявки, навіть якщо немає)'
\echo '======================================================'
SELECT js.seeker_id,
       js.last_name || ' ' || js.first_name AS full_name,
       a.application_id,
       a.status AS application_status
FROM job_seekers js
LEFT JOIN applications a ON js.seeker_id = a.seeker_id
ORDER BY js.seeker_id
LIMIT 25;

\echo ''
\echo '======================================================'
\echo '17. RIGHT JOIN (всі вакансії і заявки на них)'
\echo '======================================================'
SELECT v.vacancy_id, v.title, a.application_id, a.status
FROM applications a
RIGHT JOIN vacancies v ON a.vacancy_id = v.vacancy_id
ORDER BY v.vacancy_id
LIMIT 25;

\echo ''
\echo '======================================================'
\echo '18. INNER JOIN з умовою'
\echo '======================================================'
SELECT v.title, e.company_name, v.salary_min, v.salary_max
FROM vacancies v
INNER JOIN employers e ON v.employer_id = e.employer_id
WHERE v.status = 'Активна' AND v.salary_min >= 20000
ORDER BY v.salary_min DESC;

\echo ''
\echo '======================================================'
\echo '19. INNER JOIN з умовою LIKE'
\echo '======================================================'
SELECT js.last_name || ' ' || js.first_name AS seeker,
       p.name AS profession
FROM job_seekers js
INNER JOIN professions p ON js.profession_id = p.profession_id
WHERE p.category LIKE 'ІТ%';

\echo ''
\echo '======================================================'
\echo '20. INNER JOIN + агрегатна функція'
\echo '======================================================'
SELECT e.company_name,
       COUNT(v.vacancy_id) AS vacancies_count
FROM employers e
INNER JOIN vacancies v ON e.employer_id = v.employer_id
GROUP BY e.company_name
ORDER BY vacancies_count DESC;

\echo ''
\echo '======================================================'
\echo '21. INNER JOIN + агрегатна функція + HAVING'
\echo '======================================================'
SELECT p.name AS profession,
       COUNT(v.vacancy_id) AS active_vacancies
FROM professions p
INNER JOIN vacancies v ON p.profession_id = v.profession_id
WHERE v.status = 'Активна'
GROUP BY p.name
HAVING COUNT(v.vacancy_id) >= 1
ORDER BY active_vacancies DESC;

\echo ''
\echo '======================================================'
\echo '22. Підзапит з оператором (=, <, >)'
\echo '======================================================'
SELECT vacancy_id, title, salary_max
FROM vacancies
WHERE salary_max > (SELECT AVG(salary_max) FROM vacancies WHERE status='Активна')
  AND status = 'Активна'
ORDER BY salary_max DESC;

\echo ''
\echo '======================================================'
\echo '23. Підзапит з агрегатною функцією'
\echo '======================================================'
SELECT seeker_id, last_name, first_name, desired_salary
FROM job_seekers
WHERE desired_salary = (SELECT MAX(desired_salary) FROM job_seekers);

\echo ''
\echo '======================================================'
\echo '24. Підзапит з оператором EXISTS'
\echo '======================================================'
SELECT js.seeker_id, js.last_name, js.first_name
FROM job_seekers js
WHERE EXISTS (
    SELECT 1 FROM applications a WHERE a.seeker_id = js.seeker_id
)
ORDER BY js.seeker_id;

\echo ''
\echo '======================================================'
\echo '25. Підзапит з ANY / SOME'
\echo '======================================================'
SELECT vacancy_id, title, salary_max
FROM vacancies
WHERE salary_max > ANY (SELECT desired_salary FROM job_seekers WHERE status='Шукає')
  AND status = 'Активна'
ORDER BY salary_max
LIMIT 10;

\echo ''
\echo '======================================================'
\echo '26. Підзапит з IN'
\echo '======================================================'
SELECT seeker_id, last_name, first_name, status
FROM job_seekers
WHERE seeker_id IN (
    SELECT seeker_id FROM training_enrollments
    WHERE completion_status IN ('Навчається','Зарахований')
);

\echo ''
\echo '======================================================'
\echo '27. Підзапит + INNER JOIN'
\echo '======================================================'
SELECT js.last_name || ' ' || js.first_name AS seeker,
       p.name AS profession,
       js.desired_salary
FROM job_seekers js
INNER JOIN professions p ON js.profession_id = p.profession_id
WHERE js.profession_id IN (
    SELECT profession_id FROM vacancies WHERE status='Активна'
)
ORDER BY js.desired_salary DESC
LIMIT 15;
