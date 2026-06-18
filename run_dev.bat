@echo off
echo ===================================================
echo   Workflow Approval Management System - Quick Start
echo ===================================================
echo.

if "%1"=="setup" (
    echo [1/2] Installing Backend Dependencies...
    cd backend
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
    cd ..

    echo [2/2] Installing Frontend Dependencies...
    cd frontend
    npm install
    cd ..
    
    echo.
    echo Setup complete! Run "run_dev.bat" to start local development servers.
    exit /b
)

echo Starting Backend and Frontend Development Services...
echo.

:: Start FastAPI Backend
start cmd /k "echo Starting Backend... && cd backend && .venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: Start Vite Frontend
start cmd /k "echo Starting Frontend... && cd frontend && npm run dev"

echo.
echo Dev servers spawned successfully!
echo - FastAPI Backend running on http://localhost:8000
echo - Vite Frontend running on http://localhost:5173
echo.
