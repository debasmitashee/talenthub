import { useEffect, useRef, useState } from 'react';
import { Briefcase, Users, Clock, CheckCircle, TrendingUp, TrendingDown, ArrowUpRight, Calendar, MapPin, UserCheck, Activity } from 'lucide-react';
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

function AnimatedStat({
  value,
  label,
  icon: Icon,
  gradient,
  change,
  trend,
  delay,
}: {
  value: number;
  label: string;
  icon: typeof Briefcase;
  gradient: string;
  change: string;
  trend: 'up' | 'down';
  delay: number;
}) {
  const count = useCountUp(value, 1200, delay);

  return (
    <div
      className="bg-slate-900 rounded-2xl border border-slate-800 p-5 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1 group animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-100 mb-1 tabular-nums">{count}</div>
      <div className="text-sm text-slate-400">{label}</div>
      <div className={`text-xs mt-2 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>{change}</div>
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

  const stats = [
    { label: 'Total Jobs', value: totalJobs, icon: Briefcase, gradient: 'from-sky-500 to-blue-600', change: '+2 this month', trend: 'up' as const },
    { label: 'Active Jobs', value: activeJobs, icon: Clock, gradient: 'from-emerald-500 to-teal-600', change: `${activeJobs} live postings`, trend: 'up' as const },
    { label: 'Total Applicants', value: totalApplicants, icon: Users, gradient: 'from-orange-500 to-amber-600', change: '+12 this week', trend: 'up' as const },
    { label: 'Hired', value: hiredCount, icon: CheckCircle, gradient: 'from-purple-500 to-pink-600', change: '-1 vs last month', trend: 'down' as const },
  ];

  const recentApplicants = jobs
    .flatMap(j => j.applicants.map(a => ({ ...a, jobTitle: j.title, jobId: j.id })))
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 5);

  const topJobs = [...jobs]
    .filter(j => j.applicants.length > 0)
    .sort((a, b) => b.applicants.length - a.applicants.length)
    .slice(0, 4);

  const statusCounts: Record<ApplicantStatus, number> = { pending: 0, reviewing: 0, shortlisted: 0, rejected: 0, hired: 0 };
  jobs.forEach(j => j.applicants.forEach(a => { statusCounts[a.status]++; }));
  const maxStatus = Math.max(...Object.values(statusCounts), 1);

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
                <div key={status} className="flex items-center gap-4">
                  <div className="w-24 flex items-center gap-2 text-sm font-medium text-slate-300 shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </div>
                  <div className="flex-1 h-8 bg-slate-800 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${config.dot} rounded-lg flex items-center justify-end pr-2 transition-all duration-1000 ease-out bar-grow`}
                      style={{ width: `${pct}%`, animationDelay: `${600 + i * 100}ms` }}
                    >
                      {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                    </div>
                  </div>
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

        {/* Top jobs by applicants */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 animate-fade-up" style={{ animationDelay: '650ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-100">Most Applied Jobs</h2>
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          {topJobs.length === 0 ? (
            <div className="text-sm text-slate-500 py-8 text-center">No applicants yet.</div>
          ) : (
            <div className="space-y-3">
              {topJobs.map((job, idx) => (
                <button
                  key={job.id}
                  onClick={() => onSelectJob(job.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all duration-300 text-left group animate-slide-in-left hover:translate-x-1"
                  style={{ animationDelay: `${700 + idx * 80}ms` }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-amber-500/15 text-amber-400' : idx === 1 ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-400'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200 truncate group-hover:text-sky-400 transition-colors">{job.title}</div>
                    <div className="text-xs text-slate-500">{job.department}</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/10 rounded-lg group-hover:bg-sky-500/20 transition-colors">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs font-bold text-sky-400">{job.applicants.length}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent applicants */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 animate-fade-up" style={{ animationDelay: '800ms' }}>
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
                      className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer animate-fade-up"
                      style={{ animationDelay: `${900 + i * 80}ms` }}
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
        <div className="flex items-center justify-between mb-4 animate-fade-up" style={{ animationDelay: '1000ms' }}>
          <h2 className="text-lg font-bold text-slate-100">Recent Job Postings</h2>
          <button onClick={() => setView('jobs')} className="text-sm text-sky-400 font-medium hover:text-sky-300 flex items-center gap-1 transition-colors group">
            View all <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.slice(0, 3).map((job, i) => {
            const sc = statusConfig[job.status];
            return (
              <button
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className="text-left bg-slate-900 rounded-2xl border border-slate-800 p-5 hover:shadow-lg hover:shadow-sky-500/10 hover:border-sky-500/30 transition-all duration-300 hover:-translate-y-1 group animate-fade-up"
                style={{ animationDelay: `${1100 + i * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                  <span className="text-xs text-slate-500">{job.type}</span>
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
