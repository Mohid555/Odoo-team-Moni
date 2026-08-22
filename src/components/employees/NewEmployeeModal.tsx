import React, { useState, useMemo } from 'react';
import {
  X,
  UserPlus,
  Building,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  DollarSign,
  Sparkles,
  CheckCircle,
  Copy,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { generateLoginId, generateTemporaryPassword } from '../../utils/idGenerator';
import { createDefaultSalaryStructure } from '../../utils/salaryCalculator';
import { Employee } from '../../types';

interface NewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewEmployeeModal: React.FC<NewEmployeeModalProps> = ({ isOpen, onClose }) => {
  const { company } = useAuth();
  const { addNewEmployee, employees } = useHRMS();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [jobPosition, setJobPosition] = useState('');
  const [manager, setManager] = useState('Amit Sharma');
  const [location, setLocation] = useState('Gandhinagar Hub');
  const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyWage, setMonthlyWage] = useState('50000');
  const [initialPassword, setInitialPassword] = useState(() => generateTemporaryPassword('Emp'));
  const [avatarUrl, setAvatarUrl] = useState('');
  const [createdEmployee, setCreatedEmployee] = useState<Employee | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextSerial = employees.length + 1;
  const joiningYear = dateOfJoining ? new Date(dateOfJoining).getFullYear() : new Date().getFullYear();

  // Live Login ID preview
  const previewLoginId = useMemo(() => {
    return generateLoginId(
      company.name || 'OI',
      firstName || 'John',
      lastName || 'Doe',
      joiningYear,
      nextSerial
    );
  }, [company.name, firstName, lastName, joiningYear, nextSerial]);

  const previewPassword = useMemo(() => {
    return generateTemporaryPassword(firstName || 'Emp');
  }, [firstName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !jobPosition.trim() || !dateOfJoining || !monthlyWage) {
      setError('Please complete all required fields.');
      return;
    }

    const wageNum = parseFloat(monthlyWage) || 50000;

    setIsSubmitting(true);
    try {
      const newEmp = await addNewEmployee({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
        personalEmail: personalEmail || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
        mobile: mobile || '+91 98000 00000',
        passwordHash: initialPassword,
        company: company.name,
        department,
        jobPosition: jobPosition.trim(),
        manager,
        location,
        dateOfJoining,
        joiningYear,
        serialNumber: nextSerial,
        avatarUrl:
          avatarUrl ||
          `https://images.unsplash.com/photo-${1534528741775 + (nextSerial % 10)}?w=200&auto=format&fit=crop&q=80`,
        salary: createDefaultSalaryStructure(wageNum),
      });

      setCreatedEmployee(newEmp);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not create employee record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (createdEmployee) {
      navigator.clipboard.writeText(
        `Login ID: ${createdEmployee.loginId}\nTemporary Password: ${createdEmployee.temporaryPassword || initialPassword}\nEmail: ${createdEmployee.email}`
      );
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setCreatedEmployee(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPersonalEmail('');
    setMobile('');
    setJobPosition('');
    setInitialPassword(generateTemporaryPassword('Emp'));
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f281f]/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e8e6e1] w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 text-[#2c332c]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#edebe6] flex items-center justify-between bg-[#f8f7f4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eaf0ea] border border-[#c8dac8] flex items-center justify-center text-[#345c34]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2c332c]">Onboard New Employee</h3>
              <p className="text-xs text-[#7d857d]">System generates auto-computed Login ID & Initial Credentials</p>
            </div>
          </div>
          <button
            id="close-new-employee-modal-btn"
            onClick={handleResetAndClose}
            className="text-[#7d857d] hover:text-[#2c332c] p-1.5 rounded-lg hover:bg-[#edebe6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {createdEmployee ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#eaf0ea] border border-[#c8dac8] text-[#345c34] flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-[#2c332c]">Employee Successfully Onboarded!</h4>
              <p className="text-sm text-[#7d857d] mt-1">
                {createdEmployee.fullName} has been added to {company.name} directory.
              </p>
            </div>

            <div className="p-5 bg-[#f8f7f4] border border-[#dedad2] rounded-2xl text-left space-y-3 max-w-md mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-[#dedad2]">
                <span className="text-xs font-semibold text-[#7d857d]">Generated Login ID:</span>
                <span className="font-mono font-bold text-sm text-[#2d4d2d] bg-[#eaf0ea] px-2 py-0.5 rounded border border-[#c8dac8]">
                  {createdEmployee.loginId}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#dedad2]">
                <span className="text-xs font-semibold text-[#7d857d]">Work Email:</span>
                <span className="text-xs font-semibold text-[#2c332c]">{createdEmployee.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#7d857d]">Temporary Password:</span>
                <span className="font-mono font-bold text-xs text-[#8a6824] bg-[#f8f3e8] px-2 py-0.5 rounded border border-[#e8ddc4]">
                  {createdEmployee.passwordHash}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="px-4 py-2.5 bg-[#eaf0ea] hover:bg-[#d8e6d8] text-[#345c34] border border-[#c8dac8] rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedId ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-2.5 bg-[#384538] hover:bg-[#2d382d] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Create Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-[#faebe8] border border-[#f0c8c2] text-[#9e4236] text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {/* Live Login ID preview banner */}
            <div className="p-4 bg-[#f2f6f2] border border-[#cfe0cf] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#487a48]" />
                <div>
                  <p className="text-xs font-bold text-[#2d4d2d]">Auto-Generated Login ID Preview</p>
                  <p className="text-[11px] text-[#4d734d]">
                    Formula: [Company:{company.code || 'OI'}][Name:{firstName ? firstName.slice(0, 2).toUpperCase() : 'JO'}
                    {lastName ? lastName.slice(0, 2).toUpperCase() : 'DO'}][Year:{joiningYear}][Serial:{String(nextSerial).padStart(4, '0')}]
                  </p>
                </div>
              </div>
              <span className="font-mono font-bold text-sm bg-white text-[#2d4d2d] px-2.5 py-1 rounded-xl border border-[#cfe0cf] shadow-2xs">
                {previewLoginId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3d463d] mb-1">First Name *</label>
                <input
                  id="new-emp-first-name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3d463d] mb-1">Last Name *</label>
                <input
                  id="new-emp-last-name"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3d463d] mb-1">Job Position *</label>
                <input
                  id="new-emp-job-position"
                  type="text"
                  required
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  placeholder="e.g. Frontend Engineer, Product Designer"
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3d463d] mb-1">Department *</label>
                <select
                  id="new-emp-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
                >
                  <option value="Frontend Engineering">Frontend Engineering</option>
                  <option value="Platform & Cloud Infrastructure">Platform & Cloud Infrastructure</option>
                  <option value="Product Design">Product Design</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3d463d] mb-1">Work Email</label>
                <input
                  id="new-emp-work-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Leave blank to auto-generate"
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3d463d] mb-1">Mobile Number</label>
                <input
                  id="new-emp-mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3d463d] mb-1">Initial Password *</label>
              <input
                id="new-emp-initial-password"
                type="text"
                required
                minLength={6}
                value={initialPassword}
                onChange={(e) => setInitialPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
              />
              <p className="text-[11px] text-[#7d857d] mt-1">The employee uses this password for the first login.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#3d463d] mb-1">Date of Joining</label>
                <input
                  id="new-emp-doj"
                  type="date"
                  required
                  value={dateOfJoining}
                  onChange={(e) => setDateOfJoining(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3d463d] mb-1">Location</label>
                <input
                  id="new-emp-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Gandhinagar Hub"
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3d463d] mb-1">Starting Wage (₹/Mo)</label>
                <input
                  id="new-emp-wage"
                  type="number"
                  required
                  value={monthlyWage}
                  onChange={(e) => setMonthlyWage(e.target.value)}
                  placeholder="50000"
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] text-[#2c332c] rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#edebe6]">
              <button
                type="button"
                id="cancel-new-emp-btn"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 text-xs font-semibold text-[#5c665c] hover:text-[#2c332c] hover:bg-[#edebe6] rounded-xl transition"
              >
                Discard
              </button>
              <button
                type="submit"
                id="submit-new-emp-btn"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#384538] hover:bg-[#2d382d] rounded-xl shadow-xs hover:shadow-md transition cursor-pointer"
              >
                {isSubmitting ? 'Creating Employee...' : 'Create Employee Record'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
