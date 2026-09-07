import { useEffect, useRef, useState } from 'react';
import { Briefcase, Users, Clock, CheckCircle, TrendingUp, TrendingDown, ArrowUpRight, Calendar, MapPin, UserCheck, Activity, Zap, Target, BarChart3 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TopBar } from '@/components/Sidebar';
import type { View } from '@/components/Sidebar';
import type { JobStatus, ApplicantStatus } from '@/types';

interface DashboardProps {
  setView: (v: View) => void;
  onSelectJob: (id: string) => void;
}

const statusConfig: Record<JobStatus, { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: 'bg-green-500/15', text: 'text-green-400' },
  closed: { label: 'Closed', bg: 'bg-slate-700', text: 'text-slate-400' },
  draft: { label: 'Draft', bg: 'bg-amber-500/15', text: 'text-amber-400' },
};

const applicantStatusConfig: Record<ApplicantStatus, { label: string; color: string; dot: string }> = {
  pending: { label: 'Pending', color: 'text-slate-300', dot: 'bg-slate-500' },
  reviewing: { label: 'Reviewing', color: 'text-blue-400', dot: 'bg-blue-500' },
  shortlisted: { label: 'Shortlisted', color: 'text-purple-400', dot: 'bg-purple-500' },
  rejected: { label: 'Rejected', color: 'text-red-400', dot: 'bg-red-500' },
  hired: { label: 'Hired', color: 'text-green-400', dot: 'bg-green-500' },
};

// Dummy weekly applications data (Mon–Sun) for the wave chart
const weeklyData = [
  { day: 'Mon', count: 4 },
  { day: 'Tue', count: 7 },
  { day: 'Wed', count: 5 },
  { day: 'Thu', count: 9 },
  { day: 'Fri', count: 11 },
  { day: 'Sat', count: 3 },
  { day: 'Sun', count: 2 },
];

// Dummy department breakdown for the donut chart
const departmentColors: Record<string, string> = {
  Engineering: '#0ea5e9',
  Design: '#f97316',
  Marketing: '#a855f7',
  Analytics: '#22c55e',
};

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let raf: number;
    const start = performance.now() + delay;

    const tick = (now: number) => {
      const elapsed = Math.max(0, now - start);
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);

  return count;
}

