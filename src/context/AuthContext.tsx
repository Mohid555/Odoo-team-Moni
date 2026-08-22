import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, Employee } from '../types';
import { api } from '../api';
import { generateLoginId } from '../utils/idGenerator';
import { createDefaultSalaryStructure } from '../utils/salaryCalculator';

const emptyCompany: Company = { name: '', code: '' };

interface AuthContextType {
  currentUser: Employee | null;
  company: Company;
  isAuthenticated: boolean;
  login: (loginIdOrEmail: string, passwordHash: string) => Promise<{ success: boolean; error?: string }>;
  signupAdmin: (companyName: string, name: string, email: string, phone: string, password: string, logoUrl?: string) => Promise<void>;
  logout: () => void;
  switchUser: (employeeId: string) => void;
  updateCurrentUserProfile: (updatedData: Partial<Employee>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<Company>(emptyCompany);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return '';
  });

  useEffect(() => {
    api.bootstrap().then((data) => {
      setCompany(data.company || emptyCompany);
      setEmployees(Array.isArray(data.employees) ? data.employees : []);
      const savedUserId = sessionStorage.getItem('hrms_current_user_id');
      if (savedUserId && Array.isArray(data.employees) && data.employees.some((employee) => employee.id === savedUserId)) setCurrentUserId(savedUserId);
    }).catch((error) => {
      setBootstrapError(error instanceof Error ? error.message : 'Could not connect to the API');
      console.error(error);
    });
  }, []);

  const currentUser = employees.find((e) => e.id === currentUserId) || null;
  const isAuthenticated = !!currentUser;

  const login = async (loginIdOrEmail: string, password: string) => {
    try {
      const { employee } = await api.login(loginIdOrEmail, password);
      setEmployees((prev) => prev.some((item) => item.id === employee.id) ? prev.map((item) => item.id === employee.id ? employee : item) : [...prev, employee]);
      setCurrentUserId(employee.id);
      sessionStorage.setItem('hrms_current_user_id', employee.id);
      return { success: true };
    } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' }; }
  };

  const signupAdmin = async (
    companyName: string,
    name: string,
    email: string,
    phone: string,
    password: string,
    logoUrl?: string
  ): Promise<void> => {
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
      salary: createDefaultSalaryStructure(50000),
    };

    const savedCompany = await api.createCompany(newCompany);
    const employee = await api.createEmployee(newAdmin);
    setCompany(savedCompany);
    setEmployees((prev) => [employee, ...prev]);
    setCurrentUserId(employee.id);
    sessionStorage.setItem('hrms_current_user_id', employee.id);
  };

  const logout = () => {
    setCurrentUserId('');
    sessionStorage.removeItem('hrms_current_user_id');
  };

  const switchUser = (employeeId: string) => {
    const user = employees.find((e) => e.id === employeeId);
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const updateCurrentUserProfile = async (updatedData: Partial<Employee>) => {
    if (!currentUser) return;
    const updated = await api.updateEmployee(currentUser.id, updatedData);
    setEmployees((prev) => prev.map((e) => (e.id === currentUser.id ? updated : e)));
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    try { await api.updateEmployee(currentUser.id, { passwordHash: newPassword, isTemporaryPassword: false }); return { success: true }; }
    catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed to change password' }; }
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
