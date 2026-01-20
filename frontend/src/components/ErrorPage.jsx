import { FiRefreshCw, FiHome, FiAlertTriangle, FiWifiOff } from 'react-icons/fi';

const ErrorPage = ({ error, onRetry, type = 'general' }) => {
  const getErrorConfig = () => {
    const errorMessage = error?.message || '';
    const errorString = String(error).toLowerCase();
    
    // Network errors
    if (errorString.includes('network') || errorString.includes('fetch') || 
        errorString.includes('failed to load') || errorString.includes('econnrefused')) {
      return {
        icon: <FiWifiOff className="w-16 h-16 text-yellow-500" />,
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        suggestion: 'Try again in a few moments'
      };
    }
    
    // Authentication errors
    if (errorString.includes('401') || errorString.includes('unauthorized') ||
        errorString.includes('not authorized')) {
      return {
        icon: <FiAlertTriangle className="w-16 h-16 text-orange-500" />,
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again.',
        suggestion: 'Redirecting to login page...'
      };
    }
    
    // Rate limiting
    if (errorString.includes('429') || errorString.includes('too many')) {
      return {
        icon: <FiAlertTriangle className="w-16 h-16 text-orange-500" />,
        title: 'Too Many Requests',
        message: 'You\'ve made too many requests. Please wait a moment before trying again.',
        suggestion: 'Take a short break and come back'
      };
    }
    
    // Default error
    return {
      icon: <FiAlertTriangle className="w-16 h-16 text-red-500" />,
      title: 'Something Went Wrong',
      message: errorMessage || 'An unexpected error occurred. Our team has been notified.',
      suggestion: 'Please try again or contact support if the problem persists'
    };
  };

  const config = getErrorConfig();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          {config.icon}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {config.title}
        </h1>
        
        <p className="text-gray-600 mb-2">
          {config.message}
        </p>
        
        <p className="text-sm text-gray-400 mb-6">
          {config.suggestion}
        </p>
        
        {type === 'page' && (
          <div className="flex gap-3 justify-center">
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <FiHome className="w-4 h-4" />
              Go Home
            </a>
          </div>
        )}
        
        {type !== 'page' && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Error ID: {Date.now().toString(36).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;

