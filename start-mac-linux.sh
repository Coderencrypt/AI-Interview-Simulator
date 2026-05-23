#!/bin/bash

echo "============================================"
echo "  AI Interview Simulator - Starting Up"
echo "============================================"
echo ""

# Start backend in background
echo "[1/2] Starting Backend (FastAPI on :8000)..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to boot
sleep 3

# Start frontend
echo "[2/2] Starting Frontend (React + Vite on :5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo "  Both servers running!"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  Open Chrome: http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo "============================================"

# Trap Ctrl+C and kill both
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'; exit 0" INT
wait
