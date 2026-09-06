import { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import LoginPage from '@/pages/LoginPage';
import Sidebar, { type View } from '@/components/Sidebar';
import Dashboard from '@/pages/Dashboard';
import JobList from '@/pages/JobList';
import JobDetails from '@/pages/JobDetails';
import JobForm from '@/pages/JobForm';
import AllApplicants from '@/pages/AllApplicants';
import ProfilePage from '@/pages/ProfilePage';

type Screen =
  | { name: 'dashboard' }
  | { name: 'jobs' }
  | { name: 'applicants' }
  | { name: 'profile' }
  | { name: 'job-details'; jobId: string }
  | { name: 'job-form'; jobId?: string };

function AppContent() {
  const { currentUser } = useApp();
  const [view, setView] = useState<View>('dashboard');
  const [screen, setScreen] = useState<Screen>({ name: 'dashboard' });

  if (!currentUser) return <LoginPage />;

  const goJobs = () => { setView('jobs'); setScreen({ name: 'jobs' }); };
  const goJobDetails = (jobId: string) => setScreen({ name: 'job-details', jobId });
  const goAddJob = () => setScreen({ name: 'job-form' });
  const goEditJob = (jobId: string) => setScreen({ name: 'job-form', jobId });

  const handleSetView = (v: View) => {
    setView(v);
    if (v === 'dashboard') setScreen({ name: 'dashboard' });
    if (v === 'jobs') setScreen({ name: 'jobs' });
    if (v === 'applicants') setScreen({ name: 'applicants' });
    if (v === 'profile') setScreen({ name: 'profile' });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar view={view} setView={handleSetView} />
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {screen.name === 'dashboard' && <Dashboard setView={handleSetView} onSelectJob={goJobDetails} />}
          {screen.name === 'jobs' && <JobList onSelectJob={goJobDetails} onAddJob={goAddJob} onEditJob={goEditJob} />}
          {screen.name === 'applicants' && <AllApplicants onSelectJob={goJobDetails} />}
          {screen.name === 'profile' && <ProfilePage onSelectJob={goJobDetails} />}
          {screen.name === 'job-details' && <JobDetails jobId={screen.jobId} onBack={goJobs} onEdit={goEditJob} />}
          {screen.name === 'job-form' && <JobForm jobId={screen.jobId} onBack={screen.jobId ? goJobDetails.bind(null, screen.jobId) : goJobs} />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
