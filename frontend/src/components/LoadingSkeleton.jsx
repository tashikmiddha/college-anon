const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const shimmer = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full ${shimmer}`} />
              <div className="flex-1">
                <div className={`h-4 w-32 rounded ${shimmer} mb-2`} />
                <div className={`h-3 w-24 rounded ${shimmer}`} />
              </div>
            </div>
            <div className={`h-4 w-full rounded ${shimmer} mb-2`} />
            <div className={`h-4 w-3/4 rounded ${shimmer} mb-4`} />
            <div className={`h-32 w-full rounded-lg ${shimmer}`} />
            <div className="flex gap-2 mt-4">
              <div className={`h-8 w-20 rounded ${shimmer}`} />
              <div className={`h-8 w-20 rounded ${shimmer}`} />
            </div>
          </div>
        );

      case 'post':
        return (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full ${shimmer}`} />
              <div>
                <div className={`h-4 w-28 rounded ${shimmer} mb-1`} />
                <div className={`h-3 w-20 rounded ${shimmer}`} />
              </div>
            </div>
            <div className={`h-6 w-3/4 rounded ${shimmer} mb-3`} />
            <div className={`h-4 w-full rounded ${shimmer} mb-2`} />
            <div className={`h-4 w-5/6 rounded ${shimmer} mb-2`} />
            <div className={`h-4 w-4/5 rounded ${shimmer} mb-4`} />
            <div className={`h-48 w-full rounded-lg ${shimmer}`} />
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 flex gap-4">
                <div className={`w-16 h-16 rounded-lg ${shimmer}`} />
                <div className="flex-1">
                  <div className={`h-5 w-2/3 rounded ${shimmer} mb-2`} />
                  <div className={`h-4 w-full rounded ${shimmer} mb-1`} />
                  <div className={`h-4 w-1/2 rounded ${shimmer}`} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'profile':
        return (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 ${shimmer}`} />
            <div className={`h-6 w-48 mx-auto rounded ${shimmer} mb-2`} />
            <div className={`h-4 w-32 mx-auto rounded ${shimmer}`} />
            <div className={`h-32 w-full rounded-lg ${shimmer} mt-6`} />
          </div>
        );

      default:
        return (
          <div className={`h-32 w-full rounded-lg ${shimmer}`} />
        );
    }
  };

  return <>{renderSkeleton()}</>;
};

export default LoadingSkeleton;

