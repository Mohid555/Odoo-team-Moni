import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Users,
  UserCheck,
  Plane,
  AlertCircle,
  Building,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { EmployeeCard } from './EmployeeCard';
import { NewEmployeeModal } from './NewEmployeeModal';
import { EmployeeStatus } from '../../types';

export const EmployeesList: React.FC = () => {
  const { currentUser } = useAuth();
  const { employees, setSelectedEmployeeId, setActiveNavTab } = useHRMS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EmployeeStatus>('ALL');
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);

  // Departments list
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  // Statistics
  const stats = useMemo(() => {
    const total = employees.length;
    const present = employees.filter((e) => e.status === 'present').length;
    const onLeave = employees.filter((e) => e.status === 'on_leave').length;
    const absent = employees.filter((e) => e.status === 'absent').length;
    return { total, present, onLeave, absent };
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.fullName.toLowerCase().includes(q) ||
        emp.loginId.toLowerCase().includes(q) ||
        emp.jobPosition.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.location.toLowerCase().includes(q);

      const matchesDept =
        selectedDepartment === 'ALL' || emp.department === selectedDepartment;

      const matchesStatus =
        statusFilter === 'ALL' || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, selectedDepartment, statusFilter]);

  const handleCardClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setActiveNavTab('profile');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Metric Chips */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#2c332c] tracking-tight">
            Employees Directory
          </h1>
          <p className="text-xs text-[#7d857d] font-medium mt-0.5">
            Manage company personnel, view presence status, and access professional records.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {currentUser?.role === 'admin' && (
            <button
              id="new-employee-btn"
              onClick={() => setIsNewEmployeeModalOpen(true)}
              className="px-4 py-2.5 bg-[#384538] hover:bg-[#2d382d] active:bg-[#1f281f] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs hover:shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>NEW Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-[#384538] text-white border-[#384538] shadow-md'
              : 'bg-white text-[#2c332c] border-[#e8e6e1] hover:bg-[#f8f7f4]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold opacity-80">Total Staff</span>
            <Users className="w-4 h-4 opacity-70" />
          </div>
          <p className="text-2xl font-black mt-2">{stats.total}</p>
        </button>

        <button
          onClick={() => setStatusFilter('present')}
          className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
            statusFilter === 'present'
              ? 'bg-[#487a48] text-white border-[#487a48] shadow-md'
              : 'bg-white text-[#2c332c] border-[#e8e6e1] hover:bg-[#f0f5f0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold opacity-80">Present Today</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#5cb35c] animate-pulse" />
          </div>
          <p className={`text-2xl font-black mt-2 ${statusFilter === 'present' ? 'text-white' : 'text-[#386638]'}`}>
            {stats.present}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('on_leave')}
          className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
            statusFilter === 'on_leave'
              ? 'bg-[#a3684c] text-white border-[#a3684c] shadow-md'
              : 'bg-white text-[#2c332c] border-[#e8e6e1] hover:bg-[#f9f3ef]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold opacity-80">On Leave</span>
            <Plane className={`w-4 h-4 -rotate-45 ${statusFilter === 'on_leave' ? 'text-white' : 'text-[#a3684c]'}`} />
          </div>
          <p className={`text-2xl font-black mt-2 ${statusFilter === 'on_leave' ? 'text-white' : 'text-[#a3684c]'}`}>
            {stats.onLeave}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('absent')}
          className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
            statusFilter === 'absent'
              ? 'bg-[#b08846] text-white border-[#b08846] shadow-md'
              : 'bg-white text-[#2c332c] border-[#e8e6e1] hover:bg-[#fcf8f0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold opacity-80">Absent / Not In</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4a859]" />
          </div>
          <p className={`text-2xl font-black mt-2 ${statusFilter === 'absent' ? 'text-white' : 'text-[#a87d37]'}`}>
            {stats.absent}
          </p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#e8e6e1] shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#7d857d] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="employee-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, Login ID, role, department..."
            className="w-full pl-10 pr-4 py-2 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-xs sm:text-sm text-[#2c332c] placeholder:text-[#9ea69e] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Filter className="w-4 h-4 text-[#7d857d] shrink-0 hidden sm:block" />
          <select
            id="department-filter-select"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-xs font-semibold text-[#3d463d] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
          >
            <option value="ALL">All Departments ({departments.length})</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Employee Cards */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e6e1] p-12 text-center">
          <Users className="w-12 h-12 text-[#b0b8b0] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#2c332c]">No employees found</h3>
          <p className="text-xs text-[#7d857d] mt-1 max-w-sm mx-auto">
            Try adjusting your search query, department filter, or presence status filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onClick={() => handleCardClick(emp.id)}
            />
          ))}
        </div>
      )}

      {/* Admin New Employee Modal */}
      <NewEmployeeModal
        isOpen={isNewEmployeeModalOpen}
        onClose={() => setIsNewEmployeeModalOpen(false)}
      />
    </div>
  );
};
