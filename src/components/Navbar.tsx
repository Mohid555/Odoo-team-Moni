import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  CalendarCheck2,
  CalendarDays,
  User,
  LogOut,
  ChevronDown,
  Clock,
  Building2,
  KeyRound,
  ShieldCheck,
  Briefcase,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import { ChangePasswordModal } from './common/ChangePasswordModal';

export const Navbar: React.FC = () => {
  const { currentUser, company, logout, switchUser } = useAuth();
  const {
    activeNavTab,
    setActiveNavTab,
    checkInInfo,
    toggleCheckIn,
    employees,
    setSelectedEmployeeId,
  } = useHRMS();

  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isDemoUserMenuOpen, setIsDemoUserMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  const avatarRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // Live timer for checked-in status
  useEffect(() => {
    if (!checkInInfo.isCheckedIn || !checkInInfo.checkInTimestamp) {
      setElapsedMinutes(0);
      return;
    }

    const updateTimer = () => {
      const diffMs = Date.now() - (checkInInfo.checkInTimestamp || Date.now());
      setElapsedMinutes(Math.floor(diffMs / (1000 * 60)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // every 30s
    return () => clearInterval(interval);
  }, [checkInInfo.isCheckedIn, checkInInfo.checkInTimestamp]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) {
        setIsDemoUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatElapsedTime = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    if (hrs === 0) return `${rem}m`;
    return `${hrs}h ${rem}m`;
  };

  const handleNavClick = (tab: 'employees' | 'attendance' | 'timeoff') => {
    setActiveNavTab(tab);
    setSelectedEmployeeId(null);
  };

  const handleMyProfileClick = () => {
    if (currentUser) {
      setSelectedEmployeeId(currentUser.id);
      setActiveNavTab('profile');
      setIsAvatarMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e6e1] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Brand Logo & Navigation */}
            <div className="flex items-center gap-6 md:gap-8">
              {/* Company Logo & Name */}
              <button
                id="company-brand-btn"
                onClick={() => handleNavClick('employees')}
                className="flex items-center gap-3 group focus:outline-hidden text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#384538] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform overflow-hidden shrink-0 border border-[#2d382d]">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    company.code || 'HR'
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#2c332c] tracking-tight text-base leading-tight">
                      {company.name}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#edebe6] text-[#556155] rounded">
                      HRMS
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7d857d] font-medium">Enterprise Suite</p>
                </div>
              </button>

              {/* Main Nav Links */}
              <nav className="flex items-center gap-1 sm:gap-2">
                <button
                  id="nav-tab-employees"
                  onClick={() => handleNavClick('employees')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeNavTab === 'employees'
                      ? 'bg-[#384538] text-white shadow-xs'
                      : 'text-[#5c665c] hover:text-[#2c332c] hover:bg-[#edebe6]'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Employees</span>
                </button>

                <button
                  id="nav-tab-attendance"
                  onClick={() => handleNavClick('attendance')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeNavTab === 'attendance'
                      ? 'bg-[#384538] text-white shadow-xs'
                      : 'text-[#5c665c] hover:text-[#2c332c] hover:bg-[#edebe6]'
                  }`}
                >
                  <CalendarCheck2 className="w-4 h-4 shrink-0" />
                  <span>Attendance</span>
                </button>

                <button
                  id="nav-tab-timeoff"
                  onClick={() => handleNavClick('timeoff')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeNavTab === 'timeoff'
                      ? 'bg-[#384538] text-white shadow-xs'
                      : 'text-[#5c665c] hover:text-[#2c332c] hover:bg-[#edebe6]'
                  }`}
                >
                  <CalendarDays className="w-4 h-4 shrink-0" />
                  <span>Time Off</span>
                </button>
              </nav>
            </div>

            {/* Right: Systray Check-in/out, Role Switcher & User Avatar */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Systray Check In / Check Out */}
              <div className="hidden lg:flex items-center bg-[#f5f4ef] border border-[#dedad2] rounded-2xl px-3 py-1.5 shadow-2xs">
                <div className="flex items-center gap-2 mr-3 pr-3 border-r border-[#dedad2]">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      checkInInfo.isCheckedIn
                        ? 'bg-[#4a804a] ring-4 ring-[#d6e6d6] animate-pulse'
                        : 'bg-[#bf6852]'
                    }`}
                  />
                  <div className="text-left">
                    <p className="text-[11px] font-semibold text-[#2c332c] leading-tight">
                      {checkInInfo.isCheckedIn ? (
                        <span>Checked In Since <strong className="text-[#3b663b]">{checkInInfo.checkInTime}</strong></span>
                      ) : (
                        <span className="text-[#7d857d]">Checked Out</span>
                      )}
                    </p>
                    {checkInInfo.isCheckedIn && (
                      <p className="text-[10px] text-[#7d857d] font-medium">
                        Active: {formatElapsedTime(elapsedMinutes)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  id="quick-checkin-btn"
                  onClick={toggleCheckIn}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    checkInInfo.isCheckedIn
                      ? 'bg-[#f8ede8] text-[#9c4c32] hover:bg-[#f2dfd8] border border-[#e8d0c6]'
                      : 'bg-[#4a6b4a] text-white hover:bg-[#3d593d] shadow-xs'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{checkInInfo.isCheckedIn ? 'Check Out →' : 'Check IN →'}</span>
                </button>
              </div>

              {/* Demo Role / Switcher Dropdown */}
              <div className="relative" ref={demoRef}>
                <button
                  id="role-switcher-btn"
                  onClick={() => setIsDemoUserMenuOpen(!isDemoUserMenuOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    currentUser?.role === 'admin'
                      ? 'bg-[#edeae1] text-[#554e38] border-[#d8d3c5] hover:bg-[#e4dfd4]'
                      : 'bg-[#eef2ee] text-[#405940] border-[#d4ded4] hover:bg-[#e2ebe2]'
                  }`}
                  title="Switch test account / role"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">
                    {currentUser?.role === 'admin' ? 'HR Admin View' : 'Employee View'}
                  </span>
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
                </button>

                {isDemoUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e8e6e1] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-[#edebe6] mb-1">
                      <p className="text-xs font-bold text-[#2c332c]">Switch Persona (Demo)</p>
                      <p className="text-[11px] text-[#7d857d]">Test role-adapted views & permissions</p>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {employees.map((emp) => (
                        <button
                          key={emp.id}
                          id={`switch-to-${emp.id}`}
                          onClick={() => {
                            switchUser(emp.id);
                            setIsDemoUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs transition ${
                            emp.id === currentUser?.id
                              ? 'bg-[#f4f2ee] font-bold text-[#2c332c] border border-[#dedad2]'
                              : 'text-[#5c665c] hover:bg-[#f8f7f4] hover:text-[#2c332c]'
                          }`}
                        >
                          <img
                            src={emp.avatarUrl}
                            alt={emp.fullName}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-semibold text-[#2c332c]">{emp.fullName}</p>
                            <p className="text-[10px] text-[#7d857d] truncate">
                              {emp.jobPosition} • {emp.loginId}
                            </p>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${
                              emp.role === 'admin'
                                ? 'bg-[#edeae1] text-[#554e38]'
                                : 'bg-[#edebe6] text-[#556155]'
                            }`}
                          >
                            {emp.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar & User Dropdown */}
              <div className="relative" ref={avatarRef}>
                <button
                  id="avatar-menu-trigger"
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-[#edebe6] focus:outline-hidden transition cursor-pointer"
                >
                  <img
                    src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser?.fullName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#dedad2] shadow-2xs"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-[#7d857d] hidden sm:block" />
                </button>

                {isAvatarMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e8e6e1] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* User Header */}
                    <div className="px-3 py-2.5 border-b border-[#edebe6] mb-1 bg-[#f8f7f4] rounded-xl">
                      <p className="text-xs font-bold text-[#2c332c] truncate">{currentUser?.fullName}</p>
                      <p className="text-[11px] text-[#7d857d] truncate">{currentUser?.email}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#7d857d] font-semibold">{currentUser?.loginId}</span>
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${
                            currentUser?.role === 'admin'
                              ? 'bg-[#edeae1] text-[#554e38]'
                              : 'bg-[#eef2ee] text-[#405940]'
                          }`}
                        >
                          {currentUser?.role === 'admin' ? 'Admin / HR' : 'Employee'}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Systray action if small screen */}
                    <div className="lg:hidden p-1 mb-1 border-b border-[#edebe6]">
                      <button
                        onClick={toggleCheckIn}
                        className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${
                          checkInInfo.isCheckedIn
                            ? 'bg-[#f8ede8] text-[#9c4c32]'
                            : 'bg-[#4a6b4a] text-white'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{checkInInfo.isCheckedIn ? 'Check Out' : 'Check IN'}</span>
                      </button>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-0.5">
                      <button
                        id="avatar-menu-my-profile"
                        onClick={handleMyProfileClick}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#3d463d] hover:bg-[#f4f2ee] transition cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#7d857d]" />
                        <span>My Profile</span>
                      </button>

                      <button
                        id="avatar-menu-change-password"
                        onClick={() => {
                          setIsAvatarMenuOpen(false);
                          setIsPasswordModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#3d463d] hover:bg-[#f4f2ee] transition cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-[#7d857d]" />
                        <span>Change Password</span>
                      </button>

                      <div className="my-1 border-t border-[#edebe6]" />

                      <button
                        id="avatar-menu-logout"
                        onClick={() => {
                          setIsAvatarMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#a64a38] hover:bg-[#fcf1ef] transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-[#a64a38]" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
