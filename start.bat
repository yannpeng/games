@echo off
setlocal
title Cyberpunk Arcade Platform Launcher

echo =======================================================
echo   Cyberpunk Multi-Game Arcade Platform Launcher
echo =======================================================
echo.

REM 1. Check if .venv already exists
if exist .venv\Scripts\python.exe goto run_venv

REM 2. Check if uv is available
where uv >nul 2>&1
if %errorlevel% equ 0 goto run_uv

REM 3. Check if python is available
where python >nul 2>&1
if %errorlevel% equ 0 goto setup_and_run_python

REM 4. Error: Neither Python nor uv found
echo [ERROR] Neither Python 3.9+ nor uv was found on this system.
echo Please install Python from https://www.python.org
echo.
pause
goto end

:run_venv
echo [INFO] Launching game server with virtual environment...
start http://127.0.0.1:8000
.venv\Scripts\python.exe start.py
goto end

:run_uv
echo [INFO] Launching platform with uv...
start http://127.0.0.1:8000
uv run python start.py
goto end

:setup_and_run_python
echo [INFO] No virtual environment found. Automatically initializing...
echo [1/3] Creating virtual environment (.venv)...
python -m venv .venv
if not exist .venv\Scripts\python.exe (
    echo [ERROR] Failed to create virtual environment.
    pause
    goto end
)

echo [2/3] Installing dependencies...
.venv\Scripts\python.exe -m pip install --upgrade pip -q
.venv\Scripts\python.exe -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Package installation failed. Please check network connection.
    pause
    goto end
)

echo [3/3] Environment successfully configured!
echo [INFO] Launching Arcade Game Hub...
start http://127.0.0.1:8000
.venv\Scripts\python.exe start.py
goto end

:end
