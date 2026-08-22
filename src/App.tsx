import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HRMSProvider, useHRMS } from './context/HRMSContext';
import { Navbar } from './components/Navbar';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { EmployeesList } from './components/employees/EmployeesList';
import { EmployeeProfile } from './components/profile/EmployeeProfile';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { TimeOffModule } from './components/timeoff/TimeOffModule';

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { activeNavTab, selectedEmployeeId } = useHRMS();
  const [isSigningUp, setIsSigningUp] = useState(false);

  if (!isAuthenticated) {
    if (isSigningUp) {
      return <SignUp onNavigateToSignIn={() => setIsSigningUp(false)} />;
    }
    return <SignIn onNavigateToSignUp={() => setIsSigningUp(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#2c332c] flex flex-col font-sans antialiased selection:bg-[#5a6e5a] selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeNavTab === 'employees' && (
          selectedEmployeeId ? <EmployeeProfile /> : <EmployeesList />
        )}

        {activeNavTab === 'attendance' && <AttendanceModule />}

        {activeNavTab === 'timeoff' && <TimeOffModule />}

        {activeNavTab === 'profile' && <EmployeeProfile />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HRMSProvider>
        <MainAppContent />
      </HRMSProvider>
    </AuthProvider>
  );
}
