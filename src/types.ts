export type UserRole = 'admin' | 'employee';

export type EmployeeStatus = 'present' | 'on_leave' | 'absent';

export interface Company {
  name: string;
  code: string; // e.g. 'OI'
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface BankDetails {
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  uanNumber: string;
  panNumber: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  computationType: 'percentage_wage' | 'percentage_basic' | 'fixed_amount';
  value: number; // percentage (e.g. 50) or fixed amount (e.g. 25000)
  amount: number; // calculated monthly amount in INR
  description: string;
  isReadOnly?: boolean;
}

export interface SalaryStructure {
  wageType: 'Fixed Wage';
  monthlyWage: number;
  yearlyWage: number;
  workingDaysPerWeek: number;
  breakTimeMinutes: number;
  employeePfPercentage: number;
  employerPfPercentage: number;
  professionalTax: number;
  components: SalaryComponent[];
}

export interface Employee {
  id: string;
  loginId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  personalEmail: string;
  mobile: string;
  avatarUrl: string;
  company: string;
  department: string;
  manager: string;
  location: string;
  jobPosition: string;
  role: UserRole;
  dateOfJoining: string; // YYYY-MM-DD
  joiningYear: number;
  serialNumber: number;
  status: EmployeeStatus;
  
  // Resume Tab
  about: string;
  skills: string[];
  certifications: string[];
  whatILoveAboutJob: string;
  interestsAndHobbies: string;
  
  // Private Info Tab
  residingAddress: string;
  dateOfBirth: string;
  nationality: string;
  gender: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  empCode: string;
  bankDetails: BankDetails;
  
  // Security
  passwordHash: string;
  isTemporaryPassword?: boolean;
  temporaryPassword?: string;
  
  // Salary Tab (Admin only)
  salary: SalaryStructure;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM AM/PM
  checkOut?: string; // HH:MM AM/PM
  workHours: number; // in hours (e.g. 8.5)
  breakMinutes: number;
  extraHours: number;
  status: 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';
  notes?: string;
}

export type TimeOffType = 'Paid Time Off' | 'Sick Leave' | 'Unpaid Leave';
export type TimeOffStatus = 'pending' | 'approved' | 'rejected';

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  timeOffType: TimeOffType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  reason: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  status: TimeOffStatus;
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewComment?: string;
}

export interface TimeOffAllocation {
  paidTimeOffTotal: number;
  paidTimeOffUsed: number;
  sickLeaveTotal: number;
  sickLeaveUsed: number;
  unpaidLeaveUsed: number;
}
