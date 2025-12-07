// Application types for type safety

export type ApplicationStatus = 
  | 'PENDING'
  | 'REVIEWING'
  | 'INTERVIEW_SCHEDULED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'OFFER_EXTENDED'
  | 'WITHDRAWN';

export interface Job {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  location: string;
  salary_min?: number;
  salary_max?: number;
  job_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  description: string;
  requirements: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job: Job;
  status: ApplicationStatus;
  cover_letter?: string;
  resume?: string;
  applied_at: string;
  updated_at: string;
  notes?: string;
  interview_date?: string;
}

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  interviews: number;
  offers: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  created_at: string;
  link?: string;
}
