export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  skillsFutureCredits: number;
  creditExpiryDate?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notificationSettings: {
    creditExpiry: boolean;
    courseReminders: boolean;
    newCourses: boolean;
  };
  defaultFilters: {
    maxPrice?: number;
    preferredProviders?: string[];
    skillAreas?: string[];
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  providerId: string;
  category: string;
  skillArea: string;
  duration: number;
  priceBeforeSubsidy: number;
  priceAfterSubsidy: number;
  subsidyPercentage: number;
  availableSeats: number;
  totalSeats: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  frequency: 'weekday' | 'weekend' | 'evening' | 'full-time' | 'part-time';
  mode: 'online' | 'in-person' | 'hybrid';
  location?: string;
  prerequisites?: string[];
  learningOutcomes: string[];
  sourceUrl: string;
  lastUpdated: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  courseId?: string;
  providerId?: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
}

export interface SavedCourse {
  id: string;
  courseId: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  course: {
    title: string;
    provider: string;
    priceAfterSubsidy: number;
    startDate: string;
    registrationDeadline: string;
  };
}

export interface CourseAlert {
  id: string;
  courseId: string;
  alertType: 'registration_deadline' | 'seats_available' | 'price_drop';
  isActive: boolean;
  triggeredAt?: string;
  createdAt: string;
  course: {
    title: string;
    provider: string;
    registrationDeadline: string;
    startDate: string;
  };
}

export interface SearchFilters {
  query?: string;
  category?: string;
  skillArea?: string;
  provider?: string;
  maxPrice?: number;
  minPrice?: number;
  startDate?: string;
  endDate?: string;
  frequency?: string[];
  mode?: string[];
  location?: string;
  availableSeats?: boolean;
  sortBy?: 'price' | 'rating' | 'startDate' | 'popularity' | 'subsidyPercentage';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  skillsFutureCredits?: number;
  creditExpiryDate?: string;
}