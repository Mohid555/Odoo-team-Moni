-- HRMS database schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    employee_avatar TEXT,
    date DATE NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT,
    work_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
    break_minutes INTEGER NOT NULL DEFAULT 0,
    extra_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('present', 'late', 'half_day', 'absent', 'on_leave')),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS time_off_requests (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    employee_avatar TEXT,
    department TEXT,
    time_off_type TEXT NOT NULL CHECK (time_off_type IN ('Paid Time Off', 'Sick Leave', 'Unpaid Leave')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days NUMERIC(8,2) NOT NULL CHECK (days > 0),
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

CREATE TABLE IF NOT EXISTS time_off_allocations (
    employee_id TEXT PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
    paid_time_off_total NUMERIC(8,2) NOT NULL DEFAULT 24,
    paid_time_off_used NUMERIC(8,2) NOT NULL DEFAULT 0,
    sick_leave_total NUMERIC(8,2) NOT NULL DEFAULT 7,
    sick_leave_used NUMERIC(8,2) NOT NULL DEFAULT 0,
    unpaid_leave_used NUMERIC(8,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance_records(employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_time_off_employee_status ON time_off_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_time_off_applied_date ON time_off_requests(applied_date DESC);
