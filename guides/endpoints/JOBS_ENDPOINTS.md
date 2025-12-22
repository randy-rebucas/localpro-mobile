# Jobs API Endpoints

## Overview

The Jobs feature enables job posting, application management, and job search functionality for employers and job seekers. This API provides endpoints for creating job postings, searching jobs, managing applications, and tracking job statistics.

**Base Path:** `/api/jobs`

---

## 📋 Table of Contents

1. [Public Endpoints](#public-endpoints)
2. [Job Management Endpoints](#job-management-endpoints)
3. [Application Endpoints](#application-endpoints)
4. [Statistics Endpoints](#statistics-endpoints)
5. [Request/Response Examples](#requestresponse-examples)

---

## 🌐 Public Endpoints

### 1. Get Job Categories

Retrieves all available job categories.

**Endpoint:** `GET /api/jobs/categories`  
**Access:** Public  
**Authentication:** Not Required

#### Response (Success - 200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "name": "Construction",
      "description": "Construction and building trades",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "message": "Job categories retrieved successfully"
}
```

---

### 2. Get All Jobs

Retrieves a paginated list of all active jobs with optional filtering and sorting.

**Endpoint:** `GET /api/jobs`  
**Access:** Public  
**Authentication:** Not Required

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | Number | No | Page number (default: 1) |
| `limit` | Number | No | Items per page (default: 10, max: 100) |
| `search` | String | No | Text search query |
| `category` | String | No | Category ID or name |
| `subcategory` | String | No | Subcategory filter |
| `jobType` | String | No | Job type: `full_time`, `part_time`, `contract`, `internship`, `temporary` |
| `experienceLevel` | String | No | Experience level: `entry`, `mid`, `senior`, `executive` |
| `location` | String | No | Location search (city, state, or country) |
| `isRemote` | Boolean | No | Filter remote jobs (`true`/`false`) |
| `minSalary` | Number | No | Minimum salary filter |
| `maxSalary` | Number | No | Maximum salary filter |
| `company` | String | No | Company name filter |
| `sortBy` | String | No | Sort field (default: `createdAt`) |
| `sortOrder` | String | No | Sort order: `asc` or `desc` (default: `desc`) |
| `featured` | Boolean | No | Filter featured jobs (`true`/`false`) |

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 25,
  "total": 150,
  "page": 1,
  "pages": 15,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "title": "Senior Plumber",
      "description": "Experienced plumber needed...",
      "company": {
        "name": "ABC Plumbing Services",
        "location": {
          "city": "Manila",
          "state": "Metro Manila",
          "country": "Philippines"
        }
      },
      "category": "65a1b2c3d4e5f6789012345",
      "jobType": "full_time",
      "experienceLevel": "senior",
      "salary": {
        "min": 30000,
        "max": 40000,
        "currency": "PHP",
        "period": "monthly"
      },
      "status": "active",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "message": "Jobs retrieved successfully"
}
```

---

### 3. Search Jobs

Full-text search wrapper for jobs with the same query parameters as Get All Jobs.

**Endpoint:** `GET /api/jobs/search`  
**Access:** Public  
**Authentication:** Not Required

#### Query Parameters

Same as [Get All Jobs](#2-get-all-jobs) query parameters.

#### Response (Success - 200)

Same format as [Get All Jobs](#2-get-all-jobs) response.

---

### 4. Get Job Details

Retrieves detailed information about a specific job.

**Endpoint:** `GET /api/jobs/:id`  
**Access:** Public  
**Authentication:** Not Required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Job ID (MongoDB ObjectId) |

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345",
    "title": "Senior Plumber",
    "description": "Experienced plumber needed for residential and commercial projects...",
    "company": {
      "name": "ABC Plumbing Services",
      "website": "https://abcplumbing.com",
      "size": "medium",
      "industry": "Construction",
      "location": {
        "address": "123 Main Street, Manila, Metro Manila 1000",
        "city": "Manila",
        "state": "Metro Manila",
        "country": "Philippines",
        "coordinates": {
          "lat": 14.5995,
          "lng": 120.9842
        },
        "isRemote": false
      },
      "logo": "https://res.cloudinary.com/..."
    },
    "category": {
      "_id": "65a1b2c3d4e5f6789012345",
      "name": "Construction"
    },
    "subcategory": "Plumbing",
    "jobType": "full_time",
    "experienceLevel": "senior",
    "salary": {
      "min": 30000,
      "max": 40000,
      "currency": "PHP",
      "period": "monthly",
      "isNegotiable": true
    },
    "benefits": ["health_insurance", "paid_time_off"],
    "requirements": {
      "skills": ["Pipe installation", "Leak repair"],
      "education": {
        "level": "high_school",
        "field": "Plumbing"
      },
      "experience": {
        "years": 5
      }
    },
    "responsibilities": ["Install and repair plumbing systems"],
    "applicationProcess": {
      "deadline": "2024-12-31T23:59:59.000Z",
      "startDate": "2025-01-15T00:00:00.000Z"
    },
    "status": "active",
    "views": 150,
    "applicationsCount": 12,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Job retrieved successfully"
}
```

#### Response (Error - 404)

```json
{
  "success": false,
  "message": "Job not found"
}
```

---

## 🔐 Job Management Endpoints

### 5. Create Job Posting

Creates a new job posting. The `employer` field is automatically set from the authenticated user.

**Endpoint:** `POST /api/jobs`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required  
**Required Roles:** `provider`, `admin`

#### Request Body

```json
{
  "title": "Senior Plumber",
  "description": "Experienced plumber needed for residential and commercial projects. Must have valid license and 5+ years of experience.",
  "company": {
    "name": "ABC Plumbing Services",
    "website": "https://abcplumbing.com",
    "size": "medium",
    "industry": "Construction",
    "location": {
      "address": "123 Main Street, Manila, Metro Manila 1000",
      "city": "Manila",
      "state": "Metro Manila",
      "country": "Philippines",
      "coordinates": {
        "lat": 14.5995,
        "lng": 120.9842
      },
      "isRemote": false,
      "remoteType": "on_site"
    }
  },
  "category": "65a1b2c3d4e5f6789012345",
  "subcategory": "Plumbing",
  "jobType": "full_time",
  "experienceLevel": "senior",
  "salary": {
    "min": 30000,
    "max": 40000,
    "currency": "PHP",
    "period": "monthly",
    "isNegotiable": true,
    "isConfidential": false
  },
  "benefits": [
    "health_insurance",
    "paid_time_off",
    "sick_leave"
  ],
  "requirements": {
    "skills": ["Pipe installation", "Leak repair"],
    "education": {
      "level": "high_school",
      "field": "Plumbing",
      "isRequired": true
    },
    "experience": {
      "years": 5,
      "description": "Minimum 5 years of professional plumbing experience"
    },
    "certifications": ["Licensed Plumber"],
    "languages": [
      {
        "language": "English",
        "proficiency": "intermediate"
      }
    ]
  },
  "responsibilities": [
    "Install and repair plumbing systems",
    "Diagnose plumbing issues"
  ],
  "qualifications": [
    "Strong problem-solving skills",
    "Physical fitness for manual work"
  ],
  "applicationProcess": {
    "deadline": "2024-12-31T23:59:59.000Z",
    "startDate": "2025-01-15T00:00:00.000Z",
    "applicationMethod": "platform",
    "contactEmail": "hr@abcplumbing.com",
    "contactPhone": "+639171234567",
    "instructions": "Please submit your resume and cover letter."
  },
  "status": "draft",
  "visibility": "public",
  "tags": ["plumbing", "construction", "full-time"]
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | String | Yes | Job title |
| `description` | String | Yes | Job description |
| `company.name` | String | Yes | Company name |
| `category` | String | Yes | Category ID or name |
| `subcategory` | String | No | Subcategory |
| `jobType` | String | Yes | Job type: `full_time`, `part_time`, `contract`, `internship`, `temporary` |
| `experienceLevel` | String | Yes | Experience level: `entry`, `mid`, `senior`, `executive` |

#### Response (Success - 201)

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345",
    "title": "Senior Plumber",
    "description": "Experienced plumber needed...",
    "employer": "64f1a2b3c4d5e6f7g8h9i0j1",
    "status": "draft",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Job created successfully"
}
```

#### Response (Error - 400)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required",
      "code": "REQUIRED_FIELD"
    }
  ]
}
```

#### Response (Error - 403)

```json
{
  "success": false,
  "message": "Access denied. Provider or admin role required."
}
```

---

### 6. Update Job Posting

Updates an existing job posting. Only the job owner (employer) or admin can update.

**Endpoint:** `PUT /api/jobs/:id`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required  
**Required Roles:** `provider`, `admin`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Job ID (MongoDB ObjectId) |

#### Request Body

Same structure as [Create Job Posting](#5-create-job-posting). All fields are optional - only provided fields will be updated.

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012345",
    "title": "Senior Plumber - Updated",
    "updatedAt": "2024-01-16T10:00:00.000Z"
  },
  "message": "Job updated successfully"
}
```

#### Response (Error - 404)

```json
{
  "success": false,
  "message": "Job not found"
}
```

---

### 7. Delete Job Posting

Deletes a job posting. Only the job owner (employer) or admin can delete.

**Endpoint:** `DELETE /api/jobs/:id`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required  
**Required Roles:** `provider`, `admin`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Job ID (MongoDB ObjectId) |

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

#### Response (Error - 404)

```json
{
  "success": false,
  "message": "Job not found"
}
```

---

### 8. Upload Company Logo

Uploads a company logo for a job posting.

**Endpoint:** `POST /api/jobs/:id/logo`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required  
**Required Roles:** `provider`, `admin`  
**Content-Type:** `multipart/form-data`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Job ID (MongoDB ObjectId) |

#### Request Body (Form Data)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `logo` | File | Yes | Image file (JPEG or PNG, max 2MB) |

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "logo": "https://res.cloudinary.com/example/image/upload/v1234567890/logo.jpg",
    "logoPublicId": "jobs/logo_abc123"
  },
  "message": "Company logo uploaded successfully"
}
```

#### Response (Error - 400)

```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG and PNG images are allowed."
}
```

---

### 9. Get My Jobs

Retrieves all job postings created by the authenticated employer.

**Endpoint:** `GET /api/jobs/my-jobs`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required  
**Required Roles:** `provider`, `admin`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | Number | No | Page number (default: 1) |
| `limit` | Number | No | Items per page (default: 10, max: 100) |
| `status` | String | No | Filter by status: `draft`, `active`, `featured`, `closed`, `expired` |

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "title": "Senior Plumber",
      "status": "active",
      "views": 150,
      "applicationsCount": 12,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "message": "Jobs retrieved successfully"
}
```

---

## 📝 Application Endpoints

### 10. Apply for Job

Submits a job application for a specific job posting.

**Endpoint:** `POST /api/jobs/:id/apply`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required  
**Content-Type:** `multipart/form-data`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Job ID (MongoDB ObjectId) |

#### Request Body (Form Data)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `coverLetter` | String | No | Cover letter text |
| `resume` | File | No | Resume file (PDF, DOC, or DOCX, max 10MB) |
| `portfolioUrl` | String | No | Portfolio website URL |
| `linkedInUrl` | String | No | LinkedIn profile URL |
| `additionalInfo` | String | No | Additional information |

#### Response (Success - 201)

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012346",
    "job": "65a1b2c3d4e5f6789012345",
    "applicant": "64f1a2b3c4d5e6f7g8h9i0j2",
    "status": "pending",
    "coverLetter": "I am interested in this position...",
    "resume": "https://res.cloudinary.com/.../resume.pdf",
    "appliedAt": "2024-01-16T10:00:00.000Z"
  },
  "message": "Application submitted successfully"
}
```

#### Response (Error - 400)

```json
{
  "success": false,
  "message": "You have already applied for this job"
}
```

---

### 11. Get My Applications

Retrieves all job applications submitted by the authenticated user.

**Endpoint:** `GET /api/jobs/my-applications`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | Number | No | Page number (default: 1) |
| `limit` | Number | No | Items per page (default: 10, max: 100) |
| `status` | String | No | Filter by status: `pending`, `shortlisted`, `interview`, `rejected`, `hired` |

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012346",
      "job": {
        "_id": "65a1b2c3d4e5f6789012345",
        "title": "Senior Plumber",
        "company": {
          "name": "ABC Plumbing Services"
        }
      },
      "status": "pending",
      "appliedAt": "2024-01-16T10:00:00.000Z",
      "updatedAt": "2024-01-16T10:00:00.000Z"
    }
  ],
  "message": "Applications retrieved successfully"
}
```

---

### 12. Get Job Applications

Retrieves all applications for a specific job posting. Only the job owner (employer) or admin can access.

**Endpoint:** `GET /api/jobs/:id/applications`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required  
**Required Roles:** `provider`, `admin`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Job ID (MongoDB ObjectId) |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | Number | No | Page number (default: 1) |
| `limit` | Number | No | Items per page (default: 10, max: 100) |
| `status` | String | No | Filter by status: `pending`, `shortlisted`, `interview`, `rejected`, `hired` |

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 12,
  "total": 12,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012346",
      "applicant": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "+639171234567"
      },
      "status": "pending",
      "coverLetter": "I am interested in this position...",
      "resume": "https://res.cloudinary.com/.../resume.pdf",
      "appliedAt": "2024-01-16T10:00:00.000Z"
    }
  ],
  "message": "Applications retrieved successfully"
}
```

