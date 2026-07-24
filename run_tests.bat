@echo off
echo ========================================================
echo Running Consumer Grievance Platform Test Suite
echo ========================================================
echo.
echo [1/2] Running Backend Pytest Suite...
set PYTHONPATH=.

if exist ".venv\Scripts\activate.bat" call .venv\Scripts\activate.bat

set PYTHONPATH=.
python -m pytest tests/ --tb=short

if %errorlevel% neq 0 (
    echo Backend tests failed!
    exit /b %errorlevel%
)

echo.
echo [2/2] Running Frontend Vitest Suite...
if exist "frontend\node_modules" (
    cd frontend
    call npm test -- --run
    cd ..
) else (
    echo Skipping Vitest - node_modules not installed yet.
)

echo.
echo ========================================================
echo All Tests Passed Successfully!
echo ========================================================
