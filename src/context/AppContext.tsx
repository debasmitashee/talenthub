import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Job, Applicant, ApplicantStatus, HRUser } from '@/types';
import { mockJobs } from '@/data/mockData';

interface AppContextValue {
  jobs: Job[];
  currentUser: HRUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<HRUser>) => void;
  addJob: (job: Omit<Job, 'id' | 'applicants' | 'postedDate'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  getJob: (id: string) => Job | undefined;
  updateApplicantStatus: (jobId: string, applicantId: string, status: ApplicantStatus) => void;
  addApplicant: (jobId: string, applicant: Omit<Applicant, 'id' | 'appliedDate' | 'status'>) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const mockUser: HRUser = {
  name: 'Jennifer Adams',
  email: 'hr@talenthub.com',
  role: 'HR Manager',
  avatar: 'JA',
  phone: '+1 (555) 010-2030',
  department: 'Human Resources',
  bio: 'HR Manager at TalentHub with 8+ years of experience in talent acquisition and recruitment. Passionate about building great teams and creating an exceptional candidate experience.',
  joinDate: '2021-03-15',
  location: 'San Francisco, CA',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [currentUser, setCurrentUser] = useState<HRUser | null>(null);

  const login = (email: string, _password: string) => {
    if (email.trim().length > 0 && _password.trim().length > 0) {
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const avatar = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
      setCurrentUser({ ...mockUser, name, email, avatar });
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const updateProfile = (updates: Partial<HRUser>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const addJob = (job: Omit<Job, 'id' | 'applicants' | 'postedDate'>) => {
    const newJob: Job = {
      ...job,
      id: `j${Date.now()}`,
      applicants: [],
      postedDate: new Date().toISOString().split('T')[0],
    };
    setJobs((prev) => [newJob, ...prev]);
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const getJob = (id: string) => jobs.find((j) => j.id === id);

  const updateApplicantStatus = (jobId: string, applicantId: string, status: ApplicantStatus) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              applicants: j.applicants.map((a) => (a.id === applicantId ? { ...a, status } : a)),
            }
          : j,
      ),
    );
  };

  const addApplicant = (jobId: string, applicant: Omit<Applicant, 'id' | 'appliedDate' | 'status'>) => {
    const newApplicant: Applicant = {
      ...applicant,
      id: `a${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, applicants: [...j.applicants, newApplicant] } : j)),
    );
  };

  return (
    <AppContext.Provider
      value={{
        jobs,
        currentUser,
        login,
        logout,
        updateProfile,
        addJob,
        updateJob,
        deleteJob,
        getJob,
        updateApplicantStatus,
        addApplicant,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
