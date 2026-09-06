import { useState, useMemo } from 'react';
import { Plus, Search, MapPin, Users, Calendar, MoreVertical, Edit2, Trash2, Eye, Filter, Briefcase } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TopBar } from '@/components/Sidebar';
import type { JobStatus, JobType } from '@/types';

interface JobListProps {
  onSelectJob: (id: string) => void;
  onAddJob: () => void;
  onEditJob: (id: string) => void;
}

const statusConfig: Record<JobStatus, { label: string; bg: string; text: string; dot: string }> = {
  active: { label: 'Active', bg: 'bg-green-500/15', text: 'text-green-400', dot: 'bg-green-500' },
  closed: { label: 'Closed', bg: 'bg-slate-700', text: 'text-slate-400', dot: 'bg-slate-500' },
  draft: { label: 'Draft', bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-500' },
};

const typeLabels: Record<JobType, string> = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  internship: 'Internship',
  contract: 'Contract',
};

export default function JobList({ onSelectJob, onAddJob, onEditJob }: JobListProps) {
  const { jobs, deleteJob } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.department.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || j.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [jobs, search, statusFilter]);

  const handleDelete = (id: string) => {
    deleteJob(id);
    setConfirmDelete(null);
    setOpenMenu(null);
  };

  return (
    <div onClick={() => openMenu && setOpenMenu(null)}>
      <TopBar title="Job Listings" subtitle="Manage all your job postings in one place." onSelectJob={onSelectJob} onSelectApplicant={onSelectJob} />

      {/* Action bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs by title or department..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl">
            <Filter className="w-5 h-5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
              className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <button
            onClick={onAddJob}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 active:scale-[0.98] whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>
      </div>

      {/* Jobs grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-300 mb-1">No jobs found</h3>
          <p className="text-sm text-slate-500 mb-6">Try adjusting your search or filters, or post a new job.</p>
          <button
            onClick={onAddJob}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const sc = statusConfig[job.status];
            return (
              <div
                key={job.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-5 hover:shadow-lg hover:shadow-sky-500/5 hover:border-sky-500/30 transition-all hover:-translate-y-0.5 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === job.id ? null : job.id); }}
                      className="p-1.5 text-slate-500 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenu === job.id && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 py-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectJob(job.id); setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" /> View Details
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditJob(job.id); setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" /> Edit Job
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(job.id); setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <button onClick={() => onSelectJob(job.id)} className="text-left w-full">
                  <h3 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-sky-400 transition-colors">{job.title}</h3>
                  <div className="text-sm text-slate-400 mb-4">{job.department}</div>
                </button>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium">{typeLabels[job.type]}</span>
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium capitalize">{job.location}</span>
                </div>

                {/* Info row */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.locationName}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{job.postedDate || 'Not posted'}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button onClick={() => onSelectJob(job.id)} className="flex items-center gap-1.5 text-sm">
                    <div className="flex -space-x-2">
                      {job.applicants.slice(0, 3).map((a) => (
                        <div key={a.id} className="w-7 h-7 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-slate-900">
                          {a.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                      {job.applicants.length === 0 && (
                        <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-900">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-slate-300">{job.applicants.length}</span>
                    <span className="text-slate-500">applicants</span>
                  </button>
                  <span className="text-sm font-semibold text-slate-300">
                    ${(job.salaryMin / 1000).toFixed(0)}k–${(job.salaryMax / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-500/15 rounded-xl flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Delete this job?</h3>
            <p className="text-sm text-slate-400 mb-6">This will permanently remove the job and all its applicant data. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
