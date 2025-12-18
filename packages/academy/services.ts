import type { Course, Enrollment, Lesson } from '@localpro/types';

export class AcademyService {
  static async getCourses(filters?: any): Promise<Course[]> {
    // TODO: Implement API call
    return [];
  }

  static async getCourse(id: string): Promise<Course | null> {
    // TODO: Implement API call
    return null;
  }

  static async enrollInCourse(courseId: string, userId: string): Promise<Enrollment> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }

  static async getEnrollments(userId: string): Promise<Enrollment[]> {
    // TODO: Implement API call
    return [];
  }
}

