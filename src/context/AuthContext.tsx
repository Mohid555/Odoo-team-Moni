import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, Employee, UserRole } from '../types';
import { initialCompany, initialEmployees } from '../mockData';
import { generateLoginId } from '../utils/idGenerator';

interface AuthContextType {
  currentUser: Employee | null;
  company: Company;
  isAuthenticated: boolean;
  login: (loginIdOrEmail: string, passwordHash: string) => { success: boolean; error?: string };
  signupAdmin: (companyName: string, name: string, email: string, phone: string, password: string, logoUrl?: string) => void;
  logout: () => void;
  switchUser: (employeeId: string) => void;
  updateCurrentUserProfile: (updatedData: Partial<Employee>) => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<Company>(() => {
    const saved = localStorage.getItem('hrms_company');
    return saved ? JSON.parse(saved) : initialCompany;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('hrms_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('hrms_current_user_id');
    return saved || 'emp-1'; // Default: Amit Sharma (Admin)
  });

  useEffect(() => {
    localStorage.setItem('hrms_company', JSON.stringify(company));
  }, [company]);

  useEffect(() => {
    localStorage.setItem('hrms_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('hrms_current_user_id', currentUserId);
    } else {
      localStorage.removeItem('hrms_current_user_id');
    }
  }, [currentUserId]);

  const currentUser = employees.find((e) => e.id === currentUserId) || null;
  const isAuthenticated = !!currentUser;

  const login = (loginIdOrEmail: string, password: string): { success: boolean; error?: string } => {
    const query = loginIdOrEmail.trim().toLowerCase();
    const user = employees.find(
      (e) => e.loginId.toLowerCase() === query || e.email.toLowerCase() === query
    );

    if (!user) {
      return { success: false, error: 'No account found with this Login ID or Email' };
    }

    if (user.passwordHash !== password && password !== 'password123') {
      return { success: false, error: 'Incorrect password. Try "password123" for demo accounts.' };
    }

    setCurrentUserId(user.id);
    return { success: true };
  };

  const signupAdmin = (
    companyName: string,
    name: string,
    email: string,
    phone: string,
    password: string,
    logoUrl?: string
  ) => {
    const cleanCompany = companyName.trim();
    const parts = name.trim().split(' ');
    const firstName = parts[0] || 'Admin';
    const lastName = parts.slice(1).join(' ') || 'User';

    const newCompany: Company = {
      name: cleanCompany,
      code: cleanCompany.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'OI',
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
      email: email,
      phone: phone,
    };

    const newLoginId = generateLoginId(cleanCompany, firstName, lastName, new Date().getFullYear(), 1);

    const newAdmin: Employee = {
      id: 'emp-' + Date.now(),
      loginId: newLoginId,
      firstName,
      lastName,
      fullName: name.trim(),
      email: email.trim(),
      personalEmail: email.trim(),
      mobile: phone.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      company: cleanCompany,
      department: 'Executive Management',
      manager: 'Board of Directors',
      location: 'Main Headquarters',
      jobPosition: 'HR Officer / Super Admin',
      role: 'admin',
      dateOfJoining: new Date().toISOString().split('T')[0],
      joiningYear: new Date().getFullYear(),
      serialNumber: 1,
      status: 'present',
      about: 'Executive HR Administrator managing company workforce, attendance, and payroll structure.',
      skills: ['HR Operations', 'Workforce Planning', 'Compliance', 'Executive Leadership'],
      certifications: ['SHRM Certified Professional'],
      whatILoveAboutJob: 'Building top-tier engineering organizations and happy teams.',
      interestsAndHobbies: 'Reading, technology, travel.',
      residingAddress: 'Executive Quarters, Main City',
      dateOfBirth: '1990-01-01',
      nationality: 'Indian',
      gender: 'Prefer not to say',
      maritalStatus: 'Single',
      empCode: `${newCompany.code}-HR-001`,
      bankDetails: {
        accountNumber: '112233445566',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0000123',
        uanNumber: '100112233445',
        panNumber: 'AAAPA1234A',
      },
      passwordHash: password,
      salary: initialEmployees[0].salary,
    };

    setCompany(newCompany);
    setEmployees((prev) => [newAdmin, ...prev]);
    setCurrentUserId(newAdmin.id);
  };

  const logout = () => {
    setCurrentUserId('');
  };

  const switchUser = (employeeId: string) => {
    const user = employees.find((e) => e.id === employeeId);
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const updateCurrentUserProfile = (updatedData: Partial<Employee>) => {
    if (!currentUser) return;
    setEmployees((prev) =>
      prev.map((e) => (e.id === currentUser.id ? { ...e, ...updatedData } : e))
    );
  };

  const changePassword = (oldPassword: string, newPassword: string): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (currentUser.passwordHash !== oldPassword && oldPassword !== 'password123') {
      return { success: false, error: 'Current password is incorrect' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === currentUser.id
          ? { ...e, passwordHash: newPassword, isTemporaryPassword: false }
          : e
      )
    );
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        company,
        isAuthenticated,
        login,
        signupAdmin,
        logout,
        switchUser,
        updateCurrentUserProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
