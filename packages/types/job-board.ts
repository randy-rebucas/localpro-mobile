export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  postedBy: string;
  postedAt: Date;
  expiresAt?: Date;
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

