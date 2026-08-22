# HRMS PostgreSQL Database Design

This design is based on the current frontend, `src/types.ts`, `src/mockData.ts`, `src/context/AuthContext.tsx`, `src/context/HRMSContext.tsx`, and `server.ts`.

## Executive Summary

The current UI needs these five core tables immediately:

1. `companies`
2. `employees`
3. `attendance_records`
4. `time_off_requests`
5. `time_off_allocations`

For a production-ready HRMS, the data should be split into the following recommended tables:

1. `companies`
2. `users` or `employees`
3. `departments`
4. `employee_managers` or a self-reference on `employees`
5. `employee_private_details`
6. `employee_bank_details`
7. `employee_resume`
8. `employee_skills`
9. `skills`
10. `employee_certifications`
11. `salary_structures`
12. `salary_components`
13. `attendance_records`
14. `attendance_events`
15. `time_off_types`
16. `time_off_allocations`
17. `time_off_requests`
18. `time_off_attachments`
19. `audit_logs`
20. `sessions` or an external authentication/session store

Do not create all twenty tables before you need them. The five core tables are enough to connect the current screens. The normalized tables are the better long-term design.

## Evidence From the Current Project

| Frontend capability               | Current source                             | Data required                                                       |
| --------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| Company registration and branding | `SignUp.tsx`, `AuthContext.tsx`            | Company name, code, logo, email, phone, address                     |
| Login by Login ID or email        | `SignIn.tsx`, `server.ts`                  | Login ID, email, password hash, role                                |
| Employee directory                | `EmployeesList.tsx`, `EmployeeCard.tsx`    | Identity, job, department, location, status, avatar                 |
| Employee onboarding               | `NewEmployeeModal.tsx`, `HRMSContext.tsx`  | Employee profile, temporary password, salary, leave allocation      |
| Resume profile                    | `ResumeTab.tsx`                            | About, skills, certifications, interests                            |
| Private information               | `PrivateInfoTab.tsx`                       | Address, birth date, nationality, gender, marital status, bank data |
| Salary information                | `SalaryInfoTab.tsx`, `salaryCalculator.ts` | Wage, payroll settings, salary components                           |
| Check in/out                      | `AttendanceModule.tsx`, `HRMSContext.tsx`  | Attendance day, check-in, check-out, work hours, overtime           |
| Time-off submission               | `NewTimeOffModal.tsx`                      | Type, dates, days, reason, attachment, status                       |
| Time-off approval                 | `TimeOffModule.tsx`, `HRMSContext.tsx`     | Reviewer, decision date, comment, allocation usage                  |
| Profile editing                   | `EmployeeProfile.tsx`, `AuthContext.tsx`   | Editable employee fields and audit history                          |

## Recommended Table Details

### 1. `companies` - required now

Stores each organization/workspace.

- `id UUID PRIMARY KEY`
- `name TEXT NOT NULL`
- `code TEXT NOT NULL UNIQUE`
- `logo_url TEXT`
- `email TEXT`
- `phone TEXT`
- `address TEXT`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Current limitation: the frontend currently loads only the first company. Add a company ID to all company-owned records before supporting multiple companies.

### 2. `employees` - required now

Stores login identity and the directory fields currently used by the UI.

- `id TEXT PRIMARY KEY` or `UUID PRIMARY KEY`
- `company_id UUID REFERENCES companies(id)`
- `login_id TEXT UNIQUE NOT NULL`
- `first_name TEXT NOT NULL`
- `last_name TEXT NOT NULL`
- `full_name TEXT NOT NULL`
- `email TEXT UNIQUE NOT NULL`
- `personal_email TEXT`
- `mobile TEXT`
- `avatar_url TEXT`
- `department_id UUID REFERENCES departments(id)`
- `manager_id TEXT REFERENCES employees(id)`
- `location TEXT`
- `job_position TEXT`
- `role TEXT CHECK (role IN ('admin', 'employee'))`
- `date_of_joining DATE`
- `joining_year INTEGER`
- `serial_number INTEGER`
- `status TEXT CHECK (status IN ('present', 'on_leave', 'absent'))`
- `password_hash TEXT NOT NULL`
- `is_temporary_password BOOLEAN`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Current implementation stores `company`, `department`, and `manager` as text. That is acceptable for the first version, but foreign keys are recommended.

