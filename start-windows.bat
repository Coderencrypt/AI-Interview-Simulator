@echo off
title AI Interview Simulator

echo ============================================
echo   AI Interview Simulator - Starting Up
echo ============================================
echo.

REM Start Backend
echo [1/2] Starting Backend (FastAPI)...
start "Backend - FastAPI" cmd /k "cd backend && venv\Scripts\activate && python main.py"

REM Wait a moment for backend to boot
timeout /t 3 /nobreak > nul

REM Start Frontend
echo [2/2] Starting Frontend (React + Vite)...
start "Frontend - React" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo   Both servers are starting!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo   Open Chrome: http://localhost:5173
echo ============================================
echo.
pause
