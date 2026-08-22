import React from 'react';
import { Plane, Mail, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';
import { Employee } from '../../types';

interface EmployeeCardProps {
  employee: Employee;
  onClick: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onClick }) => {
  const getStatusBadge = () => {
    switch (employee.status) {
      case 'present':
        return (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#eaf0ea] border border-[#c8dac8] text-[#345c34] text-[11px] font-bold shadow-2xs"
            title="Present in Office"
          >
            <span className="w-2 h-2 rounded-full bg-[#488248] animate-pulse" />
            <span>Present</span>
          </div>
        );
      case 'on_leave':
        return (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#f4ebe6] border border-[#e4d4cc] text-[#8c4b2a] text-[11px] font-bold shadow-2xs"
            title="On Approved Leave"
          >
            <Plane className="w-3 h-3 text-[#a3684c] -rotate-45" />
            <span>On Leave</span>
          </div>
        );
      case 'absent':
      default:
        return (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#f8f3e8] border border-[#e8ddc4] text-[#8a6824] text-[11px] font-bold shadow-2xs"
            title="Absent / Missing attendance"
          >
            <span className="w-2 h-2 rounded-full bg-[#c99b50]" />
            <span>Absent</span>
          </div>
        );
    }
  };

  return (
    <div
      id={`employee-card-${employee.id}`}
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-[#e8e6e1] hover:border-[#5a6e5a] p-5 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Status Icon & Role */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <span className="text-[10px] font-mono font-bold text-[#7d857d] bg-[#f8f7f4] border border-[#dedad2] px-2 py-0.5 rounded-md">
          {employee.loginId}
        </span>
        {getStatusBadge()}
      </div>

      {/* Main Avatar & Details */}
      <div className="flex items-center gap-3.5 mb-4">
        <div className="relative">
          <img
            src={employee.avatarUrl}
            alt={employee.fullName}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#edebe6] shadow-2xs group-hover:scale-105 transition-transform"
          />
          {employee.role === 'admin' && (
            <span
              className="absolute -bottom-1 -right-1 bg-[#4a594a] text-white p-0.5 rounded-full ring-2 ring-white"
              title="HR Administrator"
            >
              <ShieldCheck className="w-3 h-3" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-[#2c332c] group-hover:text-[#3d5c3d] transition-colors truncate">
            {employee.fullName}
          </h3>
          <p className="text-xs font-semibold text-[#5c665c] truncate">{employee.jobPosition}</p>
          <p className="text-[11px] text-[#7d857d] truncate">{employee.department}</p>
        </div>
      </div>

      {/* Contact & Location Footer */}
      <div className="pt-3 border-t border-[#edebe6] space-y-1.5 text-xs text-[#5c665c]">
        <div className="flex items-center gap-2 truncate">
          <Mail className="w-3.5 h-3.5 text-[#7d857d] shrink-0" />
          <span className="truncate">{employee.email}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#7d857d] pt-0.5">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#7d857d] shrink-0" />
            {employee.location}
          </span>
          <span>Joined {employee.joiningYear}</span>
        </div>
      </div>
    </div>
  );
};
