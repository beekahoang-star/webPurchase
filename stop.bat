@echo off
chcp 65001 > nul
title WebPurchase - Dung Du An

echo ========================================================
echo        WEBPURCHASE - DUNG TOAN BO HE THONG
echo ========================================================
echo.

:: 1. Dung tien trinh tren cong 5173 (Frontend)
echo Dang kiem tra cong 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo Tim thay tien trinh PID %%a tren cong 5173, dang dung...
    taskkill /F /PID %%a >nul 2>&1
)

:: 2. Dung tien trinh tren cong 8080 (Backend)
echo Dang kiem tra cong 8080 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Tim thay tien trinh PID %%a tren cong 8080, dang dung...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ========================================================
echo   DA DUNG TOAN BO CAC TIEN TRINH CUA DU AN!
echo   Cac cong 5173 va 8080 da duoc giai phong.
echo ========================================================
echo.
pause
