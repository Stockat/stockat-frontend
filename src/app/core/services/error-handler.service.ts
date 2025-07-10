import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }

  /**
   * Extracts error message from various error response formats
   * @param error - The error object from HTTP requests
   * @returns A user-friendly error message
   */
  extractErrorMessage(error: any): string {
    // Check for nested error message (most common format)
    if (error?.error?.message) {
      return error.error.message;
    }

    // Check for direct error message
    if (error?.error) {
      if (typeof error.error === 'string') {
        return error.error;
      } else if (typeof error.error === 'object') {
        // Try to extract message from error object
        const errorObj = error.error;
        if (errorObj.message) {
          return errorObj.message;
        } else if (errorObj.error) {
          return errorObj.error;
        } else {
          return JSON.stringify(errorObj);
        }
      }
    }

    // Check for top-level message
    if (error?.message) {
      return error.message;
    }

    // Check for status text
    if (error?.statusText) {
      return error.statusText;
    }

    // Default fallback
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Extracts validation errors from error response
   * @param error - The error object from HTTP requests
   * @returns Array of validation error messages
   */
  extractValidationErrors(error: any): string[] {
    const errors: string[] = [];

    if (error?.error) {
      const errorObj = error.error;

      // Handle different validation error formats
      if (errorObj.errors) {
        // ASP.NET Core validation errors format
        Object.keys(errorObj.errors).forEach(key => {
          const fieldErrors = errorObj.errors[key];
          if (Array.isArray(fieldErrors)) {
            errors.push(...fieldErrors);
          } else if (typeof fieldErrors === 'string') {
            errors.push(fieldErrors);
          }
        });
      } else if (errorObj.message) {
        errors.push(errorObj.message);
      } else if (typeof errorObj === 'string') {
        errors.push(errorObj);
      }
    }

    return errors.length > 0 ? errors : ['An unexpected error occurred.'];
  }

  /**
   * Formats validation errors into a single message
   * @param error - The error object from HTTP requests
   * @returns Formatted validation error message
   */
  formatValidationErrors(error: any): string {
    const errors = this.extractValidationErrors(error);
    return errors.join('\n');
  }

  /**
   * Checks if error is a validation error
   * @param error - The error object from HTTP requests
   * @returns True if it's a validation error
   */
  isValidationError(error: any): boolean {
    return error?.status === 400 && error?.error?.errors;
  }

  /**
   * Checks if error is an authentication error
   * @param error - The error object from HTTP requests
   * @returns True if it's an authentication error
   */
  isAuthenticationError(error: any): boolean {
    return error?.status === 401 || error?.status === 403;
  }

  /**
   * Checks if error is a server error
   * @param error - The error object from HTTP requests
   * @returns True if it's a server error
   */
  isServerError(error: any): boolean {
    return error?.status >= 500;
  }
}
