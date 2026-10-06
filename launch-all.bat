@echo off
title Medicare HMS Launcher
echo ========================================================
echo    Launching Medicare Hospital Management System (HMS)
echo ========================================================
echo.

set "ROOT=%~dp0"
set "JAVA_HOME=C:\Program Files\Android\Android Studio1\jbr"
set "PATH=%JAVA_HOME%\bin;%ROOT%tools\apache-maven-3.9.6\bin;%PATH%"

echo [1/2] Starting Spring Boot Backend (Port 8080)...
start "Medicare Backend (Spring Boot)" cmd /k "cd /d "%ROOT%backend" && "%ROOT%backend\mvnw.cmd" spring-boot:run"

echo [2/2] Starting Next.js Frontend (Port 3000)...
start "Medicare Frontend (Next.js)" cmd /k "cd /d "%ROOT%" && npm run dev"

echo.
echo ========================================================
echo  System is starting up!
echo  - Frontend Portal:  http://localhost:3000
echo  - REST API Backend: http://localhost:8080/api
echo  - H2 Web Console:   http://localhost:8080/h2-console
echo ========================================================
echo.
timeout /t 5 >nul
start http://localhost:3000
exit
