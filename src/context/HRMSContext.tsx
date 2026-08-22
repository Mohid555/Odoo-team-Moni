import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Employee,
  AttendanceRecord,
  TimeOffRequest,
  TimeOffAllocation,
  SalaryStructure,
  TimeOffType,
} from '../types';
import {
  initialEmployees,
  initialAttendanceRecords,
  initialTimeOffRequests,
  defaultAllocations,
} from '../mockData';
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
  addNewEmployee: (data: Partial<Employee>) => Employee;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  updateEmployeeSalary: (employeeId: string, salary: SalaryStructure) => void;
  
  // Attendance actions
  toggleCheckIn: () => void;
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  
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
  }) => void;
  approveTimeOffRequest: (requestId: string, comment?: string) => void;
  rejectTimeOffRequest: (requestId: string, comment?: string) => void;
  getEmployeeAllocation: (employeeId: string) => TimeOffAllocation;
}

const HRMSContext = createContext<HRMSContextType | undefined>(undefined);

export const HRMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, company } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('hrms_employees_data');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('hrms_attendance_records');
    return saved ? JSON.parse(saved) : initialAttendanceRecords;
  });

  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>(() => {
    const saved = localStorage.getItem('hrms_timeoff_requests');
    return saved ? JSON.parse(saved) : initialTimeOffRequests;
  });

  const [allocations, setAllocations] = useState<Record<string, TimeOffAllocation>>(() => {
    const saved = localStorage.getItem('hrms_allocations');
    return saved ? JSON.parse(saved) : defaultAllocations;
  });

  const [activeNavTab, setActiveNavTab] = useState<'employees' | 'attendance' | 'timeoff' | 'profile'>('employees');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Check In state per user
  const [checkInMap, setCheckInMap] = useState<Record<string, CheckInInfo>>(() => {
    const saved = localStorage.getItem('hrms_checkin_map');
    return saved
      ? JSON.parse(saved)
      : {
          'emp-1': { isCheckedIn: true, checkInTime: '09:15 AM', checkInTimestamp: Date.now() - 3.5 * 3600 * 1000 },
          'emp-2': { isCheckedIn: true, checkInTime: '09:30 AM', checkInTimestamp: Date.now() - 3.25 * 3600 * 1000 },
        };
  });

  useEffect(() => {
    localStorage.setItem('hrms_employees_data', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('hrms_attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('hrms_timeoff_requests', JSON.stringify(timeOffRequests));
  }, [timeOffRequests]);

  useEffect(() => {
    localStorage.setItem('hrms_allocations', JSON.stringify(allocations));
  }, [allocations]);

  useEffect(() => {
    localStorage.setItem('hrms_checkin_map', JSON.stringify(checkInMap));
  }, [checkInMap]);

  const currentUserId = currentUser?.id || '';
  const checkInInfo: CheckInInfo = checkInMap[currentUserId] || {
    isCheckedIn: false,
    checkInTime: null,
    checkInTimestamp: null,
  };

  const getEmployeeById = (id: string) => {
    return employees.find((e) => e.id === id);
  };

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...data } : emp))
    );
  };

  const updateEmployeeSalary = (employeeId: string, salary: SalaryStructure) => {
    const recalculated = calculateSalaryStructure(salary);
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId ? { ...emp, salary: recalculated } : emp
      )
    );
  };

  const addNewEmployee = (data: Partial<Employee>): Employee => {
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

    setEmployees((prev) => [newEmp, ...prev]);

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

    return newEmp;
  };

  const toggleCheckIn = () => {
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

      // Update today's attendance record
      setAttendanceRecords((prev) => {
        const existingIndex = prev.findIndex(
          (r) => r.employeeId === currentUser.id && r.date === todayStr
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            checkOut: timeString,
            workHours: durationHours,
            extraHours: extra,
            status: 'present',
          };
          return updated;
        } else {
          return [
            {
              id: 'att-' + Date.now(),
              employeeId: currentUser.id,
              employeeName: currentUser.fullName,
              employeeAvatar: currentUser.avatarUrl,
              date: todayStr,
              checkIn: checkInInfo.checkInTime || timeString,
              checkOut: timeString,
              workHours: durationHours,
              breakMinutes: 60,
              extraHours: extra,
              status: 'present',
            },
            ...prev,
          ];
        }
      });
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

      // Create or update today's attendance record
      setAttendanceRecords((prev) => {
        const existingIndex = prev.findIndex(
          (r) => r.employeeId === currentUser.id && r.date === todayStr
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            checkIn: timeString,
            checkOut: '-',
            status: 'present',
          };
          return updated;
        } else {
          return [
            {
              id: 'att-' + Date.now(),
              employeeId: currentUser.id,
              employeeName: currentUser.fullName,
              employeeAvatar: currentUser.avatarUrl,
              date: todayStr,
              checkIn: timeString,
              checkOut: '-',
              workHours: 0,
              breakMinutes: 60,
              extraHours: 0,
              status: 'present',
            },
            ...prev,
          ];
        }
      });
    }
  };

  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRec: AttendanceRecord = {
      ...record,
      id: 'att-' + Date.now(),
    };
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

  const createTimeOffRequest = (data: {
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

    setTimeOffRequests((prev) => [newReq, ...prev]);
  };

  const approveTimeOffRequest = (requestId: string, comment?: string) => {
    const req = timeOffRequests.find((r) => r.id === requestId);
    if (!req) return;

    const reviewerName = currentUser?.fullName || 'HR Admin';
    const todayStr = new Date().toISOString().split('T')[0];

    // Update request status
    setTimeOffRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              reviewedBy: reviewerName,
              reviewedDate: todayStr,
              reviewComment: comment || 'Approved by HR.',
            }
          : r
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

  const rejectTimeOffRequest = (requestId: string, comment?: string) => {
    const reviewerName = currentUser?.fullName || 'HR Admin';
    const todayStr = new Date().toISOString().split('T')[0];

    setTimeOffRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              reviewedBy: reviewerName,
              reviewedDate: todayStr,
              reviewComment: comment || 'Request declined by HR.',
            }
          : r
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
