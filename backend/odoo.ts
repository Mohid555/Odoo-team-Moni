import type { AttendanceRecord, Company, Employee, TimeOffRequest } from '../src/types';

const API_URL = process.env.VITE_API_URL || 'http://localhost:8787/api';

type RequestOptions = RequestInit;

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) throw new Error(body?.error || `Request failed with status ${response.status}`);
  return body as T;
}

export const odoo = {
  bootstrap: () => request('/bootstrap'),
  login: (loginIdOrEmail: string, password: string) => request<{ employee: Employee }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ loginIdOrEmail, password }),
  }),
  createCompany: (company: Company) => request<Company>('/companies', {
    method: 'POST',
    body: JSON.stringify(company),
  }),
  createEmployee: (employee: Partial<Employee>) => request<Employee>('/employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  }),
  updateEmployee: (id: string, employee: Partial<Employee>) => request<Employee>(`/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(employee),
  }),
  createAttendance: (record: Omit<AttendanceRecord, 'id'>) => request<AttendanceRecord>('/attendance', {
    method: 'POST',
    body: JSON.stringify(record),
  }),
  updateAttendance: (id: string, record: Partial<AttendanceRecord>) => request<AttendanceRecord>(`/attendance/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(record),
  }),
  createTimeOff: (requestData: Omit<TimeOffRequest, 'id'>) => request<TimeOffRequest>('/time-off', {
    method: 'POST',
    body: JSON.stringify(requestData),
  }),
  reviewTimeOff: (id: string, status: 'approved' | 'rejected', reviewedBy: string, comment?: string) => request<TimeOffRequest>(`/time-off/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reviewedBy, comment }),
  }),
};

export default odoo;
