@echo off
echo 🚀 Starting SIT International Study Abroad Portal Backend...
echo.

echo 📊 Checking Java version...
java -version
echo.

echo 📦 Building project with Maven...
call mvnw clean compile
echo.

echo 🚀 Starting Spring Boot Application...
echo ⏳ This may take a few moments...
echo.
call mvnw spring-boot:run

pause
