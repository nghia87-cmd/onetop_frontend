// User Types
export type UserType = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  user_type: UserType;
  phone_number?: string;
  avatar?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  industry: string;
  company_size: string;
  location: string;
  created_at: string;
  updated_at: string;
}

// Job Types
export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type ExperienceLevel = 'INTERN' | 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD';

export interface Job {
  id: string;
  title: string;
  company: Company;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  location: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  deadline: string;
  status: JobStatus;
  is_deleted: boolean;
  deleted_at?: string;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

// Application Types
export type ApplicationStatus = 
  | 'PENDING' 
  | 'REVIEWING' 
  | 'SHORTLISTED' 
  | 'INTERVIEWED' 
  | 'OFFERED' 
  | 'REJECTED' 
  | 'WITHDRAWN';

export interface Application {
  id: string;
  job: Job;
  candidate: User;
  resume?: Resume;
  cover_letter?: string;
  cv_file?: string;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
}

// Resume Types
export interface Resume {
  id: string;
  candidate: User;
  title: string;
  pdf_file?: string;
  summary?: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
}

export interface Certification {
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date?: string;
  credential_id?: string;
}

// Chat Types
export interface Conversation {
  id: string;
  participants: User[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: User;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Notification Types
export type NotificationType = 
  | 'APPLICATION_RECEIVED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'NEW_MESSAGE'
  | 'JOB_MATCH'
  | 'INTERVIEW_SCHEDULED';

export interface Notification {
  id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}
