import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail, clearError } from '../features/auth/authSlice';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!token) {
      setLocalError('Invalid verification link');
    }
  }, [token]);

  useEffect(() => {
    if (isError && message) {
      setLocalError(message);
    }
    if (isSuccess) {
      // Redirect to login after 3 seconds
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isError, isSuccess, message, navigate]);

  const handleVerify = () => {
    setLocalError('');
    dispatch(clearError());
    if (token) {
      dispatch(verifyEmail(token));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="max-w-md mx-auto w-full">
        <div className="card space-y-6 text-center">
          <h2 className="text-2xl font-bold">Verify Your Email</h2>

          {isSuccess ? (
            <div className="space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p className="font-medium">Email Verified Successfully!</p>
                <p className="text-sm mt-1">{message}</p>
              </div>
              <p className="text-gray-600">
                Redirecting to login page...
              </p>
            </div>
          ) : localError ? (
            <div className="space-y-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-medium">Verification Failed</p>
                <p className="text-sm mt-1">{localError}</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">
                  Need help? Try these options:
                </p>
                <div className="flex flex-col space-y-2">
                  <Link to="/register" className="text-primary-600 hover:underline">
                    Register a new account
                  </Link>
                  <Link to="/login" className="text-primary-600 hover:underline">
                    Go to login page
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-600">
                Click the button below to verify your email address.
              </p>

              {isLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <button
                  onClick={handleVerify}
                  className="btn btn-primary w-full py-3"
                >
                  Verify Email
                </button>
              )}

              <p className="text-gray-500 text-sm">
                If the verification link expired, please register again to receive a new one.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

