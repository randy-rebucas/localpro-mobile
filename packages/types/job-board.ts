export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'temporary';
  salary?: {
    min: number;
    max: number;
    currency: string;
    period?: string;
  };
  experienceLevel?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  remote?: boolean;
  categoryId?: string;
  featured?: boolean;
  nearby?: boolean;
  requirements?: string[];
  postedBy: string;
  postedAt: string;
  expiresAt?: string;
  status: 'open' | 'closed' | 'filled';
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  resume?: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
  appliedAt: Date;
}

