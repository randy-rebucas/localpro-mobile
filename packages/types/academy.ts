export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  category: string;
  price: number;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  lessons: Lesson[];
  enrolledCount: number;
  rating?: number;
  createdAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  progress: number;
  completed: boolean;
  enrolledAt: Date;
  completedAt?: Date;
}

