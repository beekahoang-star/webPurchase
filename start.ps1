# WebPurchase - PowerShell Start Script
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "    WEBPURCHASE - KHỞI ĐỘNG HỆ THỐNG E-COMMERCE" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$frontendDir = Join-Path $PSScriptRoot "frontend"

# 1. Khởi động Backend API Server (Port 8080)
Write-Host "[1/2] Đang khởi động Backend API Server trên cổng 8080..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$frontendDir`" && node mock-server.js" -WindowStyle Normal

Start-Sleep -Seconds 2

# 2. Khởi động Frontend React Vite (Port 5173)
Write-Host "[2/2] Đang khởi động Frontend React Vite trên cổng 5173..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$frontendDir`" && npx vite --host" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  HỆ THỐNG ĐÃ KHỞI ĐỘNG THÀNH CÔNG!" -ForegroundColor Green
Write-Host "  - Cửa Hàng (Storefront) : http://localhost:5173" -ForegroundColor White
Write-Host "  - Đăng Nhập Khách Hàng  : http://localhost:5173/login" -ForegroundColor White
Write-Host "  - Đăng Nhập Quản Trị    : http://localhost:5173/admin/login" -ForegroundColor White
Write-Host "  - Backend API           : http://localhost:8080/api/v1" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

Start-Process "http://localhost:5173"
