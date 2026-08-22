import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plane,
  Coffee,
  Download,
  Filter,
  Users,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { AttendanceRecord } from '../../types';

export const AttendanceModule: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    attendanceRecords,
    employees,
    checkInInfo,
    toggleCheckIn,
  } = useHRMS();

  const isAdmin = currentUser?.role === 'admin';

  // Selected date filter
  const [selectedMonth, setSelectedMonth] = useState('2025-10'); // Default October 2025
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Role-based records filtering
  const visibleRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      // If employee, see ONLY own records
      if (!isAdmin && rec.employeeId !== currentUser?.id) {
        return false;
      }

      // If admin and specific employee selected
      if (isAdmin && selectedEmployeeFilter !== 'ALL' && rec.employeeId !== selectedEmployeeFilter) {
        return false;
      }

      // Month filter
      if (selectedMonth && !rec.date.startsWith(selectedMonth)) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          rec.employeeName.toLowerCase().includes(q) ||
          rec.date.includes(q) ||
          rec.status.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [attendanceRecords, isAdmin, currentUser?.id, selectedEmployeeFilter, selectedMonth, searchQuery]);

  // Group records by Date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, AttendanceRecord[]> = {};
    visibleRecords.forEach((rec) => {
      if (!groups[rec.date]) {
        groups[rec.date] = [];
      }
      groups[rec.date].push(rec);
    });

    // Sort dates descending
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedKeys.map((date) => ({
      date,
      records: groups[date],
    }));
  }, [visibleRecords]);

  // Summary Metrics calculations
  const stats = useMemo(() => {
    const userRecords = isAdmin && selectedEmployeeFilter === 'ALL'
      ? visibleRecords
      : visibleRecords.filter((r) => r.employeeId === (isAdmin ? selectedEmployeeFilter : currentUser?.id));

    const presentDays = new Set(
      userRecords.filter((r) => r.status === 'present').map((r) => `${r.employeeId}-${r.date}`)
    ).size;

    const leaveDays = new Set(
      userRecords.filter((r) => r.status === 'on_leave').map((r) => `${r.employeeId}-${r.date}`)
    ).size;

    const absentDays = new Set(
      userRecords.filter((r) => r.status === 'absent').map((r) => `${r.employeeId}-${r.date}`)
    ).size;

    const totalHours = userRecords.reduce((acc, r) => acc + (r.workHours || 0), 0);
    const avgHours = userRecords.length > 0 ? (totalHours / userRecords.length).toFixed(1) : '8.0';

    return {
      presentDays,
      leaveDays,
      absentDays,
      totalWorkingDays: 22, // Standard working days in month
      avgHours,
      payableDays: Math.max(0, 22 - absentDays),
    };
  }, [visibleRecords, isAdmin, selectedEmployeeFilter, currentUser?.id]);

  const formatDateHeader = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Present
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
            <Plane className="w-3 h-3 text-sky-600 -rotate-45" />
            On Leave
          </span>
        );
      case 'absent':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Absent
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Quick Check In */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Attendance & Work Logs
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isAdmin
              ? 'Admin view: Monitor organization-wide daily punches, work hours, and overtime.'
              : 'Employee view: Track your daily check-in timestamps, break durations, and payable hours.'}
          </p>
        </div>

        {/* Employee Check-In Widget */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-2xl p-2 px-3 shadow-2xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                checkInInfo.isCheckedIn
                  ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-pulse'
                  : 'bg-rose-400'
              }`}
            />
            <div className="text-left pr-2">
              <p className="text-xs font-bold text-slate-900">
                {checkInInfo.isCheckedIn ? `Checked In (${checkInInfo.checkInTime})` : 'Checked Out'}
              </p>
            </div>
            <button
              id="attendance-checkin-toggle-btn"
              onClick={toggleCheckIn}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                checkInInfo.isCheckedIn
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{checkInInfo.isCheckedIn ? 'Check Out →' : 'Check IN →'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Chips (Spec 6.2) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Days Present</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {stats.presentDays} <span className="text-xs text-slate-400 font-normal">days</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Verified check-in timestamps</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Approved Leaves</span>
          <p className="text-2xl font-black text-sky-600 mt-1">
            {stats.leaveDays} <span className="text-xs text-slate-400 font-normal">days</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Paid / Medical time-off</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Month Working Days</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {stats.totalWorkingDays} <span className="text-xs text-slate-400 font-normal">days</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Excludes weekends</p>
        </div>

        <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 shadow-2xs">
          <span className="text-xs font-bold text-indigo-900">Total Payable Days (Payslip Basis)</span>
          <p className="text-2xl font-black text-indigo-700 mt-1">
            {stats.payableDays} <span className="text-xs text-indigo-500 font-semibold">/ 22 days</span>
          </p>
          <p className="text-[10px] text-indigo-600 mt-1">
            Auto-calculated basis for monthly payroll computation
          </p>
        </div>
      </div>

      {/* Date Navigation & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Date / Month Picker Navigation */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setSelectedMonth('2025-09')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                selectedMonth === '2025-09' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Sep 2025
            </button>
            <button
              onClick={() => setSelectedMonth('2025-10')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                selectedMonth === '2025-10' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Oct 2025 (Active)
            </button>
            <button
              onClick={() => setSelectedMonth('2025-11')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                selectedMonth === '2025-11' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Nov 2025
            </button>
          </div>
        </div>

        {/* Filter by Employee if Admin & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {isAdmin && (
            <div className="w-full sm:w-auto">
              <select
                id="attendance-employee-filter"
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
              >
                <option value="ALL">All Staff Members ({employees.length})</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.loginId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search date, status..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Grouped Attendance Tables */}
      <div className="space-y-5">
        {groupedByDate.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No attendance entries found</h3>
            <p className="text-xs text-slate-400 mt-1">Try selecting another month or clearing search filters.</p>
          </div>
        ) : (
          groupedByDate.map((group) => (
            <div
              key={group.date}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
            >
              {/* Date Group Header */}
              <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">
                    {formatDateHeader(group.date)}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {group.records.length} {group.records.length === 1 ? 'Record' : 'Records'}
                </span>
              </div>

              {/* Table per Date */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="py-3 px-6">Employee</th>
                      <th className="py-3 px-4">Check In</th>
                      <th className="py-3 px-4">Check Out</th>
                      <th className="py-3 px-4">Work Hours</th>
                      <th className="py-3 px-4">Break Time</th>
                      <th className="py-3 px-4">Extra / Overtime</th>
                      <th className="py-3 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {group.records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={rec.employeeAvatar}
                              alt={rec.employeeName}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{rec.employeeName}</p>
                              {rec.notes && (
                                <p className="text-[10px] text-slate-400">{rec.notes}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                          {rec.checkIn}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                          {rec.checkOut || '-'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {rec.workHours > 0 ? `${rec.workHours} hrs` : '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 flex items-center gap-1 pt-4">
                          <Coffee className="w-3 h-3 text-slate-400" />
                          <span>{rec.breakMinutes > 0 ? `${rec.breakMinutes} mins` : '-'}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {rec.extraHours > 0 ? (
                            <span className="text-indigo-600 font-bold">+{rec.extraHours} hrs</span>
                          ) : (
                            '0.00'
                          )}
                        </td>
                        <td className="py-3 px-6 text-right">{getStatusBadge(rec.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
