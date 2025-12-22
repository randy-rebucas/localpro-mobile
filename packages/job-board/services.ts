import { apiClient } from '@localpro/api';
import { API_ENDPOINTS } from '@localpro/api/config';
import type { Job, JobApplication } from '@localpro/types';

const coerceArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  const asAny = value as any;
  // Handle { success: true, data: [...] } format
  if (asAny?.success && Array.isArray(asAny?.data)) {
    return asAny.data;
  }
  // Handle { data: [...] } format
  if (Array.isArray(asAny?.data)) {
    return asAny.data;
  }
  // Handle { results: [...] } format
  if (Array.isArray(asAny?.results)) {
    return asAny.results;
  }
  return [];
};

const buildQueryParams = (filters?: Record<string, any>) => {
  if (!filters) {
    return '';
  }

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
    } else if (typeof value === 'boolean') {
      params.append(key, value ? 'true' : 'false');
    } else {
      params.append(key, String(value));
    }
  });

  return params.toString();
};

/**
 * Transforms API job response to match the Job type definition
 */
const transformJobFromApi = (apiJob: any): Job => {
  // Convert jobType from underscore format (full_time) to hyphen format (full-time)
  const jobTypeMap: Record<string, string> = {
    'full_time': 'full-time',
    'part_time': 'part-time',
    'contract': 'contract',
    'freelance': 'freelance',
    'internship': 'internship',
    'temporary': 'temporary',
  };

  // Convert status from 'active' to 'open'
  const statusMap: Record<string, 'open' | 'closed' | 'filled'> = {
    'active': 'open',
    'closed': 'closed',
    'filled': 'filled',
    'draft': 'open', // Treat draft as open for display
  };

  // Extract company name
  const companyName = typeof apiJob.company === 'string' 
    ? apiJob.company 
    : apiJob.company?.name || 'Company';

  // Extract location from company.location or fallback
  let location = '';
  if (typeof apiJob.company === 'object' && apiJob.company?.location) {
    const companyLocation = apiJob.company.location;
    location = companyLocation.address || 
               [companyLocation.city, companyLocation.state, companyLocation.country]
                 .filter(Boolean)
                 .join(', ') ||
               'Location not specified';
  } else if (typeof apiJob.location === 'string') {
    location = apiJob.location;
  } else {
    location = 'Location not specified';
  }

  // Extract remote status
  const remote = apiJob.company?.location?.isRemote || 
                apiJob.company?.location?.remoteType === 'remote' ||
                apiJob.company?.location?.remoteType === 'hybrid' ||
                apiJob.remote || 
                false;

  // Extract category ID
  const categoryId = apiJob.category?._id || 
                     apiJob.category?.id || 
                     apiJob.categoryId;

  // Transform the job
  const transformed: Job = {
    id: apiJob._id || apiJob.id || '',
    title: apiJob.title || '',
    description: apiJob.description || '',
    company: companyName,
    location: location,
    type: jobTypeMap[apiJob.jobType] || apiJob.type || 'full-time' as any,
    salary: apiJob.salary ? {
      min: apiJob.salary.min || 0,
      max: apiJob.salary.max || 0,
      currency: apiJob.salary.currency || 'USD',
      period: apiJob.salary.period,
    } : undefined,
    experienceLevel: apiJob.experienceLevel || undefined,
    remote: remote,
    categoryId: categoryId,
    featured: apiJob.featured || false,
    nearby: apiJob.nearby || false,
    requirements: apiJob.requirements?.skills || 
                 apiJob.requirements?.other || 
                 apiJob.requirements || 
                 [],
    postedBy: apiJob.employer?._id || 
              apiJob.employer?.id || 
              apiJob.postedBy || 
              '',
    postedAt: apiJob.createdAt || 
              apiJob.postedAt || 
              new Date().toISOString(),
    expiresAt: apiJob.applicationProcess?.deadline || 
               apiJob.expiresAt || 
               undefined,
    status: statusMap[apiJob.status] || 'open',
  };

  return transformed;
};

/**
 * Transforms an array of API job responses to Job type
 */
const transformJobsFromApi = (apiJobs: any[]): Job[] => {
  return apiJobs.map(transformJobFromApi);
};

export class JobBoardService {
  static async getJobs(filters?: Record<string, any>): Promise<Job[]> {
    const query = buildQueryParams(filters);
    const endpoint = query
      ? `${API_ENDPOINTS.jobs.public.list}?${query}`
      : API_ENDPOINTS.jobs.public.list;
    const response = await apiClient.get<any>(endpoint);
    const rawJobs = coerceArray<any>(response);
    return transformJobsFromApi(rawJobs);
  }

  static async getCategories(): Promise<{ id: string; name: string }[]> {
    try {
      const endpoint = API_ENDPOINTS.jobs.public.categories;

      const response = await apiClient.get<{
        success?: boolean;
        message?: string;
        data?: Array<{
          _id: string;
          id?: string;
          name: string;
          description?: string;
          isActive?: boolean;
          displayOrder?: number;
        }>;
        pagination?: any;
      }>(endpoint);

      // Handle the response structure: { success: true, data: [...] }
      let categoriesArray: any[] = [];
      
      if (response.success && Array.isArray(response.data)) {
        categoriesArray = response.data;
      } else if (Array.isArray(response.data)) {
        categoriesArray = response.data;
      } else if (Array.isArray(response)) {
        categoriesArray = response;
      }
      
      // Map API response to expected format: _id -> id, filter active only, sort by displayOrder
      const mappedCategories = categoriesArray
        .filter((cat) => {
          // Filter out inactive categories if isActive field exists
          if (cat.isActive !== undefined && !cat.isActive) {
            return false;
          }
          // Ensure required fields exist
          return cat && (cat._id || cat.id) && cat.name;
        })
        .map((cat) => ({
          id: cat._id || cat.id || '',
          name: cat.name,
          _displayOrder: cat.displayOrder ?? 999, // Temporary field for sorting
        }))
        .sort((a, b) => a._displayOrder - b._displayOrder)
        .map(({ _displayOrder, ...cat }) => cat); // Remove displayOrder from final result

      return mappedCategories;
    } catch (error: any) {

      throw error;
    }
  }

