import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const VerifyEmailInfo = () => {
  const { message } = useSelector((state) => state.auth);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="max-w-md mx-auto w-full">
        <div className="card space-y-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold">Account Created!</h2>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">Registration Successful</p>
            <p className="text-green-700 text-sm mt-1">
              {message || 'Your account has been created successfully.'}
            </p>
          </div>

          <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 font-medium">Next Steps:</p>
            <ol className="list-decimal list-inside text-gray-600 space-y-2 text-sm">
              <li>Check your email inbox (and spam folder)</li>
              <li>Look for an email from CollegeAnon</li>
              <li>Click the verification link in the email</li>
              <li>Once verified, you can login to your account</li>
            </ol>
          </div>

          <div className="space-y-3 pt-4">
            <Link to="/login" className="btn btn-primary w-full py-3 block text-center">
              Go to Login
            </Link>
            
            <p className="text-gray-500 text-sm">
              Didn't receive the email?{' '}
              <Link to="/login" className="text-primary-600 hover:underline">
                Try logging in
              </Link>{' '}
              or check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailInfo;