Never store a plain-text password. Never return `password_hash` to the browser.

### 3. `departments` - recommended

The UI filters employees by department and onboarding assigns a department.

- `id UUID PRIMARY KEY`
- `company_id UUID REFERENCES companies(id)`
- `name TEXT NOT NULL`
- `code TEXT`
- `manager_id TEXT REFERENCES employees(id)`
- `created_at TIMESTAMPTZ`

Add a unique constraint on `(company_id, name)`.

### 4. `employee_private_details` - recommended

Separates sensitive personal information from the normal employee directory record.

- `employee_id TEXT PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE`
- `residing_address TEXT`
- `date_of_birth DATE`
- `nationality TEXT`
- `gender TEXT`
- `marital_status TEXT`
- `updated_at TIMESTAMPTZ`

This table should have stricter access rules than the directory table.

### 5. `employee_bank_details` - recommended

Bank and statutory information should not be inside a general employee JSON document.

- `id UUID PRIMARY KEY`
- `employee_id TEXT UNIQUE REFERENCES employees(id) ON DELETE CASCADE`
- `account_number TEXT`
- `bank_name TEXT`
- `ifsc_code TEXT`
- `uan_number TEXT`
- `pan_number TEXT`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Encrypt or tokenize bank and tax identifiers at rest where possible. Mask them in API responses.

### 6. `employee_resume` - recommended

Stores the single-valued resume/profile content.

- `employee_id TEXT PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE`
- `about TEXT`
- `what_i_love_about_job TEXT`
- `interests_and_hobbies TEXT`
- `updated_at TIMESTAMPTZ`

### 7. `skills` - recommended

A reusable skill catalog.

- `id UUID PRIMARY KEY`
- `name TEXT UNIQUE NOT NULL`
- `created_at TIMESTAMPTZ`

### 8. `employee_skills` - recommended

Many-to-many relation between employees and skills.

- `employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE`
- `skill_id UUID REFERENCES skills(id) ON DELETE CASCADE`
- `PRIMARY KEY (employee_id, skill_id)`

The current frontend uses `skills: string[]`. This table removes duplicate spellings and supports skill reporting.

### 9. `employee_certifications` - recommended

The current frontend uses `certifications: string[]`. Use a separate table if certifications must be searched, expired, or verified.

- `id UUID PRIMARY KEY`
- `employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE`
- `name TEXT NOT NULL`
- `issuer TEXT`
- `issued_date DATE`
- `expiry_date DATE`
- `document_url TEXT`
- `verification_status TEXT`
- `created_at TIMESTAMPTZ`

For a simple first version, certifications can remain as JSONB on `employees`.

### 10. `salary_structures` - recommended

The Salary tab and salary calculator currently use one embedded `SalaryStructure` object per employee.

- `id UUID PRIMARY KEY`
- `employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE`
- `wage_type TEXT NOT NULL`
- `monthly_wage NUMERIC(12, 2) NOT NULL`
- `yearly_wage NUMERIC(12, 2) NOT NULL`
- `working_days_per_week NUMERIC(4, 2)`
- `break_time_minutes INTEGER`
- `employee_pf_percentage NUMERIC(5, 2)`
- `employer_pf_percentage NUMERIC(5, 2)`
- `professional_tax NUMERIC(12, 2)`
- `effective_from DATE NOT NULL`
- `effective_to DATE`
- `created_at TIMESTAMPTZ`

Use effective dates so salary history is preserved instead of overwritten.

### 11. `salary_components` - recommended

Stores the component list inside a salary structure.

- `id UUID PRIMARY KEY`
- `salary_structure_id UUID REFERENCES salary_structures(id) ON DELETE CASCADE`
- `name TEXT NOT NULL`
- `computation_type TEXT CHECK (computation_type IN ('percentage_wage', 'percentage_basic', 'fixed_amount'))`
- `value NUMERIC(12, 2) NOT NULL`
- `amount NUMERIC(12, 2) NOT NULL`
- `description TEXT`
- `is_read_only BOOLEAN`

