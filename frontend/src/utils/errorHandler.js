// Centralized error handling utility for scalable API calls

const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK_ERROR]: 'Unable to connect. Please check your internet connection.',
  [ERROR_TYPES.AUTH_ERROR]: 'Session expired. Please log in again.',
  [ERROR_TYPES.RATE_LIMIT_ERROR]: 'Too many requests. Please wait a moment.',
  [ERROR_TYPES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_TYPES.SERVER_ERROR]: 'Server error. Please try again later.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_TYPES.UNKNOWN_ERROR]: 'An unexpected error occurred.'
};

/**
 * Classify error type based on response
 */
export const classifyError = (error) => {
  if (!navigator.onLine) {
    return { type: ERROR_TYPES.NETWORK_ERROR, message: 'No internet connection' };
  }

  if (!error.response) {
    return { type: ERROR_TYPES.NETWORK_ERROR, message: 'Unable to reach server' };
  }

  const status = error.response.status;

  switch (status) {
    case 401:
      return { type: ERROR_TYPES.AUTH_ERROR, message: 'Unauthorized access' };
    case 403:
      return { type: ERROR_TYPES.AUTH_ERROR, message: 'Access forbidden' };
    case 429:
      return { type: ERROR_TYPES.RATE_LIMIT_ERROR, message: 'Too many requests' };
    case 400:
      return { type: ERROR_TYPES.VALIDATION_ERROR, message: error.response.data?.message || 'Invalid request' };
    case 404:
      return { type: ERROR_TYPES.NOT_FOUND, message: 'Resource not found' };
    case 500:
    case 502:
    case 503:
    case 504:
      return { type: ERROR_TYPES.SERVER_ERROR, message: 'Server temporarily unavailable' };
    default:
      return { type: ERROR_TYPES.UNKNOWN_ERROR, message: error.response.data?.message || 'Something went wrong' };
  }
};

/**
 * Parse error response to get user-friendly message
 */
export const parseErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR];
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 */
export const withRetry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorInfo = classifyError(error);

      // Don't retry on auth errors or validation errors
      if (errorInfo.type === ERROR_TYPES.AUTH_ERROR || 
          errorInfo.type === ERROR_TYPES.VALIDATION_ERROR) {
        throw error;
      }

      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);

      await sleep(delay);
    }
  }

  throw lastError;
};

/**
 * Create a fallback value for when all retries fail
 */
export const withFallback = async (fn, fallbackValue) => {
  try {
    return await fn();
  } catch (error) {
    console.error('All attempts failed, returning fallback value:', error);
    return fallbackValue;
  }
};

/**
 * Handle error and return structured response
 */
export const handleError = (error, customMessage = null) => {
  const errorInfo = classifyError(error);
  const message = customMessage || ERROR_MESSAGES[errorInfo.type] || errorInfo.message;

  console.error('Error handled:', {
    type: errorInfo.type,
    message,
    status: error.response?.status,
    data: error.response?.data
  });

  return {
    success: false,
    error: {
      type: errorInfo.type,
      message,
      originalMessage: parseErrorMessage(error),
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Format error for display to user
 */
export const formatErrorForUser = (error) => {
  const info = classifyError(error);
  return {
    title: getErrorTitle(info.type),
    message: ERROR_MESSAGES[info.type] || info.message,
    type: info.type
  };
};

const getErrorTitle = (type) => {
  switch (type) {
    case ERROR_TYPES.NETWORK_ERROR:
      return 'Connection Issue';
    case ERROR_TYPES.AUTH_ERROR:
      return 'Authentication Required';
    case ERROR_TYPES.RATE_LIMIT_ERROR:
      return 'Slow Down';
    case ERROR_TYPES.VALIDATION_ERROR:
      return 'Check Your Input';
    case ERROR_TYPES.SERVER_ERROR:
      return 'Server Error';
    case ERROR_TYPES.NOT_FOUND:
      return 'Not Found';
    default:
      return 'Oops!';
  }
};

export { ERROR_TYPES, ERROR_MESSAGES };

