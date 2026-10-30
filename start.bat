@echo off
chcp 65001 > nul
title WebPurchase - Khoi Dong Du An

echo ========================================================
echo     WEBPURCHASE - KHOI DONG HE THONG E-COMMERCE
echo ========================================================
echo.

:: 1. Khoi dong Backend API Server (Port 8080)
echo [1/2] Dang khoi dong Backend API Server tren cong 8080...
start "WebPurchase Backend API (Port 8080)" cmd /k "cd frontend && node mock-server.js"

:: Cho 2 giay de Backend san sang
timeout /t 2 /nobreak > nul

:: 2. Khoi dong Frontend React Vite (Port 5173)
echo [2/2] Dang khoi dong Frontend React Vite tren cong 5173...
start "WebPurchase Frontend (Port 5173)" cmd /k "cd frontend && npx vite --host"

:: Cho 3 giay de Vite build va listen
timeout /t 3 /nobreak > nul

echo.
echo ========================================================
echo   HE THONG DA KHOI DONG THANH CONG!
echo   - Cua Hang (Storefront) : http://localhost:5173
echo   - Dang Nhap Khach Hang  : http://localhost:5173/login
echo   - Dang Nhap Quan Tri    : http://localhost:5173/admin/login
echo   - Backend API           : http://localhost:8080/api/v1
echo ========================================================
echo.
echo Dang mo trinh duyet...
start http://localhost:5173

pause