For the first version, the entire salary object may remain in `employees.salary JSONB`, but payroll history requires these tables.

### 12. `attendance_records` - required now

Stores one employee attendance summary per working date.

- `id TEXT PRIMARY KEY`
- `employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE`
- `date DATE NOT NULL`
- `check_in TIMESTAMPTZ`
- `check_out TIMESTAMPTZ`
- `work_hours NUMERIC(8, 2) NOT NULL DEFAULT 0`
- `break_minutes INTEGER NOT NULL DEFAULT 0`
- `extra_hours NUMERIC(8, 2) NOT NULL DEFAULT 0`
- `status TEXT CHECK (status IN ('present', 'late', 'half_day', 'absent', 'on_leave'))`
- `notes TEXT`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Add `UNIQUE (employee_id, date)` so a user cannot accidentally receive two daily records.

Current implementation duplicates `employee_name` and `employee_avatar` into this table. Prefer joining `employees` when possible, or retain them only as historical snapshots.

### 13. `attendance_events` - recommended for reliable check-in/out

The current app stores a check-in map only in browser memory. This table makes the actual punch history durable.

- `id UUID PRIMARY KEY`
- `employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE`
- `event_type TEXT CHECK (event_type IN ('check_in', 'check_out'))`
- `event_time TIMESTAMPTZ NOT NULL`
- `source TEXT`
- `ip_address INET`
- `device_info TEXT`
- `created_at TIMESTAMPTZ`

`attendance_records` can then be a daily calculated summary from these events.

### 14. `time_off_types` - recommended

The current UI hardcodes three values: Paid Time Off, Sick Leave, and Unpaid Leave.

- `id UUID PRIMARY KEY`
- `company_id UUID REFERENCES companies(id)`
- `name TEXT NOT NULL`
- `is_paid BOOLEAN NOT NULL DEFAULT FALSE`
- `requires_attachment BOOLEAN NOT NULL DEFAULT FALSE`
- `annual_limit NUMERIC(8, 2)`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`

This moves leave policy out of frontend code.

### 15. `time_off_allocations` - required now

Stores each employee's available and used leave balance.

- `employee_id TEXT PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE`
- `paid_time_off_total NUMERIC(8, 2) NOT NULL DEFAULT 24`
- `paid_time_off_used NUMERIC(8, 2) NOT NULL DEFAULT 0`
- `sick_leave_total NUMERIC(8, 2) NOT NULL DEFAULT 7`
- `sick_leave_used NUMERIC(8, 2) NOT NULL DEFAULT 0`
- `unpaid_leave_used NUMERIC(8, 2) NOT NULL DEFAULT 0`
- `updated_at TIMESTAMPTZ`

For multiple leave types, replace the fixed columns with one row per employee and leave type:

- `id UUID PRIMARY KEY`
- `employee_id TEXT REFERENCES employees(id)`
- `time_off_type_id UUID REFERENCES time_off_types(id)`
- `period_year INTEGER`
- `allocated_days NUMERIC(8, 2)`
- `used_days NUMERIC(8, 2)`
- `UNIQUE (employee_id, time_off_type_id, period_year)`

### 16. `time_off_requests` - required now

Stores leave applications and approval decisions.

- `id TEXT PRIMARY KEY`
- `employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE`
- `time_off_type_id UUID REFERENCES time_off_types(id)`
- `start_date DATE NOT NULL`
- `end_date DATE NOT NULL`
- `days NUMERIC(8, 2) NOT NULL`
- `reason TEXT NOT NULL`
- `status TEXT CHECK (status IN ('pending', 'approved', 'rejected'))`
- `applied_date DATE NOT NULL`
- `reviewed_by TEXT REFERENCES employees(id)`
- `reviewed_date DATE`
- `review_comment TEXT`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Add `CHECK (end_date >= start_date)` and prevent duplicate approval effects with a transaction or an approval history table.

Current implementation duplicates employee name, avatar, and department. Prefer foreign keys and joins.

### 17. `time_off_attachments` - recommended

The current UI stores an uploaded file as `attachmentDataUrl`, which can become very large. Store files outside PostgreSQL when possible and save metadata here.

- `id UUID PRIMARY KEY`
- `time_off_request_id TEXT REFERENCES time_off_requests(id) ON DELETE CASCADE`
- `file_name TEXT NOT NULL`
- `storage_key TEXT NOT NULL`
- `content_type TEXT`
- `file_size_bytes BIGINT`
- `uploaded_by TEXT REFERENCES employees(id)`
- `created_at TIMESTAMPTZ`

For a simple local version, a `BYTEA` column can be used, but object storage is better for production.

### 18. `audit_logs` - strongly recommended

The current app allows profile edits, password changes, employee creation, attendance changes, and leave approvals. These actions should be traceable.

- `id UUID PRIMARY KEY`
- `company_id UUID REFERENCES companies(id)`
- `actor_employee_id TEXT REFERENCES employees(id)`
- `action TEXT NOT NULL`
- `entity_type TEXT NOT NULL`
- `entity_id TEXT NOT NULL`
- `old_values JSONB`
- `new_values JSONB`
- `ip_address INET`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### 19. `sessions` - required before production authentication

The current frontend uses `sessionStorage` only for the employee ID. That is not authentication. A production app should use an HTTP-only secure cookie and a server-side session or signed access/refresh token.

- `id UUID PRIMARY KEY`
- `employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE`
- `token_hash TEXT UNIQUE NOT NULL`
- `expires_at TIMESTAMPTZ NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `revoked_at TIMESTAMPTZ`

