import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Employee,
  AttendanceRecord,
  TimeOffRequest,
  TimeOffAllocation,
  SalaryStructure,
  TimeOffType,
} from '../types';
import { api } from '../api';
import { useAuth } from './AuthContext';
import { generateLoginId, generateTemporaryPassword } from '../utils/idGenerator';
import { calculateSalaryStructure, createDefaultSalaryStructure } from '../utils/salaryCalculator';

interface CheckInInfo {
  isCheckedIn: boolean;
  checkInTime: string | null; // e.g. "09:30 AM"
  checkInTimestamp: number | null; // epoch ms
}

interface HRMSContextType {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  timeOffRequests: TimeOffRequest[];
  allocations: Record<string, TimeOffAllocation>;
  checkInInfo: CheckInInfo;
  activeNavTab: 'employees' | 'attendance' | 'timeoff' | 'profile';
  selectedEmployeeId: string | null;
  setActiveNavTab: (tab: 'employees' | 'attendance' | 'timeoff' | 'profile') => void;
  setSelectedEmployeeId: (id: string | null) => void;
  
  // Employee management
  addNewEmployee: (data: Partial<Employee>) => Promise<Employee>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;
  updateEmployeeSalary: (employeeId: string, salary: SalaryStructure) => Promise<void>;
  
  // Attendance actions
  toggleCheckIn: () => Promise<void>;
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  
  // Time Off actions
  createTimeOffRequest: (request: {
    employeeId: string;
    timeOffType: TimeOffType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    attachmentName?: string;
    attachmentDataUrl?: string;
  }) => Promise<void>;
  approveTimeOffRequest: (requestId: string, comment?: string) => Promise<void>;
  rejectTimeOffRequest: (requestId: string, comment?: string) => Promise<void>;
  getEmployeeAllocation: (employeeId: string) => TimeOffAllocation;
}

const HRMSContext = createContext<HRMSContextType | undefined>(undefined);

