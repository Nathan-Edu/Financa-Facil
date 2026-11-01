@echo off
title Financa Facil - Inicializador

cd /d "%~dp0"

py --version >nul 2>&1

if errorlevel 1 (
    echo.
    echo [ERRO] Python nao foi encontrado.
    echo Instale o Python ou adicione-o ao PATH.
    echo.
    pause
    exit /b 1
)

py start.py

echo.
pause