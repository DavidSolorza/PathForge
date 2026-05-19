@echo off
cd /d "C:\Users\Usuario\Desktop\bases\pathforge-ai"
echo Iniciando PathForge AI...
start "PathForge AI" cmd /c "pnpm dev & pause"
timeout /t 4 /nobreak >nul
start http://localhost:5173
echo Servidor iniciado en http://localhost:5173
echo Cierra esta ventana si quieres, el servidor sigue arriba.
