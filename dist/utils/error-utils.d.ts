/**
 * Utility functions for error handling
 */
/**
 * Extract error message from unknown error type
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Check if error is an instance of a specific error class
 */
export declare function isErrorInstance<T extends Error>(error: unknown, errorClass: new (...args: unknown[]) => T): error is T;
/**
 * Create a standardized error with context
 */
export declare function createError(message: string, cause?: unknown): Error;
//# sourceMappingURL=error-utils.d.ts.map