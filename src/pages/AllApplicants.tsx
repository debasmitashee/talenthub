import { useState, useMemo } from 'react';
import { Search, Users, Mail, Phone, Briefcase, Calendar, Filter } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TopBar } from '@/components/Sidebar';
import type { ApplicantStatus } from '@/types';

interface AllApplicantsProps {
  onSelectJob: (id: string) => void;
}

const applicantStatusConfig: Record<ApplicantStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: 'Pending', bg: 'bg-slate-700', text: 'text-slate-300', dot: 'bg-slate-500' },
  reviewing: { label: 'Reviewing', bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-500' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-500' },
  rejected: { label: 'Rejected', bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-500' },
  hired: { label: 'Hired', bg: 'bg-green-500/15', text: 'text-green-400', dot: 'bg-green-500' },
};

export default function AllApplicants({ onSelectJob }: AllApplicantsProps) {
  const { jobs } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | 'all'>('all');

  const allApplicants = useMemo(() => {
    return jobs
      .flatMap((j) => j.applicants.map((a) => ({ ...a, jobTitle: j.title, jobId: j.id, department: j.department })))
      .filter((a) => {
        const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase()) ||
          a.jobTitle.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
  }, [jobs, search, statusFilter]);

  return (
    <div>
      <TopBar title="All Applicants" subtitle="View and manage every applicant across all job postings." onSelectJob={onSelectJob} onSelectApplicant={onSelectJob} />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or job title..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl">
          <Filter className="w-5 h-5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicantStatus | 'all')}
            className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(applicantStatusConfig) as ApplicantStatus[]).map((status) => {
          const count = jobs.reduce((sum, j) => sum + j.applicants.filter(a => a.status === status).length, 0);
          const cfg = applicantStatusConfig[status];
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === status ? `${cfg.bg} ${cfg.text} ring-2 ring-current` : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'}`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
              <span className="font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {allApplicants.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-300 mb-1">No applicants found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Applicant</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Applied For</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Contact</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4 hidden xl:table-cell">Applied Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {allApplicants.map((a) => {
                  const cfg = applicantStatusConfig[a.status];
                  return (
                    <tr
                      key={a.id}
                      onClick={() => onSelectJob(a.jobId)}
                      className="border-t border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {a.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-200 truncate">{a.name}</div>
                            <div className="text-xs text-slate-500 truncate">{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-slate-300">{a.jobTitle}</div>
                            <div className="text-xs text-slate-500">{a.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400"><Mail className="w-3.5 h-3.5" />{a.email}</div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400"><Phone className="w-3.5 h-3.5" />{a.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden xl:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {a.appliedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
