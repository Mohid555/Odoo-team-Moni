import { AttendanceRecord, Company, Employee, SalaryStructure, TimeOffAllocation, TimeOffRequest } from './types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const body = await response.json().catch(() => null);
  if (!body || typeof body !== 'object') throw new Error('API returned an invalid response. Start the backend with npm run server.');
  if (!response.ok) throw new Error(body.error || 'API request failed');
  return body as T;
}

export interface BootstrapData { company: Company | null; employees: Employee[]; attendanceRecords: AttendanceRecord[]; timeOffRequests: TimeOffRequest[]; allocations: Record<string, TimeOffAllocation>; }
export const api = {
  bootstrap: () => request<BootstrapData>('/bootstrap'),
  createCompany: (company: Company) => request<Company>('/companies', { method: 'POST', body: JSON.stringify(company) }),
  login: (loginIdOrEmail: string, password: string) => request<{ employee: Employee }>('/auth/login', { method: 'POST', body: JSON.stringify({ loginIdOrEmail, password }) }),
  updateEmployee: (id: string, data: Partial<Employee>) => request<Employee>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  createEmployee: (data: Partial<Employee>) => request<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  createAttendance: (data: Omit<AttendanceRecord, 'id'>) => request<AttendanceRecord>('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  updateAttendance: (id: string, data: Partial<AttendanceRecord>) => request<AttendanceRecord>(`/attendance/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  createTimeOff: (data: Omit<TimeOffRequest, 'id'>) => request<TimeOffRequest>('/time-off', { method: 'POST', body: JSON.stringify(data) }),
  reviewTimeOff: (id: string, status: 'approved' | 'rejected', reviewedBy: string, comment?: string) => request<TimeOffRequest>(`/time-off/${id}/review`, { method: 'PATCH', body: JSON.stringify({ status, reviewedBy, comment }) }),
};
