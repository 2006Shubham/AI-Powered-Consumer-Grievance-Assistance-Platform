@echo off
echo ========================================================
echo Setting Up Isolated Python Virtual Environment (.venv)
echo ========================================================
echo.

if not exist ".venv" (
    echo [1/3] Creating Python virtual environment in .venv...
    python -m venv .venv
    if %errorlevel% neq 0 (
        echo Failed to create virtual environment! Make sure Python 3.11+ is installed.
        exit /b %errorlevel%
    )
    echo Virtual environment created successfully.
) else (
    echo [1/3] Existing .venv directory found.
)

echo.
echo [2/3] Upgrading pip in .venv...
call .venv\Scripts\python.exe -m pip install --upgrade pip

echo.
echo [3/3] Installing all project dependencies from backend\requirements.txt...
call .venv\Scripts\python.exe -m pip install -r backend\requirements.txt

echo.
echo ========================================================
echo Virtual Environment Setup Complete!
echo.
echo To activate the virtual environment in terminal:
echo   Windows (CMD):   .venv\Scripts\activate.bat
echo   Windows (PS):    .venv\Scripts\Activate.ps1
echo ========================================================
