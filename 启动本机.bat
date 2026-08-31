@echo off
chcp 65001 >nul
title 考研题库 - 本机单机服务
setlocal
cd /d "%~dp0"

echo ========================================================
echo          考研题库 - 本机单机学习工作台
echo ========================================================
echo.
echo 访问地址: http://127.0.0.1:8000
echo.
echo 服务启动中...（使用期间请勿关闭此窗口）
echo.

where py >nul 2>&1
if %ERRORLEVEL% equ 0 (
    py -3 -m http.server 8000 --bind 127.0.0.1
) else (
    where python >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        python -m http.server 8000 --bind 127.0.0.1
    ) else (
        echo [错误] 未检测到 Python 环境，请先安装 Python 3！
        pause
    )
)