---

### 13. Update Application Status

Updates the status of a job application. Only the job owner (employer) or admin can update.

**Endpoint:** `PUT /api/jobs/:id/applications/:applicationId/status`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required  
**Required Roles:** `provider`, `admin`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Job ID (MongoDB ObjectId) |
| `applicationId` | String | Yes | Application ID (MongoDB ObjectId) |

#### Request Body

```json
{
  "status": "shortlisted",
  "notes": "Candidate meets all requirements and has relevant experience.",
  "rating": 4.5,
  "feedback": "Strong candidate with excellent qualifications."
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | String | Yes | New status: `pending`, `shortlisted`, `interview`, `rejected`, `hired` |
| `notes` | String | No | Internal notes about the application |
| `rating` | Number | No | Rating (1-5) |
| `feedback` | String | No | Feedback for the applicant |

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789012346",
    "status": "shortlisted",
    "notes": "Candidate meets all requirements...",
    "rating": 4.5,
    "updatedAt": "2024-01-17T10:00:00.000Z"
  },
  "message": "Application status updated successfully"
}
```

#### Response (Error - 400)

```json
{
  "success": false,
  "message": "Invalid status. Must be one of: pending, shortlisted, interview, rejected, hired"
}
```

---

## 📊 Statistics Endpoints

