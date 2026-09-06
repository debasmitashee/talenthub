export type JobStatus = 'active' | 'closed' | 'draft';
export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract';
export type JobLocation = 'remote' | 'on-site' | 'hybrid';
export type ApplicantStatus = 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedDate: string;
  status: ApplicantStatus;
  experience: string;
  education: string;
  resumeUrl: string;
  coverLetter: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  type: JobType;
  location: JobLocation;
  locationName: string;
  salaryMin: number;
  salaryMax: number;
  status: JobStatus;
  postedDate: string;
  deadline: string;
  applicants: Applicant[];
}

export interface HRUser {
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone: string;
  department: string;
  bio: string;
  joinDate: string;
  location: string;
}
