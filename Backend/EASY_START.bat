@echo off
echo ========================================
echo  Starting SIT International Backend
echo ========================================
echo.
echo Checking if port 8082 is in use...
netstat -ano | findstr :8082
if %ERRORLEVEL% EQU 0 (
    echo WARNING: Port 8082 is already in use!
    echo Please close the existing process first.
    pause
    exit /b 1
)

echo Port 8082 is free. Starting backend...
echo.
echo NOTE: Keep this window open while using the application
echo Press CTRL+C to stop the backend
echo.
.\mvnw.cmd spring-boot:run
pause