// Tiny SVG sparkline for trend mini-charts
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 56;
  const h = 22;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AnimatedStat({
  value,
  label,
  icon: Icon,
  gradient,
  change,
  trend,
  delay,
  sparkData,
  sparkColor,
}: {
  value: number;
  label: string;
  icon: typeof Briefcase;
  gradient: string;
  change: string;
  trend: 'up' | 'down';
  delay: number;
  sparkData: number[];
  sparkColor: string;
}) {
  const count = useCountUp(value, 1200, delay);

  return (
    <div
      className="bg-slate-900 rounded-2xl border border-slate-800 p-5 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-500/30 transition-all duration-300 hover:-translate-y-1 group animate-fade-up relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* glow blob */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
      <div className="flex items-start justify-between mb-4 relative">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
          <Sparkline data={sparkData} color={sparkColor} />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-100 mb-1 tabular-nums">{count}</div>
      <div className="text-sm text-slate-400">{label}</div>
      <div className={`text-xs mt-2 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>{change}</div>
    </div>
  );
}

// Donut chart for department distribution
function DepartmentDonut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#1e293b" strokeWidth="14" />
          {data.map((d) => {
            const len = (d.value / total) * circ;
            const seg = (
              <circle
                key={d.label}
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth="14"
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="bar-fill"
                style={{ ['--ring-circumference' as string]: circ, ['--ring-offset' as string]: offset + len }}
              />
            );
            offset += len;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-100 tabular-nums">{total}</span>
          <span className="text-[10px] text-slate-500">total</span>
        </div>
      </div>
      <div className="space-y-2 flex-1 min-w-0">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 stagger-in" style={{ animationDelay: `${400 + i * 80}ms` }}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-slate-300 truncate flex-1">{d.label}</span>
            <span className="text-sm font-bold text-slate-200 tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ setView, onSelectJob }: DashboardProps) {
  const { jobs } = useApp();

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicants.length, 0);
  const hiredCount = jobs.reduce((sum, j) => sum + j.applicants.filter(a => a.status === 'hired').length, 0);
  const pendingCount = jobs.reduce((sum, j) => sum + j.applicants.filter(a => a.status === 'pending').length, 0);
  const shortlistedCount = jobs.reduce((sum, j) => sum + j.applicants.filter(a => a.status === 'shortlisted').length, 0);

  const stats = [
    { label: 'Total Jobs', value: totalJobs, icon: Briefcase, gradient: 'from-sky-500 to-blue-600', change: '+2 this month', trend: 'up' as const, sparkData: [3, 4, 4, 5, 6, 7, 8], sparkColor: '#0ea5e9' },
    { label: 'Active Jobs', value: activeJobs, icon: Clock, gradient: 'from-emerald-500 to-teal-600', change: `${activeJobs} live postings`, trend: 'up' as const, sparkData: [2, 3, 3, 4, 5, 5, 6], sparkColor: '#22c55e' },
    { label: 'Total Applicants', value: totalApplicants, icon: Users, gradient: 'from-orange-500 to-amber-600', change: '+12 this week', trend: 'up' as const, sparkData: [8, 10, 9, 13, 16, 14, 18], sparkColor: '#f97316' },
    { label: 'Hired', value: hiredCount, icon: CheckCircle, gradient: 'from-purple-500 to-pink-600', change: '+1 vs last month', trend: 'up' as const, sparkData: [1, 1, 2, 2, 2, 3, 3], sparkColor: '#a855f7' },
  ];

  const recentApplicants = jobs
    .flatMap(j => j.applicants.map(a => ({ ...a, jobTitle: j.title, jobId: j.id })))
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 6);

  const topJobs = [...jobs]
    .filter(j => j.applicants.length > 0)
    .sort((a, b) => b.applicants.length - a.applicants.length)
    .slice(0, 5);

  const statusCounts: Record<ApplicantStatus, number> = { pending: 0, reviewing: 0, shortlisted: 0, rejected: 0, hired: 0 };
  jobs.forEach(j => j.applicants.forEach(a => { statusCounts[a.status]++; }));
  const maxStatus = Math.max(...Object.values(statusCounts), 1);

  // Department donut data
  const deptMap: Record<string, number> = {};
  jobs.forEach(j => { deptMap[j.department] = (deptMap[j.department] ?? 0) + j.applicants.length; });
  const deptData = Object.entries(deptMap)
    .map(([label, value]) => ({ label, value, color: departmentColors[label] ?? '#64748b' }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const maxWeekly = Math.max(...weeklyData.map(d => d.count), 1);
  const totalWeekly = weeklyData.reduce((s, d) => s + d.count, 0);

  // Hiring progress ring (shortlisted / total applicants)
  const hireProgress = totalApplicants > 0 ? Math.round((hiredCount / totalApplicants) * 100) : 0;
  const ringCirc = 2 * Math.PI * 44;
  const ringOffset = ringCirc - (hireProgress / 100) * ringCirc;

  return (
    <div>
      <TopBar title="Dashboard" subtitle="Welcome back! Here's your hiring overview." onSelectJob={onSelectJob} onSelectApplicant={onSelectJob} />

      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="relative">
          <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse-ring" />
          <div className="absolute inset-0 w-2.5 h-2.5 bg-sky-400 rounded-full" />
        </div>
        <span className="text-sm text-slate-400 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-sky-400" />
          Live hiring feed — updated just now
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, i) => (
          <AnimatedStat key={stat.label} {...stat} delay={i * 120} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Applicant status distribution */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 animate-fade-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Applicant Status Overview</h2>
              <p className="text-sm text-slate-400 mt-0.5">Distribution across all job postings</p>
            </div>
            <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="space-y-4">
            {(Object.keys(statusCounts) as ApplicantStatus[]).map((status, i) => {
              const config = applicantStatusConfig[status];
              const count = statusCounts[status];
              const pct = (count / maxStatus) * 100;
              return (
                <div key={status} className="flex items-center gap-4 group">
                  <div className="w-24 flex items-center gap-2 text-sm font-medium text-slate-300 shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </div>
                  <div className="flex-1 h-8 bg-slate-800 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${config.dot} rounded-lg flex items-center justify-end pr-2 bar-fill`}
                      style={{ width: `${pct}%`, animationDelay: `${600 + i * 100}ms` }}
                    >
                      {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                    </div>
                  </div>
                  <span className="w-10 text-right text-xs text-slate-500 tabular-nums">{Math.round((count / Math.max(totalApplicants, 1)) * 100)}%</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              <span className="font-bold text-slate-100">{pendingCount}</span> applications need your review
            </div>
            <button onClick={() => setView('applicants')} className="text-sm text-sky-400 font-medium hover:text-sky-300 flex items-center gap-1 transition-colors group">
              View all <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Hiring progress ring */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 animate-fade-up flex flex-col" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-100">Hire Conversion</h2>
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="44" fill="none" stroke="url(#gradGreen)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={ringCirc}
                  strokeDashoffset={ringOffset}
                  className="bar-fill"
                  style={{ ['--ring-circumference' as string]: ringCirc, ['--ring-offset' as string]: ringOffset }}
                />
                <defs>
                  <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-100 tabular-nums">{hireProgress}%</span>
                <span className="text-[10px] text-slate-500">hired</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-slate-400">
                <span className="font-bold text-green-400">{hiredCount}</span> hired of{' '}
                <span className="font-bold text-slate-200">{totalApplicants}</span> applicants
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <span className="font-medium text-purple-400">{shortlistedCount}</span> shortlisted in pipeline
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly activity wave + Department donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly applications wave chart */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 animate-fade-up" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Applications This Week</h2>
              <p className="text-sm text-slate-400 mt-0.5">{totalWeekly} applications received in the last 7 days</p>
            </div>
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-3 h-40 mb-2">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                <div className="text-xs font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">{d.count}</div>
                <div
                  className="w-full max-w-[40px] bg-gradient-to-t from-sky-500 to-cyan-400 rounded-lg wave-bar origin-bottom hover:from-sky-400 hover:to-cyan-300 transition-colors"
                  style={{ height: `${(d.count / maxWeekly) * 100}%`, animationDelay: `${i * 120}ms`, animationDuration: '1.5s' }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-3">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex-1 text-center text-xs text-slate-500 font-medium">{d.day}</div>
            ))}
          </div>
        </div>

        {/* Department donut */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 animate-fade-up" style={{ animationDelay: '800ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-100">By Department</h2>
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <DepartmentDonut data={deptData} />
        </div>
      </div>

      {/* Top jobs by applicants */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-8 animate-fade-up" style={{ animationDelay: '900ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Most Applied Jobs</h2>
              <p className="text-sm text-slate-400 mt-0.5">Top postings ranked by applicant volume</p>
            </div>
          </div>
          <button onClick={() => setView('jobs')} className="text-sm text-sky-400 font-medium hover:text-sky-300 flex items-center gap-1 transition-colors group">
            View all <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        {topJobs.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">No applicants yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {topJobs.map((job, idx) => (
              <button
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-all duration-300 text-left group stagger-in hover:translate-x-1 hover:border-sky-500/30 border border-transparent"
                style={{ animationDelay: `${1000 + idx * 80}ms` }}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${idx === 0 ? 'bg-amber-500/15 text-amber-400' : idx === 1 ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-400'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-200 truncate group-hover:text-sky-400 transition-colors">{job.title}</div>
                  <div className="text-xs text-slate-500">{job.department}</div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/10 rounded-lg group-hover:bg-sky-500/20 transition-colors shrink-0">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-xs font-bold text-sky-400">{job.applicants.length}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recent applicants */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 animate-fade-up" style={{ animationDelay: '1100ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Recent Applicants</h2>
            <p className="text-sm text-slate-400 mt-0.5">Latest applications across all jobs</p>
          </div>
          <button onClick={() => setView('applicants')} className="text-sm text-sky-400 font-medium hover:text-sky-300 flex items-center gap-1 transition-colors group">
            View all <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        {recentApplicants.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">No applicants yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 px-2">Applicant</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 px-2 hidden md:table-cell">Position</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 px-2 hidden lg:table-cell">Applied</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplicants.map((a, i) => {
                  const config = applicantStatusConfig[a.status];
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer stagger-in"
                      style={{ animationDelay: `${1200 + i * 70}ms` }}
                      onClick={() => onSelectJob(a.jobId)}
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {a.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-200">{a.name}</div>
                            <div className="text-xs text-slate-500">{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <div className="text-sm text-slate-300">{a.jobTitle}</div>
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell">
                        <div className="text-sm text-slate-400">{a.appliedDate}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.color} bg-slate-800`}>
                          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent jobs quick view */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 animate-fade-up" style={{ animationDelay: '1400ms' }}>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-slate-100">Recent Job Postings</h2>
          </div>
          <button onClick={() => setView('jobs')} className="text-sm text-sky-400 font-medium hover:text-sky-300 flex items-center gap-1 transition-colors group">
            View all <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.slice(0, 6).map((job, i) => {
            const sc = statusConfig[job.status];
            return (
              <button
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className="text-left bg-slate-900 rounded-2xl border border-slate-800 p-5 hover:shadow-lg hover:shadow-sky-500/10 hover:border-sky-500/30 transition-all duration-300 hover:-translate-y-1 group stagger-in"
                style={{ animationDelay: `${1500 + i * 90}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                  <span className="text-xs text-slate-500 capitalize">{job.type.replace('-', ' ')}</span>
                </div>
                <h3 className="font-bold text-slate-100 mb-1 group-hover:text-sky-400 transition-colors">{job.title}</h3>
                <div className="text-sm text-slate-400 mb-3">{job.department}</div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.locationName}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{job.postedDate || 'Draft'}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-slate-200">{job.applicants.length}</span> applicants
                  </div>
                  <span className="text-sm font-semibold text-slate-300">
                    ${(job.salaryMin / 1000).toFixed(0)}k–${(job.salaryMax / 1000).toFixed(0)}k
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