  static async getJob(id: string): Promise<Job | null> {
    try {
      // Ensure ID is properly encoded
      const encodedId = encodeURIComponent(id);
      const response = await apiClient.get<any>(
        API_ENDPOINTS.jobs.public.getById(encodedId)
      );
      
      // Handle different response formats
      let rawJob: any;
      if (response?.success && response?.data) {
        rawJob = response.data;
      } else if (response?.data) {
        rawJob = response.data;
      } else {
        rawJob = response;
      }

      if (!rawJob) {
        return null;
      }

      return transformJobFromApi(rawJob);
    } catch (error: any) {
      // Re-throw with more context
      if (error?.code === 'VALIDATION_ERROR' || error?.status === 400) {
        throw new Error(`Invalid job ID: ${id}. ${error?.message || 'Job not found or invalid format.'}`);
      }
      throw error;
    }
  }

  static async applyForJob(
    jobId: string,
    application: {
      coverLetter: string;
      resume: string; // base64 encoded or URL
      additionalInfo?: {
        portfolio?: string;
        linkedIn?: string;
      };
    }
  ): Promise<JobApplication> {
    return apiClient.post<JobApplication>(API_ENDPOINTS.jobs.applications.apply(jobId), application);
  }

  static async getApplications(userId?: string): Promise<JobApplication[]> {
    const data = await apiClient.get<JobApplication[] | { data?: JobApplication[]; results?: JobApplication[] }>(
      API_ENDPOINTS.jobs.applications.myApplications
    );
    return coerceArray<JobApplication>(data);
  }

  static async getMyJobs(filters?: Record<string, any>): Promise<Job[]> {
    const query = buildQueryParams(filters);
    const endpoint = query
      ? `${API_ENDPOINTS.jobs.management.myJobs}?${query}`
      : API_ENDPOINTS.jobs.management.myJobs;
    const response = await apiClient.get<any>(endpoint);
    const rawJobs = coerceArray<any>(response);
    return transformJobsFromApi(rawJobs);
  }

  static async getJobApplications(jobId: string, filters?: Record<string, any>): Promise<JobApplication[]> {
    const query = buildQueryParams(filters);
    const endpoint = query
      ? `${API_ENDPOINTS.jobs.applications.getByJob(jobId)}?${query}`
      : API_ENDPOINTS.jobs.applications.getByJob(jobId);
    const data = await apiClient.get<JobApplication[]>(endpoint);
    return data;
  }

  static async updateApplicationStatus(
    jobId: string,
    applicationId: string,
    status: JobApplication['status'],
    notes?: string,
    rating?: number,
    feedback?: string
  ): Promise<JobApplication> {
    return apiClient.put<JobApplication>(
      API_ENDPOINTS.jobs.applications.updateStatus(jobId, applicationId),
      { status, notes, rating, feedback }
    );
  }

  static async searchJobs(query: string, filters?: Record<string, any>): Promise<Job[]> {
    const searchFilters = { ...filters, q: query };
    const queryParams = buildQueryParams(searchFilters);
    const endpoint = queryParams
      ? `${API_ENDPOINTS.jobs.public.search}?${queryParams}`
      : API_ENDPOINTS.jobs.public.search;
    const response = await apiClient.get<any>(endpoint);
    const rawJobs = coerceArray<any>(response);
    return transformJobsFromApi(rawJobs);
  }

  static async createJob(jobData: Partial<Job>): Promise<Job> {
    const response = await apiClient.post<any>(API_ENDPOINTS.jobs.management.create, jobData);
    
    // Handle response structure: { success: true, data: { _id: ..., ... } }
    const jobResponse = response?.data || response;
    
    // Transform the API response to Job type
    return transformJobFromApi(jobResponse);
  }

  static async updateJob(jobId: string, jobData: Partial<Job>): Promise<Job> {
    const response = await apiClient.put<any>(API_ENDPOINTS.jobs.management.update(jobId), jobData);
    
    // Handle response structure: { success: true, data: { _id: ..., ... } }
    const jobResponse = response?.data || response;
    
    // Transform the API response to Job type
    return transformJobFromApi(jobResponse);
  }

  static async deleteJob(jobId: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.jobs.management.delete(jobId));
  }

  static async uploadCompanyLogo(jobId: string, logoFile: { uri: string; type: string; name: string }): Promise<Job> {
    const formData = new FormData();
    formData.append('logo', {
      uri: logoFile.uri,
      type: logoFile.type || 'image/jpeg',
      name: logoFile.name || 'logo.jpg',
    } as any);

    return apiClient.post<Job>(API_ENDPOINTS.jobs.management.uploadLogo(jobId), formData);
  }

  static async getJobStats(jobId: string): Promise<{
    views: number;
    applications: number;
    shortlisted: number;
    interviewed: number;
    hired: number;
    rejected: number;
  }> {
    return apiClient.get(API_ENDPOINTS.jobs.statistics.getByJob(jobId));
  }
}

