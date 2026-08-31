@echo off
chcp 65001 >nul
title 考研题库 - 平板局域网访问服务
setlocal
cd /d "%~dp0"

echo ========================================================
echo          考研题库 - 局域网平板访问服务
echo ========================================================
echo.

:: 获取本机 IPv4 地址
set "IP="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set "IP=%%a"
    goto :found_ip
)

:found_ip
set IP=%IP:~1%

echo [1] 确认您的平板和电脑连接在【同一个局域网 / WiFi】
echo [2] 在平板浏览器输入网址: http://%IP%:8000
echo.
echo --------------------------------------------------------
echo [安全与数据提示]
echo 1. 同一局域网内的其他设备可能访问此端口。
echo 2. 电脑与平板属于不同客户端环境，localStorage 独立保存。
echo    如需跨设备同步进度，请使用侧边栏【导出备份 / 导入备份】功能。
echo --------------------------------------------------------
echo.
echo 服务运行中...（刷题期间请勿关闭此窗口）
echo.

where py >nul 2>&1
if %ERRORLEVEL% equ 0 (
    py -3 -m http.server 8000 --bind 0.0.0.0
) else (
    where python >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        python -m http.server 8000 --bind 0.0.0.0
    ) else (
        echo [错误] 未检测到 Python 环境，请先安装 Python 3！
        pause
    )
)
