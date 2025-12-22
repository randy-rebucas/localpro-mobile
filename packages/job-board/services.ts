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

  static async getApplications(filters?: Record<string, any>): Promise<(JobApplication & { job?: Job })[]> {
    // Map component status values to API status values for filtering
    const statusFilterMap: Record<string, string> = {
      'pending': 'pending',
      'reviewed': 'shortlisted', // Component uses 'reviewed', API uses 'shortlisted'
      'interview': 'interview',
      'accepted': 'hired', // Component uses 'accepted', API uses 'hired'
      'rejected': 'rejected',
    };
    
    // Transform filters if status is provided
    const apiFilters = filters ? { ...filters } : {};
    if (apiFilters.status && statusFilterMap[apiFilters.status]) {
      apiFilters.status = statusFilterMap[apiFilters.status];
    }
    
    const query = buildQueryParams(apiFilters);
    const endpoint = query
      ? `${API_ENDPOINTS.jobs.applications.myApplications}?${query}`
      : API_ENDPOINTS.jobs.applications.myApplications;
    
    const response = await apiClient.get<any>(endpoint);
    const rawApplications = coerceArray<any>(response);
    
    // Transform applications from API format
    return rawApplications.map((apiApp: any) => {
      // Transform nested job object
      const job = apiApp.job ? transformJobFromApi(apiApp.job) : undefined;
      
      // Map API status values to component status values
      const statusMap: Record<string, JobApplication['status']> = {
        'pending': 'pending',
        'shortlisted': 'reviewed',
        'interview': 'interview',
        'rejected': 'rejected',
        'hired': 'accepted',
        'accepted': 'accepted',
        'reviewed': 'reviewed',
      };
      
      return {
        id: apiApp._id || apiApp.id || '',
        jobId: apiApp.job?._id || apiApp.job?.id || apiApp.jobId || '',
        userId: apiApp.userId || apiApp.user?._id || apiApp.user?.id || apiApp.applicant?._id || apiApp.applicant?.id || '',
        status: statusMap[apiApp.status] || 'pending',
        appliedAt: apiApp.appliedAt ? new Date(apiApp.appliedAt) : new Date(),
        coverLetter: apiApp.coverLetter || '',
        resume: apiApp.resume || apiApp.resumeUrl || '',
        job: job, // Include transformed job data
      } as JobApplication & { job?: Job };
    });
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

  static async getJobApplications(jobId: string, filters?: Record<string, any>): Promise<(JobApplication & { applicant?: any })[]> {
    // Map component status values to API status values for filtering
    // API valid statuses: pending, reviewing, shortlisted, interviewed, rejected, hired
    const statusFilterMap: Record<string, string> = {
      'pending': 'pending',
      'reviewed': 'shortlisted', // Component uses 'reviewed', API uses 'shortlisted'
      'interview': 'interviewed', // Component uses 'interview', API uses 'interviewed'
      'accepted': 'hired', // Component uses 'accepted', API uses 'hired'
      'rejected': 'rejected',
    };
    
    // Transform filters if status is provided
    const apiFilters = filters ? { ...filters } : {};
    if (apiFilters.status && statusFilterMap[apiFilters.status]) {
      apiFilters.status = statusFilterMap[apiFilters.status];
    }
    
    const query = buildQueryParams(apiFilters);
    const endpoint = query
      ? `${API_ENDPOINTS.jobs.applications.getByJob(jobId)}?${query}`
      : API_ENDPOINTS.jobs.applications.getByJob(jobId);
    
    const response = await apiClient.get<any>(endpoint);
    const rawApplications = coerceArray<any>(response);
    
    // Transform applications from API format
    return rawApplications.map((apiApp: any) => {
      // Map API status values to component status values
      // API: pending, reviewing, shortlisted, interviewed, rejected, hired
      // UI: pending, reviewed, interview, accepted, rejected
      const statusMap: Record<string, JobApplication['status']> = {
        'pending': 'pending',
        'reviewing': 'reviewed', // API 'reviewing' -> UI 'reviewed'
        'shortlisted': 'reviewed', // API 'shortlisted' -> UI 'reviewed'
        'interviewed': 'interview', // API 'interviewed' -> UI 'interview'
        'rejected': 'rejected',
        'hired': 'accepted', // API 'hired' -> UI 'accepted'
        // Legacy mappings for backward compatibility
        'interview': 'interview',
        'accepted': 'accepted',
        'reviewed': 'reviewed',
      };
      
      // Transform applicant data
      let applicant: any = undefined;
      if (apiApp.applicant) {
        const apiApplicant = apiApp.applicant;
        const firstName = apiApplicant.firstName || '';
        const lastName = apiApplicant.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Applicant';
        
        // Extract avatar URL (prefer thumbnail, fallback to url)
        const avatarUrl = apiApplicant.profile?.avatar?.thumbnail || 
                         apiApplicant.profile?.avatar?.url || 
                         undefined;
        
        applicant = {
          id: apiApplicant._id || apiApplicant.id || '',
          name: fullName,
          email: apiApplicant.email || '',
          phoneNumber: apiApplicant.phoneNumber || '',
          avatar: avatarUrl,
        };
      }
      
      // Transform interview schedule (if exists)
      let interview: any = undefined;
      if (apiApp.interviewSchedule && Array.isArray(apiApp.interviewSchedule) && apiApp.interviewSchedule.length > 0) {
        const firstInterview = apiApp.interviewSchedule[0];
        interview = {
          date: firstInterview.date ? new Date(firstInterview.date) : undefined,
          time: firstInterview.time ? new Date(firstInterview.time) : undefined,
          location: firstInterview.location,
          type: firstInterview.type === 'in_person' ? 'in-person' : (firstInterview.type || 'in-person'),
          notes: firstInterview.notes,
          meetingLink: firstInterview.meetingLink || firstInterview.link,
        };
      }

      // Transform feedback (API returns { strengths: [], weaknesses: [] }, but we might need it as string)
      let feedback: string | undefined = undefined;
      if (apiApp.feedback) {
        if (typeof apiApp.feedback === 'string') {
          feedback = apiApp.feedback;
        } else if (apiApp.feedback.strengths || apiApp.feedback.weaknesses) {
          // Combine strengths and weaknesses into a readable format
          const parts: string[] = [];
          if (apiApp.feedback.strengths && apiApp.feedback.strengths.length > 0) {
            parts.push(`Strengths: ${apiApp.feedback.strengths.join(', ')}`);
          }
          if (apiApp.feedback.weaknesses && apiApp.feedback.weaknesses.length > 0) {
            parts.push(`Weaknesses: ${apiApp.feedback.weaknesses.join(', ')}`);
          }
          feedback = parts.join('\n') || undefined;
        }
      }

      return {
        id: apiApp._id || apiApp.id || '',
        jobId: jobId,
        userId: apiApp.applicant?._id || apiApp.applicant?.id || apiApp.userId || '',
        status: statusMap[apiApp.status] || 'pending',
        appliedAt: apiApp.appliedAt ? new Date(apiApp.appliedAt) : new Date(),
        coverLetter: apiApp.coverLetter || '',
        resume: apiApp.resume || apiApp.resumeUrl || '',
        applicant: applicant,
        interview: interview,
        feedback: feedback,
        expectedSalary: apiApp.expectedSalary,
        availability: apiApp.availability,
        interviewSchedule: apiApp.interviewSchedule,
      } as JobApplication & { applicant?: any; interview?: any; feedback?: string; expectedSalary?: any; availability?: any; interviewSchedule?: any[] };
    });
  }

  static async updateApplicationStatus(
    jobId: string,
    applicationId: string,
    status: JobApplication['status'],
    notes?: string,
    rating?: number,
    feedback?: string
  ): Promise<JobApplication> {
    // Map UI status values to API status values
    // UI: pending, reviewed, interview, accepted, rejected
    // API: pending, reviewing, shortlisted, interviewed, rejected, hired
    const statusMapToApi: Record<JobApplication['status'], string> = {
      'pending': 'pending',
      'reviewed': 'shortlisted', // UI 'reviewed' -> API 'shortlisted'
      'interview': 'interviewed', // UI 'interview' -> API 'interviewed'
      'accepted': 'hired', // UI 'accepted' -> API 'hired'
      'rejected': 'rejected',
    };

    const apiStatus = statusMapToApi[status] || status;

    return apiClient.put<JobApplication>(
      API_ENDPOINTS.jobs.applications.updateStatus(jobId, applicationId),
      { status: apiStatus, notes, rating, feedback }
    );
  }

  static async withdrawApplication(jobId: string, applicationId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.jobs.applications.withdraw(jobId, applicationId));
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

