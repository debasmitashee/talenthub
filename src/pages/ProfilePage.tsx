import { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Briefcase, Save, Edit2, Building2, UserCircle, Award, FileText, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TopBar } from '@/components/Sidebar';

export default function ProfilePage({ onSelectJob }: { onSelectJob: (id: string) => void }) {
  const { currentUser, updateProfile, jobs } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
    phone: currentUser?.phone ?? '',
    department: currentUser?.department ?? '',
    role: currentUser?.role ?? '',
    location: currentUser?.location ?? '',
    bio: currentUser?.bio ?? '',
  });

  if (!currentUser) return null;

  const handleSave = () => {
    const avatar = form.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    updateProfile({ ...form, avatar });
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      department: currentUser.department,
      role: currentUser.role,
      location: currentUser.location,
      bio: currentUser.bio,
    });
    setEditing(false);
  };

  const jobsPosted = jobs.length;
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicants.length, 0);
  const hiredCount = jobs.reduce((sum, j) => sum + j.applicants.filter((a) => a.status === 'hired').length, 0);

  const stats = [
    { label: 'Jobs Posted', value: jobsPosted, icon: Briefcase, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Total Applicants', value: totalApplicants, icon: UserCircle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'People Hired', value: hiredCount, icon: Award, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  const recentJobs = jobs.slice(0, 4);

  return (
    <div>
      <TopBar
        title="HR Profile"
        subtitle="Your account information and hiring activity."
        onSelectJob={onSelectJob}
        onSelectApplicant={onSelectJob}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — profile card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile header card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Banner */}
            <div className="h-24 bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600 relative">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-2 left-8 w-20 h-20 bg-white rounded-full blur-2xl" />
                <div className="absolute bottom-0 right-8 w-28 h-28 bg-cyan-300 rounded-full blur-2xl" />
              </div>
            </div>
            {/* Avatar + name */}
            <div className="px-6 pb-6 -mt-10">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold border-4 border-slate-900 shadow-xl">
                {currentUser.avatar}
              </div>
              <div className="mt-3">
                <h2 className="text-xl font-bold text-slate-100">{currentUser.name}</h2>
                <div className="text-sm text-slate-400 mt-0.5">{currentUser.role}</div>
              </div>
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 mt-5">
                {stats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="text-center p-3 bg-slate-800/50 rounded-xl">
                      <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                        <Icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                      <div className="text-lg font-bold text-slate-100">{s.value}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact info card (read mode) */}
          {!editing && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-100">Contact Information</h3>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">Email</div>
                    <div className="text-sm text-slate-200 truncate">{currentUser.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">Phone</div>
                    <div className="text-sm text-slate-200">{currentUser.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">Department</div>
                    <div className="text-sm text-slate-200">{currentUser.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">Location</div>
                    <div className="text-sm text-slate-200">{currentUser.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">Joined</div>
                    <div className="text-sm text-slate-200">{currentUser.joinDate}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit form */}
          {editing && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-100">Edit Profile</h3>
                <button onClick={handleCancel} className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Role</label>
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Department</label>
                  <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Bio</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right — bio + activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* About / Bio */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-slate-100">About</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{currentUser.bio}</p>
          </div>

          {/* Recent job activity */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-sky-500/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Recent Job Activity</h3>
              </div>
            </div>
            {recentJobs.length === 0 ? (
              <div className="text-sm text-slate-500 py-6 text-center">No jobs posted yet.</div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => {
                  const statusBg = job.status === 'active' ? 'bg-green-500/15 text-green-400' : job.status === 'draft' ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-700 text-slate-400';
                  return (
                    <button
                      key={job.id}
                      onClick={() => onSelectJob(job.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-sky-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-sky-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-200 truncate">{job.title}</div>
                        <div className="text-xs text-slate-500">{job.department} · {job.applicants.length} applicants</div>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize shrink-0 ${statusBg}`}>
                        {job.status}
                      </span>
                    </button>
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
