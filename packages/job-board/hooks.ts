import { useState, useEffect } from 'react';
import type { Job, JobApplication } from '@localpro/types';
import { JobBoardService } from './services';

export const useJobs = (filters?: any) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    JobBoardService.getJobs(filters).then((data) => {
      setJobs(data);
      setLoading(false);
    });
  }, [filters]);

  return { jobs, loading };
};

