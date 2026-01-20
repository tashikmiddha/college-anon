import { FiLoader } from 'react-icons/fi';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <FiLoader className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && (
        <p className="text-gray-500 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;

