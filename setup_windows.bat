@echo off
chcp 65001 > nul

set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"

echo Enter password for PostgreSQL user 'postgres':
set /p PGPASSWORD=

echo [1/4] Dropping old DB if exists...
%PSQL% -U postgres -c "DROP DATABASE IF EXISTS employment_center;" 2>nul

echo [2/4] Creating database and user...
%PSQL% -U postgres -c "CREATE DATABASE employment_center ENCODING 'UTF8' TEMPLATE template0;"
%PSQL% -U postgres -c "CREATE USER ec_admin WITH PASSWORD 'ec_pass';" 2>nul
%PSQL% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE employment_center TO ec_admin;"
%PSQL% -U postgres -c "ALTER DATABASE employment_center OWNER TO ec_admin;"

echo [3/4] Creating schema...
set PGPASSWORD=ec_pass
%PSQL% -h localhost -U ec_admin -d employment_center -f sql\01_schema.sql

echo [4/4] Loading data...
%PSQL% -h localhost -U ec_admin -d employment_center -f sql\02_data.sql

echo.
echo Done! Now run start_app.bat
pause
