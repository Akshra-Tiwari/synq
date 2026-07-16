export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextCursor?: string;
}

export class ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;

  constructor(
    statusCode: number,
    message: string,
    data: T,
    pagination?: PaginationMeta,
  ) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (pagination) this.pagination = pagination;
  }

  static ok<T>(message: string, data: T, pagination?: PaginationMeta) {
    return new ApiResponse(200, message, data, pagination);
  }

  static created<T>(message: string, data: T) {
    return new ApiResponse(201, message, data);
  }
}
