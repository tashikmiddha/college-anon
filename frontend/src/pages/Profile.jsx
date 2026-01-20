import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { refreshAnonId, updateProfile } from '../features/auth/authSlice';

const Profile = () => {
  const { user, isLoading, isSuccess, message } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    newPassword: '',
    confirmPassword: '',
  });

  const { displayName, newPassword, confirmPassword } = formData;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isSuccess && message) {
      // Clear success message after a delay
      setTimeout(() => {
        dispatch({ type: 'auth/clearError' });
      }, 3000);
    }
  }, [isSuccess, message, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const updateData = { displayName };
    if (newPassword) {
      updateData.password = newPassword;
    }

    dispatch(updateProfile(updateData));
  };

  const handleRefreshAnonId = () => {
    if (window.confirm('Are you sure you want to generate a new anonymous ID? Your current ID will be replaced.')) {
      dispatch(refreshAnonId());
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        <div className="card space-y-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College Email
              </label>
              <input
                type="email"
                value={user.collegeEmail}
                disabled
                className="input bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Email
              </label>
              <input
                type="email"
                value={user.email || 'Not set'}
                disabled
                className="input bg-gray-100"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Anonymous ID</p>
                <p className="text-sm text-blue-700">{user.anonId}</p>
              </div>
              <button
                onClick={handleRefreshAnonId}
                disabled={isLoading}
                className="btn btn-secondary text-sm"
              >
                Generate New ID
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Your anonymous ID is what other users see. You can regenerate it anytime.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <h2 className="text-xl font-semibold mb-4">Update Profile</h2>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={displayName}
              onChange={handleChange}
              className="input"
              placeholder="Your display name"
            />
            <p className="text-sm text-gray-500 mt-1">
              This is shown publicly instead of your anonymous ID (optional)
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-4">Change Password (optional)</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={handleChange}
                  className="input"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  className="input"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

