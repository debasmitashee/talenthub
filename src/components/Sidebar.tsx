import { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Briefcase, Users, LogOut, Menu, X, Bell, Search, ChevronDown, UserCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export type View = 'dashboard' | 'jobs' | 'applicants' | 'profile';

interface SidebarProps {
  view: View;
  setView: (v: View) => void;
}

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs' as const, label: 'Job Listings', icon: Briefcase },
  { id: 'applicants' as const, label: 'All Applicants', icon: Users },
  { id: 'profile' as const, label: 'HR Profile', icon: UserCircle },
];

export default function Sidebar({ view, setView }: SidebarProps) {
  const { currentUser, logout, jobs } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicants.length, 0);

  const handleNav = (v: View) => {
    setView(v);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900 border-b border-slate-800 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-100">TalentHub</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-300">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-full w-72 bg-slate-900 border-r border-slate-800 flex flex-col
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-11 h-11 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-100">TalentHub</span>
            <div className="text-xs text-slate-500">HR Portal</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25'
                    : 'text-slate-300 hover:bg-slate-800'}
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {item.id === 'applicants' && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {totalApplicants}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Stats card */}
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-br from-sky-500/10 to-blue-600/10 border border-sky-500/20 rounded-2xl p-4">
            <div className="text-2xl font-bold text-slate-100">{jobs.length}</div>
            <div className="text-sm text-slate-400">Total jobs posted</div>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="px-2 py-1 bg-green-500/15 text-green-400 rounded-lg font-medium">
                {jobs.filter(j => j.status === 'active').length} Active
              </span>
              <span className="px-2 py-1 bg-amber-500/15 text-amber-400 rounded-lg font-medium">
                {jobs.filter(j => j.status === 'draft').length} Draft
              </span>
            </div>
          </div>
        </div>

        {/* User — clickable to go to profile */}
        <div className="border-t border-slate-800 p-4">
          <button
            onClick={() => handleNav('profile')}
            className="w-full flex items-center gap-3 hover:bg-slate-800/50 rounded-lg p-1 -m-1 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {currentUser?.avatar}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-semibold text-slate-200 truncate">{currentUser?.name}</div>
              <div className="text-xs text-slate-500 truncate">{currentUser?.role}</div>
            </div>
          </button>
          <button onClick={logout} className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-xs font-medium">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

interface SearchResult {
  type: 'job' | 'applicant';
  id: string;
  label: string;
  sublabel: string;
  jobId: string;
}

export function TopBar({ title, subtitle, onSelectJob, onSelectApplicant }: { title: string; subtitle: string; onSelectJob?: (id: string) => void; onSelectApplicant?: (jobId: string) => void }) {
  const { currentUser, jobs } = useApp();
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results: SearchResult[] = search.trim()
    ? jobs.flatMap((j) => {
        const jobMatches = j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase());
        const jobResults = jobMatches
          ? [{ type: 'job' as const, id: j.id, label: j.title, sublabel: `${j.department} · ${j.applicants.length} applicants`, jobId: j.id }]
          : [];
        const applicantResults = j.applicants
          .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()))
          .map((a) => ({ type: 'applicant' as const, id: a.id, label: a.name, sublabel: `${a.email} · Applied for ${j.title}`, jobId: j.id }));
        return [...jobResults, ...applicantResults];
      })
    : [];

  const handleResultClick = (r: SearchResult) => {
    setShowResults(false);
    setSearch('');
    if (r.type === 'job' && onSelectJob) onSelectJob(r.jobId);
    else if (r.type === 'applicant' && onSelectApplicant) onSelectApplicant(r.jobId);
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        <p className="text-slate-400 mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {/* Search with live results */}
        <div className="relative hidden md:block" ref={searchRef}>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-sky-500 transition-all">
            <Search className="w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              placeholder="Search jobs or people..."
              className="bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none w-48"
            />
          </div>
          {showResults && search.trim() && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-500 text-center">
                  No results for "{search}"
                </div>
              ) : (
                <div className="py-1.5">
                  {results.map((r) => (
                    <button
                      key={`${r.type}-${r.id}`}
                      onClick={() => handleResultClick(r)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-slate-700">
                        {r.type === 'job'
                          ? <Briefcase className="w-4 h-4 text-sky-400" />
                          : <Users className="w-4 h-4 text-orange-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-200 truncate">{r.label}</div>
                        <div className="text-xs text-slate-500 truncate">{r.sublabel}</div>
                      </div>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-md shrink-0 ${r.type === 'job' ? 'bg-sky-500/15 text-sky-400' : 'bg-orange-500/15 text-orange-400'}`}>
                        {r.type === 'job' ? 'Job' : 'Person'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
            {currentUser?.avatar}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 hidden md:block" />
        </div>
      </div>
    </div>
  );
}
