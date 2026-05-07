@echo off
chcp 65001 > nul
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set PGPASSWORD=ec_pass
set PGCLIENTENCODING=UTF8
%PSQL% -h localhost -U ec_admin -d employment_center -f sql\03_queries.sql
pause
