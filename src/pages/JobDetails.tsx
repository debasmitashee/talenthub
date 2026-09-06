import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, Briefcase, Mail, Phone, GraduationCap, FileText, CheckCircle, XCircle, Clock, Star, UserPlus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { ApplicantStatus, JobStatus } from '@/types';

interface JobDetailsProps {
  jobId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

const statusConfig: Record<JobStatus, { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: 'bg-green-500/15', text: 'text-green-400' },
  closed: { label: 'Closed', bg: 'bg-slate-700', text: 'text-slate-400' },
  draft: { label: 'Draft', bg: 'bg-amber-500/15', text: 'text-amber-400' },
};

const applicantStatusConfig: Record<ApplicantStatus, { label: string; bg: string; text: string; dot: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', bg: 'bg-slate-700', text: 'text-slate-300', dot: 'bg-slate-500', icon: Clock },
  reviewing: { label: 'Reviewing', bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-500', icon: Clock },
  shortlisted: { label: 'Shortlisted', bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-500', icon: Star },
  rejected: { label: 'Rejected', bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-500', icon: XCircle },
  hired: { label: 'Hired', bg: 'bg-green-500/15', text: 'text-green-400', dot: 'bg-green-500', icon: CheckCircle },
};

const statusOrder: ApplicantStatus[] = ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'];

export default function JobDetails({ jobId, onBack, onEdit }: JobDetailsProps) {
  const { getJob, updateApplicantStatus, addApplicant } = useApp();
  const job = getJob(jobId);
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);
  const [showAddApplicant, setShowAddApplicant] = useState(false);
  const [newApplicant, setNewApplicant] = useState({ name: '', email: '', phone: '', experience: '', education: '' });

  if (!job) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Job not found.</p>
        <button onClick={onBack} className="mt-4 text-sky-400 font-medium">Go back</button>
      </div>
    );
  }

  const sc = statusConfig[job.status];

  const handleAddApplicant = () => {
    if (!newApplicant.name || !newApplicant.email) return;
    addApplicant(jobId, { ...newApplicant, resumeUrl: '#', coverLetter: '' });
    setNewApplicant({ name: '', email: '', phone: '', experience: '', education: '' });
    setShowAddApplicant(false);
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to jobs
      </button>

      {/* Job header card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/25 shrink-0">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-100">{job.title}</h1>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
              </div>
              <div className="text-slate-400">{job.department}</div>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-sky-400" />{job.locationName}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-sky-400" />Posted {job.postedDate || 'N/A'}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-sky-400" />Deadline {job.deadline}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-sky-400" />${(job.salaryMin / 1000).toFixed(0)}k–${(job.salaryMax / 1000).toFixed(0)}k</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(job.id)}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-colors text-sm"
            >
              Edit Job
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — job description */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Job Description</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{job.description}</p>
          </div>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Requirements</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{job.requirements}</p>
          </div>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Employment Type</span>
                <span className="font-medium text-slate-200 capitalize">{job.type.replace('-', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Work Location</span>
                <span className="font-medium text-slate-200 capitalize">{job.location.replace('-', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Salary Range</span>
                <span className="font-medium text-slate-200">${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Application Deadline</span>
                <span className="font-medium text-slate-200">{job.deadline}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — applicants */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Applicants</h2>
                  <p className="text-sm text-slate-400">{job.applicants.length} people applied</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddApplicant(!showAddApplicant)}
                className="flex items-center gap-2 px-3 py-2 bg-sky-500/10 text-sky-400 font-medium rounded-lg hover:bg-sky-500/20 transition-colors text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Add Applicant
              </button>
            </div>

            {/* Add applicant form */}
            {showAddApplicant && (
              <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <h3 className="text-sm font-bold text-slate-200 mb-3">Add New Applicant</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input type="text" value={newApplicant.name} onChange={(e) => setNewApplicant({ ...newApplicant, name: e.target.value })} placeholder="Full name" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                  <input type="email" value={newApplicant.email} onChange={(e) => setNewApplicant({ ...newApplicant, email: e.target.value })} placeholder="Email" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                  <input type="text" value={newApplicant.phone} onChange={(e) => setNewApplicant({ ...newApplicant, phone: e.target.value })} placeholder="Phone" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                  <input type="text" value={newApplicant.experience} onChange={(e) => setNewApplicant({ ...newApplicant, experience: e.target.value })} placeholder="Experience" className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <input type="text" value={newApplicant.education} onChange={(e) => setNewApplicant({ ...newApplicant, education: e.target.value })} placeholder="Education" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 mb-3" />
                <div className="flex gap-2">
                  <button onClick={handleAddApplicant} className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all">Add Applicant</button>
                  <button onClick={() => setShowAddApplicant(false)} className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {/* Status summary chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              {statusOrder.map((status) => {
                const count = job.applicants.filter(a => a.status === status).length;
                const cfg = applicantStatusConfig[status];
                return (
                  <div key={status} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                    <span className="font-bold">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Applicant list */}
            {job.applicants.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-300 mb-1">No applicants yet</h3>
                <p className="text-xs text-slate-500">When students apply, they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {job.applicants.map((applicant) => {
                  const cfg = applicantStatusConfig[applicant.status];
                  const isExpanded = selectedApplicant === applicant.id;
                  return (
                    <div key={applicant.id} className="border border-slate-800 rounded-xl overflow-hidden transition-all">
                      <button
                        onClick={() => setSelectedApplicant(isExpanded ? null : applicant.id)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {applicant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-200">{applicant.name}</div>
                          <div className="text-xs text-slate-500">{applicant.email}</div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-slate-800 pt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400"><Mail className="w-4 h-4 text-slate-500" />{applicant.email}</div>
                            <div className="flex items-center gap-2 text-sm text-slate-400"><Phone className="w-4 h-4 text-slate-500" />{applicant.phone}</div>
                            <div className="flex items-center gap-2 text-sm text-slate-400"><Briefcase className="w-4 h-4 text-slate-500" />{applicant.experience}</div>
                            <div className="flex items-center gap-2 text-sm text-slate-400"><GraduationCap className="w-4 h-4 text-slate-500" />{applicant.education}</div>
                          </div>

                          {applicant.coverLetter && (
                            <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
                                <FileText className="w-3.5 h-3.5" />
                                Cover Letter
                              </div>
                              <p className="text-sm text-slate-400 leading-relaxed">{applicant.coverLetter}</p>
                            </div>
                          )}

                          <div className="text-xs text-slate-500 mb-3">Applied on {applicant.appliedDate}</div>

                          {/* Status changer */}
                          <div>
                            <div className="text-xs font-semibold text-slate-400 mb-2">Update Status</div>
                            <div className="flex flex-wrap gap-2">
                              {statusOrder.map((status) => {
                                const sCfg = applicantStatusConfig[status];
                                const isActive = applicant.status === status;
                                return (
                                  <button
                                    key={status}
                                    onClick={() => updateApplicantStatus(job.id, applicant.id, status)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive ? `${sCfg.bg} ${sCfg.text} ring-2 ring-offset-1 ring-offset-slate-900 ring-current` : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                                    {sCfg.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
