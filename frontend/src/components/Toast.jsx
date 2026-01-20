import { useEffect, useState } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <FiInfo className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`
      flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${getStyles()}
    `}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 text-sm">
        {message}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
      >
        <FiX className="w-4 h-4 opacity-60" />
      </button>
    </div>
  );
};

export default Toast;

