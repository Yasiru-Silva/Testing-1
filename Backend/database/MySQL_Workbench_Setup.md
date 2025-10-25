# MySQL Workbench Setup Guide for SIT International Study Abroad Portal

## 📋 Prerequisites

1. **MySQL Server** installed and running
2. **MySQL Workbench** installed
3. **Java 17+** installed
4. **Maven** installed

## 🔧 Step 1: Start MySQL Server

### Windows:
```bash
# Start MySQL service
net start mysql
# Or if using XAMPP/WAMP
# Start Apache and MySQL services
```

### macOS:
```bash
# Start MySQL service
brew services start mysql
# Or
sudo /usr/local/mysql/support-files/mysql.server start
```

### Linux:
```bash
# Start MySQL service
sudo systemctl start mysql
# Or
sudo service mysql start
```

## 🔧 Step 2: Connect to MySQL Workbench

1. **Open MySQL Workbench**
2. **Create New Connection:**
   - Click "+" next to "MySQL Connections"
   - Connection Name: `SIT Portal Local`
   - Hostname: `localhost` or `127.0.0.1`
   - Port: `3306`
   - Username: `root`
   - Password: `[your MySQL root password]`
   - Click "Test Connection" to verify
   - Click "OK" to save

## 🔧 Step 3: Create Database

1. **Connect to your MySQL server**
2. **Run the setup script:**
   ```sql
   -- Open the setup_database.sql file
   -- Execute the script to create database and sample data
   ```

3. **Or create manually:**
   ```sql
   CREATE DATABASE sit_portal;
   USE sit_portal;
   ```

## 🔧 Step 4: Configure Application Properties

Update `src/main/resources/application.properties` with your MySQL credentials:

```properties
# Database connection (local MySQL)
spring.datasource.url=jdbc:mysql://localhost:3306/sit_portal?createDatabaseIfNotExist=true&serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=utf8
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

## 🔧 Step 5: Start the Spring Boot Application

1. **Navigate to Backend directory:**
   ```bash
   cd Backend
   ```

2. **Run the application:**
   ```bash
   # Using Maven wrapper
   ./mvnw spring-boot:run
   
   # Or using Maven (if installed)
   mvn spring-boot:run
   ```

3. **Verify database connection:**
   - Check console logs for "HikariPool-1 - Started"
   - Check console logs for "Started EduGlobeApplication"

## 🔧 Step 6: Verify Database Tables

In MySQL Workbench, run:

```sql
USE sit_portal;
SHOW TABLES;
```

You should see these tables:
- `students`
- `admin`
- `universities`
- `programs`
- `applications`
- `contact_messages`
- `payments`
- `notification_logs`

## 🔧 Step 7: Test API Endpoints

### Create a test student:
```bash
curl -X POST http://localhost:8080/api/auth/register/student \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+94 77 123 4567",
    "country": "Sri Lanka",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

## 🔧 Step 8: View Data in MySQL Workbench

1. **Navigate to the `sit_portal` database**
2. **Expand Tables**
3. **Right-click on any table → "Select Rows - Limit 1000"**
4. **View your data**

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Refused:**
   - Ensure MySQL server is running
   - Check if port 3306 is available
   - Verify firewall settings

2. **Access Denied:**
   - Check username/password
   - Ensure user has proper permissions
   - Try connecting with root user first

3. **Database Not Found:**
   - Run the setup script
   - Or manually create database: `CREATE DATABASE sit_portal;`

4. **Tables Not Created:**
   - Check Hibernate logs
   - Ensure `spring.jpa.hibernate.ddl-auto=update`
   - Check for any entity mapping errors

### Useful MySQL Commands:

```sql
-- Show databases
SHOW DATABASES;

-- Use database
USE sit_portal;

-- Show tables
SHOW TABLES;

-- Describe table structure
DESCRIBE students;

-- Show table data
SELECT * FROM students LIMIT 10;

-- Check table creation SQL
SHOW CREATE TABLE students;
```

## 📊 Database Schema Overview

### Key Tables:
- **students**: Student information and authentication
- **admin**: Admin user accounts
- **universities**: Partner universities
- **programs**: Available academic programs
- **applications**: Student applications
- **contact_messages**: Contact form submissions
- **payments**: Payment records
- **notification_logs**: System notifications

### Relationships:
- Applications link Students, Universities, and Programs
- Payments link to Applications
- Notifications link to Students
- Contact Messages can link to Students, Programs, or Admins

## 🎯 Next Steps

1. **Start your Spring Boot application**
2. **Test API endpoints**
3. **Connect your React frontend**
4. **Add sample data through the application**
5. **Monitor database through MySQL Workbench**

Your database is now ready for the SIT International Study Abroad Portal! 🚀
