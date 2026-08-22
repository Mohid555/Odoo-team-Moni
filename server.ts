import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(projectRoot, 'backend', '.env') });
dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});
const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const query = (text: string, params: unknown[] = []) => pool.query(text, params);
const employeeColumns = `id, login_id AS "loginId", first_name AS "firstName", last_name AS "lastName", full_name AS "fullName", email, personal_email AS "personalEmail", mobile, avatar_url AS "avatarUrl", company, department, manager, location, job_position AS "jobPosition", role, date_of_joining AS "dateOfJoining", joining_year AS "joiningYear", serial_number AS "serialNumber", status, about, skills, certifications, what_i_love_about_job AS "whatILoveAboutJob", interests_and_hobbies AS "interestsAndHobbies", residing_address AS "residingAddress", date_of_birth AS "dateOfBirth", nationality, gender, marital_status AS "maritalStatus", emp_code AS "empCode", bank_details AS "bankDetails", is_temporary_password AS "isTemporaryPassword", salary`;

app.get('/api/bootstrap', async (_req, res) => {
  try {
    const [company, employees, attendance, timeOff, allocations] = await Promise.all([
      query('SELECT name, code, logo_url AS "logoUrl", email, phone, address FROM companies ORDER BY created_at LIMIT 1'),
      query(`SELECT ${employeeColumns} FROM employees ORDER BY serial_number, full_name`),
      query(`SELECT id, employee_id AS "employeeId", employee_name AS "employeeName", employee_avatar AS "employeeAvatar", date, check_in AS "checkIn", check_out AS "checkOut", work_hours AS "workHours", break_minutes AS "breakMinutes", extra_hours AS "extraHours", status, notes FROM attendance_records ORDER BY date DESC`),
      query(`SELECT id, employee_id AS "employeeId", employee_name AS "employeeName", employee_avatar AS "employeeAvatar", department, time_off_type AS "timeOffType", start_date AS "startDate", end_date AS "endDate", days, reason, attachment_name AS "attachmentName", attachment_data_url AS "attachmentDataUrl", status, applied_date AS "appliedDate", reviewed_by AS "reviewedBy", reviewed_date AS "reviewedDate", review_comment AS "reviewComment" FROM time_off_requests ORDER BY applied_date DESC`),
      query('SELECT employee_id AS id, paid_time_off_total AS "paidTimeOffTotal", paid_time_off_used AS "paidTimeOffUsed", sick_leave_total AS "sickLeaveTotal", sick_leave_used AS "sickLeaveUsed", unpaid_leave_used AS "unpaidLeaveUsed" FROM time_off_allocations'),
    ]);
    res.json({ company: company.rows[0] || null, employees: employees.rows, attendanceRecords: attendance.rows, timeOffRequests: timeOff.rows, allocations: Object.fromEntries(allocations.rows.map((row) => [row.id, row])) });
  } catch (error) { res.status(500).json({ error: `Database bootstrap failed: ${error instanceof Error ? error.message : String(error)}` }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { loginIdOrEmail, password } = req.body;
  try {
    const result = await query(`SELECT ${employeeColumns}, password_hash FROM employees WHERE lower(login_id) = lower($1) OR lower(email) = lower($1) LIMIT 1`, [String(loginIdOrEmail || '').trim()]);
    const employee = result.rows[0];
    if (!employee || !(await bcrypt.compare(String(password || ''), employee.password_hash))) return res.status(401).json({ error: 'Invalid Login ID/email or password' });
    delete employee.password_hash;
    res.json({ employee });
  } catch (error) { res.status(500).json({ error: 'Login failed', detail: String(error) }); }
});

app.post('/api/companies', async (req, res) => {
  const company = req.body;
  if (!company?.name?.trim() || !company?.code?.trim()) return res.status(400).json({ error: 'Company name and code are required' });
  try {
    const result = await query('INSERT INTO companies (name, code, logo_url, email, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING name, code, logo_url AS "logoUrl", email, phone, address', [company.name.trim(), company.code.trim(), company.logoUrl || null, company.email?.trim() || null, company.phone?.trim() || null, company.address || null]);
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: `Company creation failed: ${error instanceof Error ? error.message : String(error)}` }); }
});