export const HRMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, company } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);

  const [allocations, setAllocations] = useState<Record<string, TimeOffAllocation>>({});

  const [activeNavTab, setActiveNavTab] = useState<'employees' | 'attendance' | 'timeoff' | 'profile'>('employees');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    api.bootstrap().then((data) => {
      setEmployees(Array.isArray(data.employees) ? data.employees : []);
      setAttendanceRecords(Array.isArray(data.attendanceRecords) ? data.attendanceRecords : []);
      setTimeOffRequests(Array.isArray(data.timeOffRequests) ? data.timeOffRequests : []);
      setAllocations(data.allocations && typeof data.allocations === 'object' ? data.allocations : {});
    }).catch((error) => console.error(error));
  }, []);

  // Check In state per user
  const [checkInMap, setCheckInMap] = useState<Record<string, CheckInInfo>>({});

  const currentUserId = currentUser?.id || '';
  const checkInInfo: CheckInInfo = checkInMap[currentUserId] || {
    isCheckedIn: false,
    checkInTime: null,
    checkInTimestamp: null,
  };

  const getEmployeeById = (id: string) => {
    return employees.find((e) => e.id === id);
  };

  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    const updated = await api.updateEmployee(id, data);
    setEmployees((prev) => prev.map((emp) => (emp.id === id ? updated : emp)));
  };

  const updateEmployeeSalary = async (employeeId: string, salary: SalaryStructure) => {
    const recalculated = calculateSalaryStructure(salary);
    await updateEmployee(employeeId, { salary: recalculated });
  };

  const addNewEmployee = async (data: Partial<Employee>): Promise<Employee> => {
    const firstName = data.firstName?.trim() || 'New';
    const lastName = data.lastName?.trim() || 'Employee';
    const fullName = `${firstName} ${lastName}`;
    const joiningYear = data.joiningYear || new Date().getFullYear();
    const nextSerial = employees.length + 1;

    const loginId = generateLoginId(
      data.company || company.name || 'OI',
      firstName,
      lastName,
      joiningYear,
      nextSerial
    );

    const tempPassword = generateTemporaryPassword(firstName);

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      loginId,
      firstName,
      lastName,
      fullName,
      email: data.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
      personalEmail: data.personalEmail || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
      mobile: data.mobile || '+91 98000 00000',
      avatarUrl: data.avatarUrl || `https://images.unsplash.com/photo-${1534528741775 + nextSerial}?w=200&auto=format&fit=crop&q=80`,
      company: data.company || company.name,
      department: data.department || 'Engineering',
      manager: data.manager || 'Amit Sharma',
      location: data.location || 'Gandhinagar Hub',
      jobPosition: data.jobPosition || 'Software Engineer',
      role: data.role || 'employee',
      dateOfJoining: data.dateOfJoining || new Date().toISOString().split('T')[0],
      joiningYear,
      serialNumber: nextSerial,
      status: 'absent',
      about: data.about || 'Newly onboarded team member at ' + company.name,
      skills: data.skills || ['Communication', 'Problem Solving'],
      certifications: data.certifications || [],
      whatILoveAboutJob: data.whatILoveAboutJob || 'Working with incredible people.',
      interestsAndHobbies: data.interestsAndHobbies || 'Reading, tech.',
      residingAddress: data.residingAddress || 'Ahmedabad, Gujarat, India',
      dateOfBirth: data.dateOfBirth || '1996-01-01',
      nationality: data.nationality || 'Indian',
      gender: data.gender || 'Male',
      maritalStatus: data.maritalStatus || 'Single',
      empCode: `${company.code || 'OI'}-${(data.department || 'ENG').slice(0, 3).toUpperCase()}-${String(nextSerial).padStart(3, '0')}`,
      bankDetails: data.bankDetails || {
        accountNumber: '990011223344',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0001234',
        uanNumber: '100889900112',
        panNumber: 'ABCDE1234F',
      },
      passwordHash: tempPassword,
      isTemporaryPassword: true,
      salary: data.salary || createDefaultSalaryStructure(50000),
    };

    const savedEmployee = await api.createEmployee(newEmp);
    setEmployees((prev) => [savedEmployee, ...prev]);

    // Initialize allocations
    setAllocations((prev) => ({
      ...prev,
      [newEmp.id]: {
        paidTimeOffTotal: 24,
        paidTimeOffUsed: 0,
        sickLeaveTotal: 7,
        sickLeaveUsed: 0,
        unpaidLeaveUsed: 0,
      },
    }));

    return savedEmployee;
  };

  const toggleCheckIn = async () => {
    if (!currentUser) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const todayStr = now.toISOString().split('T')[0];

    if (checkInInfo.isCheckedIn) {
      // CHECK OUT
      const durationHours = checkInInfo.checkInTimestamp
        ? Number(((Date.now() - checkInInfo.checkInTimestamp) / (1000 * 60 * 60)).toFixed(2))
        : 8.0;
      const extra = Math.max(0, Number((durationHours - 8.0).toFixed(2)));

      setCheckInMap((prev) => ({
        ...prev,
        [currentUser.id]: {
          isCheckedIn: false,
          checkInTime: null,
          checkInTimestamp: null,
        },
      }));

      const existing = attendanceRecords.find((r) => r.employeeId === currentUser.id && r.date === todayStr);
      const saved = existing
        ? await api.updateAttendance(existing.id, { ...existing, checkOut: timeString, workHours: durationHours, extraHours: extra, status: 'present' })
        : await api.createAttendance({ employeeId: currentUser.id, employeeName: currentUser.fullName, employeeAvatar: currentUser.avatarUrl, date: todayStr, checkIn: checkInInfo.checkInTime || timeString, checkOut: timeString, workHours: durationHours, breakMinutes: 60, extraHours: extra, status: 'present' });
      setAttendanceRecords((prev) => existing ? prev.map((record) => record.id === saved.id ? saved : record) : [saved, ...prev]);
    } else {
      // CHECK IN
      setCheckInMap((prev) => ({
        ...prev,
        [currentUser.id]: {
          isCheckedIn: true,
          checkInTime: timeString,
          checkInTimestamp: Date.now(),
        },
      }));

      // Update employee status to present
      setEmployees((prev) =>
        prev.map((e) => (e.id === currentUser.id ? { ...e, status: 'present' } : e))
      );

      const existing = attendanceRecords.find((r) => r.employeeId === currentUser.id && r.date === todayStr);
      const saved = existing
        ? await api.updateAttendance(existing.id, { ...existing, checkIn: timeString, checkOut: '-', status: 'present' })
        : await api.createAttendance({ employeeId: currentUser.id, employeeName: currentUser.fullName, employeeAvatar: currentUser.avatarUrl, date: todayStr, checkIn: timeString, checkOut: '-', workHours: 0, breakMinutes: 60, extraHours: 0, status: 'present' });
      setAttendanceRecords((prev) => existing ? prev.map((record) => record.id === saved.id ? saved : record) : [saved, ...prev]);
    }
  };

  const addAttendanceRecord = async (record: Omit<AttendanceRecord, 'id'>) => {
    const newRec = await api.createAttendance(record);
    setAttendanceRecords((prev) => [newRec, ...prev]);
  };

  const getEmployeeAllocation = (employeeId: string): TimeOffAllocation => {
    return (
      allocations[employeeId] || {
        paidTimeOffTotal: 24,
        paidTimeOffUsed: 0,
        sickLeaveTotal: 7,
        sickLeaveUsed: 0,
        unpaidLeaveUsed: 0,
      }
    );
  };

  const createTimeOffRequest = async (data: {
    employeeId: string;
    timeOffType: TimeOffType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    attachmentName?: string;
    attachmentDataUrl?: string;
  }) => {
    const emp = getEmployeeById(data.employeeId);
    if (!emp) return;

    const newReq: TimeOffRequest = {
      id: 'to-' + Date.now(),
      employeeId: emp.id,
      employeeName: emp.fullName,
      employeeAvatar: emp.avatarUrl,
      department: emp.department,
      timeOffType: data.timeOffType,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      reason: data.reason,
      attachmentName: data.attachmentName,
      attachmentDataUrl: data.attachmentDataUrl,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    const saved = await api.createTimeOff(newReq);
    setTimeOffRequests((prev) => [saved, ...prev]);
  };

  const approveTimeOffRequest = async (requestId: string, comment?: string) => {
    const req = timeOffRequests.find((r) => r.id === requestId);
    if (!req) return;

    const reviewerName = currentUser?.fullName || 'HR Admin';
    const todayStr = new Date().toISOString().split('T')[0];

    // Update request status
    const saved = await api.reviewTimeOff(requestId, 'approved', reviewerName, comment);
    setTimeOffRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? saved : r
      )
    );

    // Update allocations
    setAllocations((prev) => {
      const current = prev[req.employeeId] || {
        paidTimeOffTotal: 24,
        paidTimeOffUsed: 0,
        sickLeaveTotal: 7,
        sickLeaveUsed: 0,
        unpaidLeaveUsed: 0,
      };

      let updated = { ...current };
      if (req.timeOffType === 'Paid Time Off') {
        updated.paidTimeOffUsed += req.days;
      } else if (req.timeOffType === 'Sick Leave') {
        updated.sickLeaveUsed += req.days;
      } else {
        updated.unpaidLeaveUsed += req.days;
      }

      return {
        ...prev,
        [req.employeeId]: updated,
      };
    });

    // Check if start <= today <= end, then mark employee on_leave
    if (todayStr >= req.startDate && todayStr <= req.endDate) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === req.employeeId ? { ...e, status: 'on_leave' } : e))
      );
    }
  };

  const rejectTimeOffRequest = async (requestId: string, comment?: string) => {
    const reviewerName = currentUser?.fullName || 'HR Admin';
    const todayStr = new Date().toISOString().split('T')[0];

    const saved = await api.reviewTimeOff(requestId, 'rejected', reviewerName, comment);
    setTimeOffRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? saved : r
      )
    );
  };

  return (
    <HRMSContext.Provider
      value={{
        employees,
        attendanceRecords,
        timeOffRequests,
        allocations,
        checkInInfo,
        activeNavTab,
        selectedEmployeeId,
        setActiveNavTab,
        setSelectedEmployeeId,
        addNewEmployee,
        updateEmployee,
        getEmployeeById,
        updateEmployeeSalary,
        toggleCheckIn,
        addAttendanceRecord,
        createTimeOffRequest,
        approveTimeOffRequest,
        rejectTimeOffRequest,
        getEmployeeAllocation,
      }}
    >
      {children}
    </HRMSContext.Provider>
  );
};

export const useHRMS = () => {
  const context = useContext(HRMSContext);
  if (!context) {
    throw new Error('useHRMS must be used within an HRMSProvider');
  }
  return context;
};
