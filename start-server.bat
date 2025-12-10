@echo off
echo Starting Backend Server...
cd /d "c:\Users\LENOVO\Tugas-Sagab\SistemManajemenTugas-dev_b\server"
echo Current directory: %CD%

echo.
echo Checking if package.json exists...
if exist package.json (
    echo ✅ package.json found
) else (
    echo ❌ package.json not found
    pause
    exit /b 1
)

echo.
echo Installing dependencies if needed...
call npm install

echo.
echo Starting server...
call npm start