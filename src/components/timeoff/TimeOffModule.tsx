import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Plane,
  AlertCircle,
  Paperclip,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { NewTimeOffModal } from './NewTimeOffModal';
import { TimeOffRequest, TimeOffStatus } from '../../types';

export const TimeOffModule: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    timeOffRequests,
    allocations,
    getEmployeeAllocation,
    approveTimeOffRequest,
    rejectTimeOffRequest,
  } = useHRMS();

  const isAdmin = currentUser?.role === 'admin';

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TimeOffStatus>('ALL');
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'Paid Time Off' | 'Sick Leave' | 'Unpaid Leave'>('ALL');

  // Allocation cards for the active user (or company overview if admin)
  const currentAllocation = currentUser ? getEmployeeAllocation(currentUser.id) : {
    paidTimeOffTotal: 24,
    paidTimeOffUsed: 4,
    sickLeaveTotal: 7,
    sickLeaveUsed: 1,
    unpaidLeaveUsed: 0,
  };

  const ptoRemaining = currentAllocation.paidTimeOffTotal - currentAllocation.paidTimeOffUsed;
  const sickRemaining = currentAllocation.sickLeaveTotal - currentAllocation.sickLeaveUsed;

  // Filtered requests based on role
  const visibleRequests = useMemo(() => {
    return timeOffRequests.filter((req) => {
      // If employee, see ONLY own requests
      if (!isAdmin && req.employeeId !== currentUser?.id) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && req.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (activeTabFilter !== 'ALL' && req.timeOffType !== activeTabFilter) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          req.employeeName.toLowerCase().includes(q) ||
          req.timeOffType.toLowerCase().includes(q) ||
          req.reason.toLowerCase().includes(q) ||
          req.startDate.includes(q) ||
          req.endDate.includes(q)
        );
      }

      return true;
    });
  }, [timeOffRequests, isAdmin, currentUser?.id, statusFilter, activeTabFilter, searchQuery]);

  const pendingCount = visibleRequests.filter((r) => r.status === 'pending').length;

  const getStatusBadge = (status: TimeOffStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Time Off & Leave Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isAdmin
              ? 'Admin view: Review and approve staff leave applications and manage balances.'
              : 'Employee view: Request planned time-off or sick leave and view remaining balances.'}
          </p>
        </div>

        <button
          id="open-new-timeoff-modal-btn"
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs hover:shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NEW Time Off Request</span>
        </button>
      </div>

      {/* Allocation Summary Cards (Spec 7.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Paid Time Off Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
              Paid Leave
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-800">Paid Time Off (PTO)</h3>
            <p className="text-3xl font-black text-slate-900 mt-1">
              {String(ptoRemaining).padStart(2, '0')}{' '}
              <span className="text-xs font-semibold text-slate-400">
                / {currentAllocation.paidTimeOffTotal} Days Available
              </span>
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all"
                style={{
                  width: `${(currentAllocation.paidTimeOffUsed / currentAllocation.paidTimeOffTotal) * 100}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {currentAllocation.paidTimeOffUsed} Days Used this calendar year
            </p>
          </div>
        </div>

        {/* Sick Time Off Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Medical Leave
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-800">Sick Time Off</h3>
            <p className="text-3xl font-black text-slate-900 mt-1">
              {String(sickRemaining).padStart(2, '0')}{' '}
              <span className="text-xs font-semibold text-slate-400">
                / {String(currentAllocation.sickLeaveTotal).padStart(2, '0')} Days Available
              </span>
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${(currentAllocation.sickLeaveUsed / currentAllocation.sickLeaveTotal) * 100}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Certificate required upon application
            </p>
          </div>
        </div>

        {/* Unpaid Leave / Pending Overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
              {isAdmin ? 'Action Queue' : 'Unpaid Leave'}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-800">
              {isAdmin ? 'Pending Approvals' : 'Unpaid Leave Logged'}
            </h3>
            <p className="text-3xl font-black text-amber-600 mt-1">
              {isAdmin ? pendingCount : currentAllocation.unpaidLeaveUsed}{' '}
              <span className="text-xs font-semibold text-slate-400">
                {isAdmin ? 'Requests Waiting' : 'Days Total'}
              </span>
            </p>
            <p className="text-[10px] text-slate-400 mt-3.5">
              {isAdmin
                ? 'Review submissions below and approve with 1-click'
                : 'Deducted directly from monthly attendance payroll calculation'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="timeoff-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee, leave type, reason..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Status selector */}
          <select
            id="timeoff-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Type selector */}
          <select
            id="timeoff-type-filter"
            value={activeTabFilter}
            onChange={(e) => setActiveTabFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="ALL">All Leave Types</option>
            <option value="Paid Time Off">Paid Time Off</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Unpaid Leave">Unpaid Leave</option>
          </select>
        </div>
      </div>

      {/* Requests Table List (Spec 7.1) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {isAdmin ? 'All Employees Time Off Applications' : 'My Time Off History'}
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {visibleRequests.length} {visibleRequests.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-4">Time Off Type</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4 text-center">Days</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Attachment</th>
                <th className="py-3 px-4">Status</th>
                {isAdmin && <th className="py-3 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRequests.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="py-12 text-center text-slate-400">
                    No time off applications found.
                  </td>
                </tr>
              ) : (
                visibleRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition">
                    {/* Name */}
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.employeeAvatar}
                          alt={req.employeeName}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{req.employeeName}</p>
                          <p className="text-[10px] text-slate-400">{req.department}</p>
                        </div>
                      </div>
                    </td>

                    {/* Time Off Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          req.timeOffType === 'Paid Time Off'
                            ? 'bg-sky-50 text-sky-700 border border-sky-100'
                            : req.timeOffType === 'Sick Leave'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {req.timeOffType}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {req.startDate}
                    </td>

                    {/* End Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {req.endDate}
                    </td>

                    {/* Days */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {req.days.toFixed(1)}
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={req.reason}>
                      {req.reason}
                    </td>

                    {/* Attachment */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {req.attachmentName ? (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded border border-indigo-200 cursor-pointer"
                          title="Medical / Leave document"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span className="truncate max-w-[100px]">{req.attachmentName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>

                    {/* Admin Actions: Approve / Reject (Spec 7.1) */}
                    {isAdmin && (
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`approve-timeoff-${req.id}`}
                              onClick={() => approveTimeOffRequest(req.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              id={`reject-timeoff-${req.id}`}
                              onClick={() => rejectTimeOffRequest(req.id)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {req.reviewedBy ? `Reviewed by ${req.reviewedBy}` : 'Completed'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Time Off Request Modal */}
      <NewTimeOffModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
    </div>
  );
};
