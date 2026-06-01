# 结束占用 8000 端口的旧 Python 进程，再启动本项目的后端
$port = 8000
$pids = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $pids) {
    if ($procId -and $procId -ne 0) {
        Write-Host "Stopping PID $procId on port $port"
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 1
Set-Location $PSScriptRoot
Write-Host "Starting uvicorn from $PWD"
uvicorn app.main:app --reload --host 0.0.0.0 --port $port
