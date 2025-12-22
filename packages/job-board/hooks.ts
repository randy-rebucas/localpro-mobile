import { useEffect, useMemo, useState } from 'react';
import type { Job } from '@localpro/types';
import { JobBoardService } from './services';

export const useJobs = (filters?: Record<string, any>) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = useMemo(() => JSON.stringify(filters || {}), [filters]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    JobBoardService.getJobs(filters)
      .then((data) => {
        if (!isMounted) return;
        setJobs(data);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err?.message || 'Unable to load jobs');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filterKey]);

  return { jobs, loading, error };
};

