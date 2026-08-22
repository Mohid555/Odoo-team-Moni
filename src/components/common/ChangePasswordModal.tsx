import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { changePassword, currentUser } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = changePassword(oldPassword, newPassword);
    if (!result.success) {
      setError(result.error || 'Failed to change password');
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c332c]/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#dedad2] w-full max-w-md overflow-hidden text-[#2c332c]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#edebe6] flex items-center justify-between bg-[#f8f7f4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eaf0ea] border border-[#c8dac8] flex items-center justify-center text-[#345c34]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2c332c]">Change Password</h3>
              <p className="text-xs text-[#7d857d]">Update credentials for {currentUser?.loginId}</p>
            </div>
          </div>
          <button
            id="close-password-modal-btn"
            onClick={onClose}
            className="text-[#7d857d] hover:text-[#2c332c] p-1.5 rounded-lg hover:bg-[#dedad2]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#faebe8] border border-[#f0c8c2] text-[#9e4236] text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-[#eaf0ea] border border-[#c8dac8] text-[#345c34] text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          {currentUser?.isTemporaryPassword && (
            <div className="p-3 bg-[#fbf5e6] border border-[#f0dfad] text-[#8c5e1e] text-xs rounded-xl">
              <strong>Action Required:</strong> You are using a system-generated initial password. Please set your own secure password to continue.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#3d463d] mb-1.5">
              Current / Temporary Password
            </label>
            <div className="relative">
              <input
                id="old-password-input"
                type={showOld ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password (demo: password123)"
                className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-sm text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d857d] hover:text-[#2c332c]"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3d463d] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password-input"
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-sm text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d857d] hover:text-[#2c332c]"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3d463d] mb-1.5">
              Confirm New Password
            </label>
            <input
              id="confirm-password-input"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-sm text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#edebe6]">
            <button
              type="button"
              id="cancel-password-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5c665c] hover:text-[#2c332c] hover:bg-[#edebe6] rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-new-password-btn"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#384538] hover:bg-[#2d382d] active:bg-[#1f281f] rounded-xl shadow-xs hover:shadow-md transition cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