### 14. Get Job Statistics

Retrieves statistics for a specific job posting. Only the job owner (employer) or admin can access.

**Endpoint:** `GET /api/jobs/:id/stats`  
**Access:** Private (Authenticated)  
**Authentication:** Bearer Token Required  
**Required Roles:** `provider`, `admin`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Job ID (MongoDB ObjectId) |

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "jobId": "65a1b2c3d4e5f6789012345",
    "title": "Senior Plumber",
    "views": {
      "total": 150,
      "unique": 120
    },
    "applications": {
      "total": 12,
      "byStatus": {
        "pending": 5,
        "shortlisted": 3,
        "interview": 2,
        "rejected": 1,
        "hired": 1
      }
    },
    "shares": 8,
    "saves": 15,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "lastUpdated": "2024-01-17T10:00:00.000Z"
  },
  "message": "Job statistics retrieved successfully"
}
```

---

## 📚 Request/Response Examples

### Complete Job Creation Example

```http
POST /api/jobs
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Senior Plumber",
  "description": "Experienced plumber needed for residential and commercial projects. Must have valid license and 5+ years of experience.",
  "company": {
    "name": "ABC Plumbing Services",
    "website": "https://abcplumbing.com",
    "size": "medium",
    "industry": "Construction",
    "location": {
      "address": "123 Main Street, Manila, Metro Manila 1000",
      "city": "Manila",
      "state": "Metro Manila",
      "country": "Philippines",
      "coordinates": {
        "lat": 14.5995,
        "lng": 120.9842
      },
      "isRemote": false,
      "remoteType": "on_site"
    }
  },
  "category": "65a1b2c3d4e5f6789012345",
  "subcategory": "Plumbing",
  "jobType": "full_time",
  "experienceLevel": "senior",
  "salary": {
    "min": 30000,
    "max": 40000,
    "currency": "PHP",
    "period": "monthly",
    "isNegotiable": true
  },
  "benefits": [
    "health_insurance",
    "paid_time_off",
    "sick_leave"
  ],
  "requirements": {
    "skills": ["Pipe installation", "Leak repair"],
    "education": {
      "level": "high_school",
      "field": "Plumbing"
    },
    "experience": {
      "years": 5
    }
  },
  "responsibilities": [
    "Install and repair plumbing systems",
    "Diagnose plumbing issues"
  ],
  "applicationProcess": {
    "deadline": "2024-12-31T23:59:59.000Z",
    "startDate": "2025-01-15T00:00:00.000Z"
  },
  "status": "draft",
  "tags": ["plumbing", "construction"]
}
```

### Job Application Example

```http
POST /api/jobs/65a1b2c3d4e5f6789012345/apply
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

