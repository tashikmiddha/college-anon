import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiMessageSquare, FiAlertTriangle, FiZap, FiStar, FiHelpCircle, FiCheckCircle } from 'react-icons/fi';
import { submitFeedback } from '../features/admin/adminSlice';

const FeedbackModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, feedbackMessage } = useSelector((state) => state.admin);
  const [formData, setFormData] = useState({
    type: 'suggestion',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const { type, message } = formData;

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: FiAlertTriangle, color: 'text-red-600' },
    { value: 'feature', label: 'Feature Request', icon: FiZap, color: 'text-yellow-600' },
    { value: 'suggestion', label: 'General Suggestion', icon: FiMessageSquare, color: 'text-blue-600' },
    { value: 'other', label: 'Other', icon: FiHelpCircle, color: 'text-gray-600' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await dispatch(submitFeedback({ type, message }));
    setSubmitted(true);
    setFormData({ type: 'suggestion', message: '' });
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ type: 'suggestion', message: '' });
    onClose();
  };

  if (!isOpen) return null;

  const selectedType = feedbackTypes.find(t => t.value === type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <FiMessageSquare className="mr-2" />
            Submit Feedback
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {submitted && feedbackMessage ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-6">
                Your feedback has been submitted successfully. We appreciate your input!
              </p>
              <button
                onClick={handleClose}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-gray-600 mb-4">
                Help us improve CollegeAnon by sharing your thoughts, reporting bugs, or suggesting new features.
              </p>

              {/* Feedback Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {feedbackTypes.map((feedbackType) => (
                    <button
                      key={feedbackType.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: feedbackType.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        type === feedbackType.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`flex items-center justify-center ${feedbackType.color}`}>
                        <feedbackType.icon className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">{feedbackType.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={message}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="5"
                  placeholder={
                    type === 'bug'
                      ? 'Describe the bug you encountered...'
                      : type === 'feature'
                      ? 'Describe the feature you would like to see...'
                      : 'Share your thoughts, suggestions, or feedback...'
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length}/2000 characters
                </p>
              </div>

              {/* Error Message */}
              {feedbackMessage && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {feedbackMessage}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="btn btn-primary flex items-center"
                >
                  <FiStar className="mr-1" />
                  {isLoading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Your feedback helps us make CollegeAnon better for everyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

