import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
  code?: string;
}

/**
 * Format API error response for user display
 */
export function handleApiError(error: any): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status || error.status || 500;
    const data = error.response?.data as any;

    // Handle validation errors (422)
    if (status === 422) {
      return {
        message: data?.message || 'Validation failed',
        status,
        errors: data?.errors || {},
      };
    }

    // Handle specific error messages
    if (status === 401) {
      return {
        message: 'Your session has expired. Please log in again.',
        status,
      };
    }

    if (status === 403) {
      return {
        message: 'You do not have permission to access this resource.',
        status,
      };
    }

    if (status === 404) {
      return {
        message: 'Resource not found.',
        status,
      };
    }

    if (status >= 500) {
      return {
        message: 'Server error. Please try again later.',
        status,
      };
    }

    // Generic error message from API
    return {
      message: data?.message || error.message || 'An error occurred',
      status,
      code: data?.code,
    };
  }

  // Non-Axios errors
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      status: 500,
    };
  }

  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
}

/**
 * Get first error message from validation errors object
 */
export function getFirstValidationError(errors: Record<string, string[]> | undefined): string | null {
  if (!errors) return null;
  
  for (const field in errors) {
    const messages = errors[field];
    if (Array.isArray(messages) && messages.length > 0) {
      return messages[0];
    }
  }
  
  return null;
}

/**
 * Get all validation errors as a formatted string
 */
export function getValidationErrorsString(errors: Record<string, string[]> | undefined): string {
  if (!errors) return '';
  
  const messages: string[] = [];
  for (const field in errors) {
    const fieldMessages = errors[field];
    if (Array.isArray(fieldMessages)) {
      messages.push(...fieldMessages);
    }
  }
  
  return messages.join('\n');
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (error instanceof AxiosError) {
    return !error.response && error.message === 'Network Error';
  }
  return false;
}

/**
 * Check if error is a timeout
 */
export function isTimeoutError(error: any): boolean {
  if (error instanceof AxiosError) {
    return error.code === 'ECONNABORTED';
  }
  return false;
}
