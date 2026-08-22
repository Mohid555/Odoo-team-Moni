import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Globe,
  Mail,
  User,
  Shield,
  CreditCard,
  Lock,
  Building,
  KeyRound,
  CheckCircle,
} from 'lucide-react';
import { Employee } from '../../types';
import { ChangePasswordModal } from '../common/ChangePasswordModal';

interface PrivateInfoTabProps {
  employee: Employee;
  isEditable: boolean;
  onUpdate: (data: Partial<Employee>) => void;
}

export const PrivateInfoTab: React.FC<PrivateInfoTabProps> = ({ employee, isEditable, onUpdate }) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [residingAddress, setResidingAddress] = useState(employee.residingAddress || '');
  const [dateOfBirth, setDateOfBirth] = useState(employee.dateOfBirth || '');
  const [nationality, setNationality] = useState(employee.nationality || 'Indian');
  const [personalEmail, setPersonalEmail] = useState(employee.personalEmail || '');
  const [gender, setGender] = useState(employee.gender || 'Male');
  const [maritalStatus, setMaritalStatus] = useState(employee.maritalStatus || 'Single');

  const [bankDetails, setBankDetails] = useState(
    employee.bankDetails || {
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      uanNumber: '',
      panNumber: '',
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdate({
      residingAddress,
      dateOfBirth,
      nationality,
      personalEmail,
      gender,
      maritalStatus,
      bankDetails,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 text-[#2c332c]">
      {/* Save Action Bar if Editable */}
      {isEditable && (
        <div className="flex items-center justify-between p-3 bg-[#f8f7f4] border border-[#dedad2] rounded-xl">
          <span className="text-xs text-[#7d857d]">
            {savedSuccess ? (
              <span className="text-[#345c34] font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Changes saved successfully!
              </span>
            ) : (
              'Confidential employee records and identity information'
            )}
          </span>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#384538] hover:bg-[#2d382d] text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Save Private Info
          </button>
        </div>
      )}

      {/* General Personal Details */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e8e6e1] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#edebe6]">
          <User className="w-4 h-4 text-[#5a6e5a]" />
          <h3 className="text-sm font-bold text-[#2c332c]">Personal Identification & Contact</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[#7d857d] font-semibold mb-1">Personal Email</label>
            {isEditable ? (
              <input
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
              />
            ) : (
              <p className="font-semibold text-[#2c332c] bg-[#f8f7f4] p-2 rounded-xl">{employee.personalEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-[#7d857d] font-semibold mb-1">Date of Birth</label>
            {isEditable ? (
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
              />
            ) : (
              <p className="font-semibold text-[#2c332c] bg-[#f8f7f4] p-2 rounded-xl">{employee.dateOfBirth}</p>
            )}
          </div>

          <div>
            <label className="block text-[#7d857d] font-semibold mb-1">Nationality</label>
            {isEditable ? (
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
              />
            ) : (
              <p className="font-semibold text-[#2c332c] bg-[#f8f7f4] p-2 rounded-xl">{employee.nationality}</p>
            )}
          </div>

          <div>
            <label className="block text-[#7d857d] font-semibold mb-1">Gender</label>
            {isEditable ? (
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <p className="font-semibold text-[#2c332c] bg-[#f8f7f4] p-2 rounded-xl">{employee.gender}</p>
            )}
          </div>

          <div>
            <label className="block text-[#7d857d] font-semibold mb-1">Marital Status</label>
            {isEditable ? (
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            ) : (
              <p className="font-semibold text-[#2c332c] bg-[#f8f7f4] p-2 rounded-xl">{employee.maritalStatus}</p>
            )}
          </div>

          <div>
            <label className="block text-[#7d857d] font-semibold mb-1">Employee Internal Code</label>
            <p className="font-mono font-bold text-[#2d4d2d] bg-[#eaf0ea] border border-[#c8dac8] p-2 rounded-xl">
              {employee.empCode}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-[#7d857d] font-semibold mb-1 text-xs">Residing Address</label>
          {isEditable ? (
            <textarea
              rows={2}
              value={residingAddress}
              onChange={(e) => setResidingAddress(e.target.value)}
              className="w-full p-3 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-xs text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
            />
          ) : (
            <p className="text-xs text-[#5c665c] bg-[#f8f7f4] p-3 rounded-xl">{employee.residingAddress}</p>
          )}
        </div>
      </div>

      {/* Banking & Statutory Details */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e8e6e1] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#edebe6]">
          <CreditCard className="w-4 h-4 text-[#5a6e5a]" />
          <h3 className="text-sm font-bold text-[#2c332c]">Banking & Statutory Identifiers</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[#7d857d] font-semibold mb-1">Bank Name</label>
            {isEditable ? (
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                className="w-full px-3 py-2 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
              />
            ) : (
              <p className="font-semibold text-[#2c332c] bg-[#f8f7f4] p-2 rounded-xl">{bankDetails.bankName}</p>
            )}
          </div>

          <div>
            <label className="block text-[#7d857d] font-semibold mb-1">Bank Account Number</label>
            {isEditable ? (
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#f8f7f4] border border-[#dedad2] rounded-xl font-mono text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
              />
            ) : (
              <p className="font-mono font-semibold text-[#2c332c] bg-[#f8f7f4] p-2 rounded-xl">
                ••••••••{bankDetails.accountNumber.slice(-4) || '1234'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[#7d857d] font-semibold mb-1">IFSC Code</label>
            {isEditable ? (
              <input
                type="text"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-[#f8f7f4] border border-[#dedad2] rounded-xl font-mono text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition uppercase"
              />
            ) : (
              <p className="font-mono font-semibold text-[#2c332c] bg-[#f8f7f4] p-2 rounded-xl">{bankDetails.ifscCode}</p>
            )}
          </div>

          <div>
            <label className="block text-[#7d857d] font-semibold mb-1">PAN Number</label>
            {isEditable ? (
              <input
                type="text"
                value={bankDetails.panNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, panNumber: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-[#f8f7f4] border border-[#dedad2] rounded-xl font-mono text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition uppercase"
              />
            ) : (
              <p className="font-mono font-semibold text-[#2c332c] bg-[#f8f7f4] p-2 rounded-xl">{bankDetails.panNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-[#7d857d] font-semibold mb-1">Universal Account No (UAN)</label>
            {isEditable ? (
              <input
                type="text"
                value={bankDetails.uanNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, uanNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#f8f7f4] border border-[#dedad2] rounded-xl font-mono text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
              />
            ) : (
              <p className="font-mono font-semibold text-[#2c332c] bg-[#f8f7f4] p-2 rounded-xl">{bankDetails.uanNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e8e6e1] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#edebe6]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#5a6e5a]" />
            <h3 className="text-sm font-bold text-[#2c332c]">Security & Authentication</h3>
          </div>
          <button
            type="button"
            id="open-change-password-btn"
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-3 py-1.5 bg-[#eaf0ea] hover:bg-[#d8e6d8] text-[#345c34] border border-[#c8dac8] rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#f8f7f4] border border-[#edebe6] rounded-xl">
            <span className="text-[#7d857d] block text-[11px]">Password Status</span>
            <p className="font-bold text-[#2c332c] mt-0.5">
              {employee.isTemporaryPassword ? (
                <span className="text-[#a86e24]">Temporary (Update Recommended)</span>
              ) : (
                <span className="text-[#345c34]">Secure & Active</span>
              )}
            </p>
          </div>

          <div className="p-3 bg-[#f8f7f4] border border-[#edebe6] rounded-xl">
            <span className="text-[#7d857d] block text-[11px]">Two-Factor Auth (2FA)</span>
            <p className="font-bold text-[#2c332c] mt-0.5">SMS & Work Email Verified</p>
          </div>

          <div className="p-3 bg-[#f8f7f4] border border-[#edebe6] rounded-xl">
            <span className="text-[#7d857d] block text-[11px]">Last Active Session</span>
            <p className="font-bold text-[#2c332c] mt-0.5">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
