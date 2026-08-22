@echo off
setlocal
title Setup Arcade Platform Virtual Environment

echo ==========================================================
echo   Creating Isolated Python Virtual Environment (.venv)
echo ==========================================================
echo.

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found in system PATH.
    echo Please install Python 3.9+ from https://www.python.org
    pause
    goto end
)

if exist .venv\Scripts\python.exe (
    echo [INFO] Existing .venv directory found. Skipping creation.
    goto install_deps
)

echo [1/3] Creating virtual environment in .venv directory...
python -m venv .venv
if not exist .venv\Scripts\python.exe (
    echo [ERROR] Failed to create virtual environment.
    pause
    goto end
)
echo [SUCCESS] Virtual environment created successfully.

:install_deps
echo [2/3] Installing dependencies: FastAPI, Uvicorn, Pydantic, Pytest...
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Package installation failed. Please check network connection.
    pause
    goto end
)

echo [3/3] All packages installed successfully.
echo.
echo ==========================================================
echo   Virtual environment setup is complete!
echo   You can now double-click start.bat to launch the games.
echo ==========================================================
echo.
pause

:end
