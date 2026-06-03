export interface ApiSuccess<T> {
  status: 'success';
  data: T;
  pagination?: Pagination;
  message?: string;
}

export interface ApiError {
  status: 'fail' | 'error';
  message: string;
  timestamp: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
