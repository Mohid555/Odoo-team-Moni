import React, { useState, useMemo } from 'react';
import {
  X,
  CalendarDays,
  FileText,
  Upload,
  Paperclip,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { TimeOffType } from '../../types';

interface NewTimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTimeOffModal: React.FC<NewTimeOffModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { employees, createTimeOffRequest, getEmployeeAllocation } = useHRMS();

  const isAdmin = currentUser?.role === 'admin';

  const [employeeId, setEmployeeId] = useState<string>(currentUser?.id || 'emp-2');
  const [timeOffType, setTimeOffType] = useState<TimeOffType>('Paid Time Off');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate auto days allocation
  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) return 1.0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [startDate, endDate]);

  const allocation = getEmployeeAllocation(employeeId);
  const isSickLeave = timeOffType === 'Sick Leave';

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (calculatedDays <= 0) {
      setError('End date must be on or after Start date');
      return;
    }

    // Attachment validation rule: Required for Sick Leave
    if (isSickLeave && !attachmentName) {
      setError('Medical certificate attachment is mandatory for Sick Leave requests.');
      return;
    }

    createTimeOffRequest({
      employeeId,
      timeOffType,
      startDate,
      endDate,
      days: calculatedDays,
      reason: reason.trim() || 'No description provided.',
      attachmentName: attachmentName || undefined,
      attachmentDataUrl: attachmentDataUrl || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Request Time Off</h3>
              <p className="text-xs text-slate-500">Submit leave dates and certificate for review</p>
            </div>
          </div>
          <button
            id="close-timeoff-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Time Off Request Submitted!</h4>
            <p className="text-xs text-slate-500">Your leave request has been sent for manager review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Employee Selector (Auto-filled for self, selectable for admin) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employee</label>
              {isAdmin ? (
                <select
                  id="timeoff-employee-select"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.department} • {emp.loginId})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 flex items-center gap-2">
                  <img
                    src={currentUser?.avatarUrl}
                    alt={currentUser?.fullName}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>{currentUser?.fullName}</span>
                  <span className="text-slate-400 font-mono">({currentUser?.loginId})</span>
                </div>
              )}
            </div>

            {/* Time Off Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time Off Type</label>
              <select
                id="timeoff-type-select"
                value={timeOffType}
                onChange={(e) => setTimeOffType(e.target.value as TimeOffType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
              >
                <option value="Paid Time Off">
                  Paid Time Off ({allocation.paidTimeOffTotal - allocation.paidTimeOffUsed} Days Available)
                </option>
                <option value="Sick Leave">
                  Sick Leave ({allocation.sickLeaveTotal - allocation.sickLeaveUsed} Days Available)
                </option>
                <option value="Unpaid Leave">Unpaid Leave (No limit)</option>
              </select>
            </div>

            {/* Validity Period */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                <input
                  id="timeoff-start-date"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                <input
                  id="timeoff-end-date"
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Allocation duration badge */}
            <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-900">Calculated Allocation:</span>
              <span className="font-mono font-bold text-sm text-sky-700 bg-white px-2.5 py-0.5 rounded-lg border border-sky-200">
                {calculatedDays.toFixed(2)} {calculatedDays === 1 ? 'Day' : 'Days'}
              </span>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason / Note for Leave
              </label>
              <textarea
                id="timeoff-reason-textarea"
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief explanation for this leave request..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition"
              />
            </div>

            {/* Attachment Upload (Required for Sick Leave) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Medical Certificate / Attachment</span>
                </label>
                {isSickLeave ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Mandatory for Sick Leave
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Optional</span>
                )}
              </div>

              <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {attachmentName || 'No document attached'}
                    </p>
                    <p className="text-[10px] text-slate-400">PDF, JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <label
                  htmlFor="timeoff-file-input"
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer shadow-2xs transition"
                >
                  Browse File
                </label>
                <input
                  id="timeoff-file-input"
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                id="discard-timeoff-btn"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Discard
              </button>
              <button
                type="submit"
                id="submit-timeoff-btn"
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-xs transition cursor-pointer"
              >
                Submit Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
