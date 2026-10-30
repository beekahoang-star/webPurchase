# WebPurchase - PowerShell Stop Script
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "========================================================" -ForegroundColor Red
Write-Host "       WEBPURCHASE - DỪNG TOÀN BỘ HỆ THỐNG" -ForegroundColor Red
Write-Host "========================================================" -ForegroundColor Red
Write-Host ""

$ports = @(5173, 8080)

foreach ($port in $ports) {
    Write-Host "Đang kiểm tra cổng $port..." -ForegroundColor Yellow
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pidToKill = $conn.OwningProcess
            try {
                $p = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
                if ($p) {
                    Write-Host "Đang dừng tiến trình: $($p.ProcessName) (PID: $pidToKill) trên cổng $port" -ForegroundColor Magenta
                    Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                }
            } catch {
                Write-Host "Không thể dừng PID $pidToKill: $_" -ForegroundColor DarkRed
            }
        }
    } else {
        Write-Host "Cổng $port hiện không có tiến trình nào chạy." -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  ĐÃ DỪNG TOÀN BỘ TIẾN TRÌNH CỦA DỰ ÁN THÀNH CÔNG!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