app.patch('/api/employees/:id', async (req, res) => {
  const allowed = ['jobPosition','department','location','mobile','about','skills','certifications','whatILoveAboutJob','interestsAndHobbies','residingAddress','dateOfBirth','nationality','gender','maritalStatus','bankDetails','salary','status'];
  if (req.body.passwordHash) {
    try {
      const result = await query('UPDATE employees SET password_hash = $1, is_temporary_password = false, updated_at = now() WHERE id = $2 RETURNING ' + employeeColumns, [await bcrypt.hash(req.body.passwordHash, 12), req.params.id]);
      return res.json(result.rows[0]);
    } catch (error) { return res.status(500).json({ error: 'Password update failed', detail: String(error) }); }
  }
  const maps: Record<string, string> = { jobPosition: 'job_position', personalEmail: 'personal_email', avatarUrl: 'avatar_url', whatILoveAboutJob: 'what_i_love_about_job', interestsAndHobbies: 'interests_and_hobbies', residingAddress: 'residing_address', dateOfBirth: 'date_of_birth', maritalStatus: 'marital_status', bankDetails: 'bank_details' };
  const entries = Object.entries(req.body).filter(([key]) => allowed.includes(key));
  if (!entries.length) return res.status(400).json({ error: 'No editable fields supplied' });
  try {
    const values: unknown[] = []; const sets = entries.map(([key, value], index) => { values.push(value); return `${maps[key] || key} = $${index + 1}`; });
    values.push(req.params.id);
    const result = await query(`UPDATE employees SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING ${employeeColumns}`, values);
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Employee update failed', detail: String(error) }); }
});

app.post('/api/employees', async (req, res) => {
  const employee = req.body;
  try {
    const result = await query(`INSERT INTO employees (id, login_id, first_name, last_name, full_name, email, personal_email, mobile, avatar_url, company, department, manager, location, job_position, role, date_of_joining, joining_year, serial_number, status, about, skills, certifications, what_i_love_about_job, interests_and_hobbies, residing_address, date_of_birth, nationality, gender, marital_status, emp_code, bank_details, password_hash, is_temporary_password, salary) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34) RETURNING ${employeeColumns}`, [employee.id, employee.loginId, employee.firstName, employee.lastName, employee.fullName, employee.email, employee.personalEmail, employee.mobile, employee.avatarUrl, employee.company, employee.department, employee.manager, employee.location, employee.jobPosition, employee.role, employee.dateOfJoining, employee.joiningYear, employee.serialNumber, employee.status, employee.about, JSON.stringify(employee.skills || []), JSON.stringify(employee.certifications || []), employee.whatILoveAboutJob, employee.interestsAndHobbies, employee.residingAddress, employee.dateOfBirth, employee.nationality, employee.gender, employee.maritalStatus, employee.empCode, JSON.stringify(employee.bankDetails || {}), await bcrypt.hash(employee.passwordHash, 12), employee.isTemporaryPassword || false, JSON.stringify(employee.salary || {})]);
    await query('INSERT INTO time_off_allocations (employee_id) VALUES ($1) ON CONFLICT DO NOTHING', [employee.id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const status = detail.includes('duplicate key') ? 409 : 500;
    res.status(status).json({ error: `Employee creation failed: ${detail}` });
  }
});

app.post('/api/attendance', async (req, res) => {
  const record = req.body;
  try {
    const result = await query(`INSERT INTO attendance_records (id, employee_id, employee_name, employee_avatar, date, check_in, check_out, work_hours, break_minutes, extra_hours, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id, employee_id AS "employeeId", employee_name AS "employeeName", employee_avatar AS "employeeAvatar", date, check_in AS "checkIn", check_out AS "checkOut", work_hours AS "workHours", break_minutes AS "breakMinutes", extra_hours AS "extraHours", status, notes`, [record.id || `att-${Date.now()}`, record.employeeId, record.employeeName, record.employeeAvatar, record.date, record.checkIn, record.checkOut, record.workHours, record.breakMinutes, record.extraHours, record.status, record.notes]);
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Attendance creation failed', detail: String(error) }); }
});

app.patch('/api/attendance/:id', async (req, res) => {
  const record = req.body;
  try {
    const result = await query(`UPDATE attendance_records SET check_out = COALESCE($1, check_out), work_hours = COALESCE($2, work_hours), extra_hours = COALESCE($3, extra_hours), check_in = COALESCE($4, check_in), status = COALESCE($5, status) WHERE id = $6 RETURNING id, employee_id AS "employeeId", employee_name AS "employeeName", employee_avatar AS "employeeAvatar", date, check_in AS "checkIn", check_out AS "checkOut", work_hours AS "workHours", break_minutes AS "breakMinutes", extra_hours AS "extraHours", status, notes`, [record.checkOut, record.workHours, record.extraHours, record.checkIn, record.status, req.params.id]);
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Attendance update failed', detail: String(error) }); }
});

app.post('/api/time-off', async (req, res) => {
  const record = req.body;
  try {
    const result = await query(`INSERT INTO time_off_requests (id, employee_id, employee_name, employee_avatar, department, time_off_type, start_date, end_date, days, reason, attachment_name, attachment_data_url, status, applied_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending',$13) RETURNING id, employee_id AS "employeeId", employee_name AS "employeeName", employee_avatar AS "employeeAvatar", department, time_off_type AS "timeOffType", start_date AS "startDate", end_date AS "endDate", days, reason, attachment_name AS "attachmentName", attachment_data_url AS "attachmentDataUrl", status, applied_date AS "appliedDate"`, [record.id || `to-${Date.now()}`, record.employeeId, record.employeeName, record.employeeAvatar, record.department, record.timeOffType, record.startDate, record.endDate, record.days, record.reason, record.attachmentName, record.attachmentDataUrl, record.appliedDate]);
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Time-off request failed', detail: String(error) }); }
});

app.patch('/api/time-off/:id/review', async (req, res) => {
  const { status, reviewedBy, comment } = req.body;
  try {
    const result = await query(`UPDATE time_off_requests SET status = $1, reviewed_by = $2, reviewed_date = CURRENT_DATE, review_comment = $3 WHERE id = $4 RETURNING id, employee_id AS "employeeId", employee_name AS "employeeName", employee_avatar AS "employeeAvatar", department, time_off_type AS "timeOffType", start_date AS "startDate", end_date AS "endDate", days, reason, attachment_name AS "attachmentName", attachment_data_url AS "attachmentDataUrl", status, applied_date AS "appliedDate", reviewed_by AS "reviewedBy", reviewed_date AS "reviewedDate", review_comment AS "reviewComment"`, [status, reviewedBy, comment || (status === 'approved' ? 'Approved by HR.' : 'Request declined by HR.'), req.params.id]);
    if (status === 'approved') await query(`UPDATE time_off_allocations SET paid_time_off_used = paid_time_off_used + CASE WHEN $1 = 'Paid Time Off' THEN $2 ELSE 0 END, sick_leave_used = sick_leave_used + CASE WHEN $1 = 'Sick Leave' THEN $2 ELSE 0 END, unpaid_leave_used = unpaid_leave_used + CASE WHEN $1 = 'Unpaid Leave' THEN $2 ELSE 0 END WHERE employee_id = (SELECT employee_id FROM time_off_requests WHERE id = $3)`, [result.rows[0].timeOffType, result.rows[0].days, req.params.id]);
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Time-off review failed', detail: String(error) }); }
});

async function start() {
  const requiredDatabaseVariables = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
  const missingDatabaseVariables = requiredDatabaseVariables.filter((name) => !process.env[name]);
  if (missingDatabaseVariables.length > 0) {
    console.error(`Missing PostgreSQL environment variables: ${missingDatabaseVariables.join(', ')}. Create backend/.env.`);
    process.exit(1);
  }

  try {
    await pool.query('SELECT 1');
    app.listen(port, () => console.log(`HRMS API listening on http://localhost:${port}`));
  } catch (error) {
    console.error(`Could not connect to PostgreSQL. Confirm backend/.env and that the tables already exist: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

void start();
