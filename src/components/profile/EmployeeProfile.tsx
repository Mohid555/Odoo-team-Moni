import React, { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  MapPin,
  Briefcase,
  UserCheck,
  Plane,
  AlertCircle,
  ShieldCheck,
  Edit3,
  Check,
  FileText,
  Lock,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { ResumeTab } from './ResumeTab';
import { PrivateInfoTab } from './PrivateInfoTab';
import { SalaryInfoTab } from './SalaryInfoTab';
import { SalaryStructure } from '../../types';

export const EmployeeProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    setActiveNavTab,
    updateEmployee,
    updateEmployeeSalary,
  } = useHRMS();

  const [activeTab, setActiveTab] = useState<'resume' | 'private' | 'salary'>('resume');
  const [isEditingHeader, setIsEditingHeader] = useState(false);

  // Active target employee
  const targetEmployee =
    employees.find((e) => e.id === selectedEmployeeId) ||
    employees.find((e) => e.id === currentUser?.id) ||
    employees[0];

  const isOwner = currentUser?.id === targetEmployee?.id;
  const isAdmin = currentUser?.role === 'admin';
  const canEdit = isOwner || isAdmin;

  // Header temporary edit states
  const [jobPosition, setJobPosition] = useState(targetEmployee?.jobPosition || '');
  const [department, setDepartment] = useState(targetEmployee?.department || '');
  const [location, setLocation] = useState(targetEmployee?.location || '');
  const [mobile, setMobile] = useState(targetEmployee?.mobile || '');

  if (!targetEmployee) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-slate-500">Employee profile not found.</p>
        <button
          onClick={() => {
            setSelectedEmployeeId(null);
            setActiveNavTab('employees');
          }}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Return to Employees
        </button>
      </div>
    );
  }

  const handleSaveHeader = () => {
    updateEmployee(targetEmployee.id, {
      jobPosition,
      department,
      location,
      mobile,
    });
    setIsEditingHeader(false);
  };

  const handleUpdateResume = (data: any) => {
    updateEmployee(targetEmployee.id, data);
  };

  const handleUpdatePrivate = (data: any) => {
    updateEmployee(targetEmployee.id, data);
  };

  const handleUpdateSalary = (newSalary: SalaryStructure) => {
    updateEmployeeSalary(targetEmployee.id, newSalary);
  };

  const getStatusBadge = () => {
    switch (targetEmployee.status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eaf0ea] border border-[#c8dac8] text-[#345c34] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#488248] animate-pulse" />
            Present in Office
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f4ebe6] border border-[#e4d4cc] text-[#8c4b2a] text-xs font-bold">
            <Plane className="w-3.5 h-3.5 text-[#a3684c] -rotate-45" />
            On Approved Leave
          </span>
        );
      case 'absent':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f8f3e8] border border-[#e8ddc4] text-[#8a6824] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#c99b50]" />
            Absent
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <button
          id="profile-back-to-directory-btn"
          onClick={() => {
            setSelectedEmployeeId(null);
            setActiveNavTab('employees');
          }}
          className="flex items-center gap-2 text-xs font-bold text-[#3d463d] hover:text-[#2c332c] bg-white hover:bg-[#f8f7f4] border border-[#dedad2] px-3.5 py-2 rounded-xl transition cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employees</span>
        </button>

        <div className="flex items-center gap-2">
          {!canEdit && (
            <span className="text-xs font-medium text-[#7d857d] bg-[#edebe6] px-3 py-1.5 rounded-xl">
              View-Only Mode
            </span>
          )}
          {canEdit && !isEditingHeader && (
            <button
              onClick={() => setIsEditingHeader(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#edebe6] hover:bg-[#dedad2] text-[#3d463d] rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Header</span>
            </button>
          )}
          {isEditingHeader && (
            <button
              onClick={handleSaveHeader}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#384538] hover:bg-[#2d382d] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Header</span>
            </button>
          )}
        </div>
      </div>

      {isAdmin && targetEmployee.temporaryPassword && (
        <div className="bg-[#f8f3e8] border border-[#e8ddc4] rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#6e531e]">Employee login password</p>
            <p className="font-mono text-sm font-bold text-[#2c332c] mt-1">{targetEmployee.temporaryPassword}</p>
          </div>
          {targetEmployee.temporaryPassword && (
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(targetEmployee.temporaryPassword || '')}
              className="px-3 py-1.5 bg-white border border-[#e8ddc4] rounded-xl text-xs font-semibold text-[#6e531e]"
            >
              Copy Password
            </button>
          )}
        </div>
      )}

      {/* Main Employee Header Block */}
      <div className="bg-white rounded-2xl border border-[#e8e6e1] shadow-xs p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={targetEmployee.avatarUrl}
              alt={targetEmployee.fullName}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-[#f5f4ef] shadow-md"
            />
            {targetEmployee.role === 'admin' && (
              <span
                className="absolute -bottom-2 -right-2 bg-[#4a594a] text-white p-1.5 rounded-xl ring-4 ring-white shadow-xs"
                title="HR Administrator"
              >
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Core Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-[#2c332c] tracking-tight">
                {targetEmployee.fullName}
              </h1>
              <span className="font-mono font-bold text-xs bg-[#eaf0ea] text-[#2d4d2d] border border-[#c8dac8] px-2.5 py-1 rounded-lg">
                {targetEmployee.loginId}
              </span>
              {getStatusBadge()}
            </div>

            {/* Position & Department */}
            {isEditingHeader ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <input
                  type="text"
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  placeholder="Job Position"
                  className="px-3 py-1.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Department"
                  className="px-3 py-1.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="px-3 py-1.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-lg text-xs"
                />
              </div>
            ) : (
              <p className="text-sm font-semibold text-[#5c665c]">
                {targetEmployee.jobPosition} •{' '}
                <span className="text-[#7d857d]">{targetEmployee.department}</span>
              </p>
            )}

            {/* Grid of details: Email, Mobile, Company, Manager, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 pt-3 text-xs text-[#5c665c] border-t border-[#edebe6]">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-4 h-4 text-[#7d857d] shrink-0" />
                <span className="truncate">{targetEmployee.email}</span>
              </div>

              <div className="flex items-center gap-2 truncate">
                <Phone className="w-4 h-4 text-[#7d857d] shrink-0" />
                <span>{targetEmployee.mobile}</span>
              </div>

              <div className="flex items-center gap-2 truncate">
                <Building className="w-4 h-4 text-[#7d857d] shrink-0" />
                <span>{targetEmployee.company}</span>
              </div>

              <div className="flex items-center gap-2 truncate">
                <Briefcase className="w-4 h-4 text-[#7d857d] shrink-0" />
                <span>Manager: {targetEmployee.manager || 'Leadership'}</span>
              </div>

              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-[#7d857d] shrink-0" />
                <span>{targetEmployee.location}</span>
              </div>

              <div className="flex items-center gap-2 truncate">
                <Calendar className="w-4 h-4 text-[#7d857d] shrink-0" />
                <span>Joined {targetEmployee.dateOfJoining}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 border-b border-[#e8e6e1] flex items-center gap-2 sm:gap-4 overflow-x-auto">
          <button
            id="tab-resume-btn"
            onClick={() => setActiveTab('resume')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'resume'
                ? 'border-[#384538] text-[#384538]'
                : 'border-transparent text-[#7d857d] hover:text-[#2c332c]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Resume & Skills</span>
          </button>

          <button
            id="tab-private-info-btn"
            onClick={() => setActiveTab('private')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'private'
                ? 'border-[#384538] text-[#384538]'
                : 'border-transparent text-[#7d857d] hover:text-[#2c332c]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Private & Banking Info</span>
          </button>

          {/* Salary Info Tab - Visible to Admin ONLY (Spec section 4 & 8) */}
          {isAdmin && (
            <button
              id="tab-salary-info-btn"
              onClick={() => setActiveTab('salary')}
              className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'salary'
                  ? 'border-[#4a594a] text-[#4a594a]'
                  : 'border-transparent text-[#7d857d] hover:text-[#2c332c]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#4a594a]" />
              <span>Salary Info (Admin Only)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'resume' && (
        <ResumeTab
          employee={targetEmployee}
          isEditable={canEdit}
          onUpdate={handleUpdateResume}
        />
      )}

      {activeTab === 'private' && (
        <PrivateInfoTab
          employee={targetEmployee}
          isEditable={canEdit}
          onUpdate={handleUpdatePrivate}
        />
      )}

      {activeTab === 'salary' && isAdmin && (
        <SalaryInfoTab
          employee={targetEmployee}
          onSaveSalary={handleUpdateSalary}
        />
      )}
    </div>
  );
};