coverLetter: I am very interested in this Senior Plumber position...
resume: <file: resume.pdf>
portfolioUrl: https://johndoe-portfolio.com
linkedInUrl: https://linkedin.com/in/johndoe
```

---

## 🔄 Application Status Flow

The application status follows this workflow:

- `pending` → Initial status when application is submitted
- `shortlisted` → Candidate has been shortlisted for review
- `interview` → Candidate is scheduled for interview
- `hired` → Candidate has been hired
- `rejected` → Application has been rejected (can occur at any stage)

---

## ⚠️ Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required",
      "code": "REQUIRED_FIELD"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied. Provider or admin role required."
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Job not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📝 Notes

- **File Upload Limits:**
  - Company Logo: Max 2MB, JPEG or PNG only
  - Resume: Max 10MB, PDF, DOC, or DOCX formats

- **Pagination:**
  - Default page size: 10 items
  - Maximum page size: 100 items
  - Page numbers start at 1

- **Authentication:**
  - All authenticated endpoints require `Authorization: Bearer <token>` header
  - Token can be obtained from the authentication endpoints

- **Role Requirements:**
  - Job management endpoints require `provider` or `admin` role
  - Application endpoints are available to all authenticated users
  - Public endpoints require no authentication

- **Category Resolution:**
  - Categories can be specified by ID (ObjectId) or name
  - Category names are case-insensitive and support normalization (e.g., "customer_service" → "Customer Service")