## Recommended Implementation Phases

### Phase 1: Make the current UI work

Create and use:

- `companies`
- `employees`
- `attendance_records`
- `time_off_requests`
- `time_off_allocations`

Keep `skills`, `certifications`, `bank_details`, and `salary` as JSONB temporarily if speed matters.

### Phase 2: Correct the data model

Add:

- `departments`
- `employee_private_details`
- `employee_bank_details`
- `employee_resume`
- `skills`
- `employee_skills`
- `time_off_types`
- `time_off_attachments`

Replace duplicated text values with foreign keys.

### Phase 3: Production HRMS capabilities

Add:

- `salary_structures`
- `salary_components`
- `attendance_events`
- `audit_logs`
- `sessions`
- effective-dated leave allocations
- approval history if multiple reviewers are needed

## Important Current API Gaps

The database design alone does not solve these existing backend limitations:

1. The signup flow creates a company and employee in two separate requests. Use a database transaction so one cannot succeed without the other.
2. The current API has no authentication middleware. Any caller who knows an employee ID can attempt protected updates.
3. The API exposes broad employee data, including private fields, after login. Use separate public/private response DTOs.
4. The current check-in state is not loaded from PostgreSQL after a page refresh. Store check-in events or derive it from today's attendance row.
5. The current time-off approval updates a request and allocation separately. Use a transaction and prevent approving the same request twice.
6. The server currently supports only one company in bootstrap. Add `company_id` filtering for multi-tenant use.
7. `salary`, `bank_details`, skills, and certifications are JSONB in the current implementation. This is acceptable for an MVP, but not ideal for reporting, history, or access control.
8. `attachment_data_url` stores files in a database row and request body. Move attachments to object storage for real documents.
9. The frontend currently calculates login IDs and employee serial numbers. Generate these inside PostgreSQL or the API transaction to avoid collisions.

## Relationship Summary

```text
companies
  |
  +-- departments
  |
  +-- employees ---- employee_private_details
  |       |          employee_bank_details
  |       |          employee_resume
  |       |          employee_skills ---- skills
  |       |          employee_certifications
  |       |          salary_structures ---- salary_components
  |       |          attendance_records
  |       |          attendance_events
  |       |          time_off_allocations ---- time_off_types
  |       |          time_off_requests ---- time_off_attachments
  |       |          sessions
  |       |
  |       +-- manager_id -> employees.id
  |
  +-- audit_logs
```

## Final Recommendation

For the current project, create the five core tables first and load real data. Do not split salary, resume, bank, and skills until the corresponding APIs are implemented. Before calling this production-ready, add foreign keys, transactions, server-side authorization, audit logs, durable attendance events, and secure sessions.
