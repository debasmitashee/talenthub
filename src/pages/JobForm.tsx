import { useState } from 'react';
import { ArrowLeft, Save, Briefcase, MapPin, DollarSign, FileText, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { JobStatus, JobType, JobLocation } from '@/types';

interface JobFormProps {
  jobId?: string;
  onBack: () => void;
}

const jobTypes: { value: JobType; label: string }[] = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
];

const jobLocations: { value: JobLocation; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'on-site', label: 'On-Site' },
  { value: 'hybrid', label: 'Hybrid' },
];

const jobStatuses: { value: JobStatus; label: string; bg: string; text: string }[] = [
  { value: 'draft', label: 'Draft', bg: 'bg-amber-500/15', text: 'text-amber-400' },
  { value: 'active', label: 'Active', bg: 'bg-green-500/15', text: 'text-green-400' },
  { value: 'closed', label: 'Closed', bg: 'bg-slate-700', text: 'text-slate-400' },
];

export default function JobForm({ jobId, onBack }: JobFormProps) {
  const { getJob, addJob, updateJob } = useApp();
  const existing = jobId ? getJob(jobId) : undefined;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    title: existing?.title ?? '',
    department: existing?.department ?? '',
    description: existing?.description ?? '',
    requirements: existing?.requirements ?? '',
    type: existing?.type ?? ('full-time' as JobType),
    location: existing?.location ?? ('remote' as JobLocation),
    locationName: existing?.locationName ?? '',
    salaryMin: existing?.salaryMin ?? 50000,
    salaryMax: existing?.salaryMax ?? 80000,
    status: existing?.status ?? ('draft' as JobStatus),
    deadline: existing?.deadline ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Job title is required';
    if (!form.department.trim()) e.department = 'Department is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.locationName.trim()) e.locationName = 'Location is required';
    if (form.salaryMin >= form.salaryMax) e.salary = 'Min salary must be less than max salary';
    if (!form.deadline) e.deadline = 'Deadline is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (isEdit && jobId) {
      updateJob(jobId, form);
    } else {
      addJob(form);
    }
    onBack();
  };

  const inputBase = "w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all";

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to jobs
      </button>

      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>
          <p className="text-slate-400 mt-1">{isEdit ? 'Update the details of this job posting.' : 'Fill in the details below to create a new job posting for students.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-sky-500/10 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-base font-bold text-slate-100">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Title <span className="text-red-400">*</span></label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Frontend Developer" className={`${inputBase} ${errors.title ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-700 focus:ring-sky-500'}`} />
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Department <span className="text-red-400">*</span></label>
                <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" className={`${inputBase} ${errors.department ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-700 focus:ring-sky-500'}`} />
                {errors.department && <p className="text-xs text-red-400 mt-1">{errors.department}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Description <span className="text-red-400">*</span></label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Describe the role, responsibilities, and what a typical day looks like..." className={`${inputBase} resize-none ${errors.description ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-700 focus:ring-sky-500'}`} />
                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Requirements</label>
                <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={4} placeholder="List the skills, experience, and qualifications needed..." className={`${inputBase} resize-none border-slate-700 focus:ring-sky-500`} />
              </div>
            </div>
          </div>

          {/* Job details */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-base font-bold text-slate-100">Job Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Employment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {jobTypes.map((t) => (
                    <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value })} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.type === t.value ? 'bg-sky-500/15 border-sky-500/50 text-sky-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                      {form.type === t.value && <Check className="w-4 h-4" />}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Work Location Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {jobLocations.map((l) => (
                    <button key={l.value} type="button" onClick={() => setForm({ ...form, location: l.value })} className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.location === l.value ? 'bg-sky-500/15 border-sky-500/50 text-sky-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                      {form.location === l.value && <Check className="w-4 h-4" />}
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Location Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.locationName} onChange={(e) => setForm({ ...form, locationName: e.target.value })} placeholder="e.g. San Francisco, CA or Remote (US)" className={`${inputBase} ${errors.locationName ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-700 focus:ring-sky-500'}`} />
                {errors.locationName && <p className="text-xs text-red-400 mt-1">{errors.locationName}</p>}
              </div>
            </div>
          </div>

          {/* Salary & deadline */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-base font-bold text-slate-100">Salary & Timeline</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Min Salary ($)</label>
                <input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: Number(e.target.value) })} min={0} step={1000} className={`${inputBase} border-slate-700 focus:ring-sky-500`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Max Salary ($)</label>
                <input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: Number(e.target.value) })} min={0} step={1000} className={`${inputBase} ${errors.salary ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-700 focus:ring-sky-500'}`} />
                {errors.salary && <p className="text-xs text-red-400 mt-1">{errors.salary}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Application Deadline <span className="text-red-400">*</span></label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={`${inputBase} ${errors.deadline ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-700 focus:ring-sky-500'}`} />
                {errors.deadline && <p className="text-xs text-red-400 mt-1">{errors.deadline}</p>}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-base font-bold text-slate-100">Posting Status</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {jobStatuses.map((s) => (
                <button key={s.value} type="button" onClick={() => setForm({ ...form, status: s.value })} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${form.status === s.value ? `${s.bg} ${s.text} border-current` : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                  {form.status === s.value && <Check className="w-4 h-4" />}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg shadow-sky-500/25 active:scale-[0.98]">
              <Save className="w-5 h-5" />
              {isEdit ? 'Save Changes' : 'Post Job'}
            </button>
            <button type="button" onClick={onBack} className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
