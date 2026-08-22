# Odoo HRMS PostgreSQL Setup

This file contains the complete PostgreSQL setup for the HRMS application. Open pgAdmin, select your database, open **Query Tool**, paste the SQL below, and execute it.

The script creates the five tables required by the API:

- `companies`
- `employees`
- `attendance_records`
- `time_off_requests`
- `time_off_allocations`

The script is safe to run more than once because it uses `IF NOT EXISTS`.

## 1. Enable UUID Support

Run this once:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## 2. Create `companies`

```sql
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    logo_url TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 3. Create `employees`

Run this after `companies`:

```sql
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    login_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    personal_email TEXT,
    mobile TEXT,
    avatar_url TEXT,
    company TEXT,
    department TEXT,
    manager TEXT,
    location TEXT,
    job_position TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
    date_of_joining DATE,
    joining_year INTEGER,
    serial_number INTEGER,
    status TEXT NOT NULL DEFAULT 'absent' CHECK (status IN ('present', 'on_leave', 'absent')),
    about TEXT,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    what_i_love_about_job TEXT,
    interests_and_hobbies TEXT,
    residing_address TEXT,
    date_of_birth DATE,
    nationality TEXT,
    gender TEXT,
    marital_status TEXT,
    emp_code TEXT,
    bank_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    password_hash TEXT NOT NULL,
    is_temporary_password BOOLEAN NOT NULL DEFAULT FALSE,
    salary JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 4. Create `attendance_records`

Run this after `employees`:

```sql
CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    employee_avatar TEXT,
    date DATE NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT,
    work_hours NUMERIC(8, 2) NOT NULL DEFAULT 0,
    break_minutes INTEGER NOT NULL DEFAULT 0,
    extra_hours NUMERIC(8, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('present', 'late', 'half_day', 'absent', 'on_leave')),
    notes TEXT
);
```

## 5. Create `time_off_requests`

Run this after `employees`:

```sql
CREATE TABLE IF NOT EXISTS time_off_requests (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    employee_avatar TEXT,
    department TEXT,
    time_off_type TEXT NOT NULL CHECK (time_off_type IN ('Paid Time Off', 'Sick Leave', 'Unpaid Leave')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days NUMERIC(8, 2) NOT NULL CHECK (days > 0),
    reason TEXT NOT NULL,
    attachment_name TEXT,
    attachment_data_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    applied_date DATE NOT NULL,
    reviewed_by TEXT,
    reviewed_date DATE,
    review_comment TEXT,
    CONSTRAINT time_off_dates_valid CHECK (end_date >= start_date)
);
```

## 6. Create `time_off_allocations`

Run this after `employees`:

```sql
CREATE TABLE IF NOT EXISTS time_off_allocations (
    employee_id TEXT PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
    paid_time_off_total NUMERIC(8, 2) NOT NULL DEFAULT 24,
    paid_time_off_used NUMERIC(8, 2) NOT NULL DEFAULT 0,
    sick_leave_total NUMERIC(8, 2) NOT NULL DEFAULT 7,
    sick_leave_used NUMERIC(8, 2) NOT NULL DEFAULT 0,
    unpaid_leave_used NUMERIC(8, 2) NOT NULL DEFAULT 0
);
```

## 7. Create Indexes

Run these after creating the tables:

```sql
CREATE INDEX IF NOT EXISTS idx_employees_department
    ON employees (department);

CREATE INDEX IF NOT EXISTS idx_employees_status
    ON employees (status);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_date
    ON attendance_records (employee_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_date
    ON attendance_records (date DESC);

CREATE INDEX IF NOT EXISTS idx_time_off_employee_status
    ON time_off_requests (employee_id, status);

CREATE INDEX IF NOT EXISTS idx_time_off_applied_date
    ON time_off_requests (applied_date DESC);
```

## 8. Confirm the Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'companies',
      'employees',
      'attendance_records',
      'time_off_requests',
      'time_off_allocations'
  )
ORDER BY table_name;
```

## 9. Check Row Counts

These should initially return zero rows until you import your real data:

```sql
SELECT 'companies' AS table_name, COUNT(*) AS row_count FROM companies
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'attendance_records', COUNT(*) FROM attendance_records
UNION ALL
SELECT 'time_off_requests', COUNT(*) FROM time_off_requests
UNION ALL
SELECT 'time_off_allocations', COUNT(*) FROM time_off_allocations;
```

## 10. Insert a Company

Replace the values with your real company details. Only one company is currently loaded by the application:

```sql
INSERT INTO companies (name, code, email, phone, address)
VALUES (
    'Your Company Name',
    'YC',
    'hr@yourcompany.com',
    '+91 00000 00000',
    'Your company address'
);
```

## 11. Insert an Employee

Passwords must be stored as bcrypt hashes. Do not put a plain-text password in `password_hash`.

The application creates bcrypt hashes automatically when an employee is created through the UI. For manually imported employees, generate a bcrypt hash first and paste it below.

```sql
INSERT INTO employees (
    id,
    login_id,
    first_name,
    last_name,
    full_name,
    email,
    personal_email,
    mobile,
    avatar_url,
    company,
    department,
    manager,
    location,
    job_position,
    role,
    date_of_joining,
    joining_year,
    serial_number,
    status,
    about,
    skills,
    certifications,
    what_i_love_about_job,
    interests_and_hobbies,
    residing_address,
    date_of_birth,
    nationality,
    gender,
    marital_status,
    emp_code,
    bank_details,
    password_hash,
    is_temporary_password,
    salary
)
VALUES (
    'emp-001',
    'YCJO20260001',
    'John',
    'Doe',
    'John Doe',
    'john.doe@yourcompany.com',
    'john.doe.personal@example.com',
    '+91 00000 00000',
    NULL,
    'Your Company Name',
    'Engineering',
    'HR Manager',
    'Head Office',
    'Software Engineer',
    'employee',
    '2026-01-01',
    2026,
    1,
    'absent',
    'Employee profile description',
    '["JavaScript", "React"]'::jsonb,
    '[]'::jsonb,
    'Building useful products',
    'Reading and technology',
    'Employee address',
    '1995-01-01',
    'Indian',
    'Prefer not to say',
    'Single',
    'YC-ENG-001',
    '{}'::jsonb,
    'PASTE_BCRYPT_HASH_HERE',
    TRUE,
    '{}'::jsonb
);
```

Create the employee's leave allocation after inserting the employee:

```sql
INSERT INTO time_off_allocations (employee_id)
VALUES ('emp-001');
```

## 12. Importing Existing Data with pgAdmin

For bulk data:

1. Create the tables using the SQL in section 1.
2. Import `companies` first.
3. Import `employees` second.
4. Import `attendance_records`, `time_off_requests`, and `time_off_allocations` afterward.
5. Ensure every foreign-key value in `employee_id` already exists in `employees.id`.
6. Ensure employee passwords are bcrypt hashes.
7. For JSONB columns, use valid JSON such as `[]`, `{}`, or `["React", "SQL"]`.

## 13. Application Connection Settings

Create a `.env` file in the project root and set the connection string for the database where you created these tables:

```env
DATABASE_URL=postgresql://POSTGRES_USER:POSTGRES_PASSWORD@localhost:5432/YOUR_DATABASE_NAME
PORT=8787
VITE_API_URL=http://localhost:8787/api
```

Then start the API and frontend:

```powershell
npm run dev:full
```

The API reads from PostgreSQL at `http://localhost:8787/api/bootstrap`.
