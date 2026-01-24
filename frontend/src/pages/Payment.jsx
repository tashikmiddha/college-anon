import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiCheck, FiStar, FiImage, FiAward, FiClock, FiMail, FiCheckCircle } from 'react-icons/fi';
import qrCodeImage from '../assets/qr-code.jpeg';
import { paymentAPI } from '../features/auth/authAPI';

const Payment = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Premium Plans Data
  const premiumPlans = [
    {
      id: 'basic',
      name: 'BASIC',
      price: '₹49',
      color: 'green',
      icon: FiStar,
      features: ['Image uploads: 3', 'Competitions: 1', 'Validity: Lifetime']
    },
    {
      id: 'advance',
      name: 'ADVANCE',
      price: '₹149',
      color: 'blue',
      icon: FiClock,
      features: ['Image uploads: 10', 'Competitions: 5', 'Premium badge']
    },
    {
      id: 'elite',
      name: 'ELITE',
      price: '₹299',
      color: 'purple',
      icon: FiAward,
      features: ['Image uploads: Unlimited', 'Competitions: Unlimited', 'Featured placement']
    }
  ];

  const selectedPlan = premiumPlans.find(p => p.id === planId) || premiumPlans[1];

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please upload your payment screenshot');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await paymentAPI.submitPayment({
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price,
        screenshot: selectedFile
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const Icon = selectedPlan.icon;
  const isGreen = selectedPlan.color === 'green';
  const isBlue = selectedPlan.color === 'blue';
  const isPurple = selectedPlan.color === 'purple';

  // Success State
  if (submitted) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Your payment screenshot has been sent to the admin. You will receive your premium access within 24 hours after verification.
          </p>
          <div className="card p-6 bg-gray-50 mb-6">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ol className="text-left text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                Admin has received your payment screenshot
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs">2</span>
                Admin will verify the payment
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs">3</span>
                You'll receive a notification when premium is activated
              </li>
            </ol>
          </div>
          <div className="flex gap-4 justify-center">
            <Link to="/" className="btn btn-primary">
              Go to Home
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              View Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Selected Plan: <span className="font-semibold">{selectedPlan.name}</span></p>
        </div>

        {/* Selected Plan Summary */}
        <div className={`card p-6 mb-8 ${
          isGreen ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' :
          isBlue ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' :
          'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isGreen ? 'bg-green-500' : isBlue ? 'bg-blue-500' : 'bg-purple-500'
              }`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedPlan.name} Plan</h2>
                <p className="text-gray-600">{selectedPlan.features.join(' • ')}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold">{selectedPlan.price}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Details */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-6">Payment Details</h3>
            
            {/* QR Code */}
            <div className="text-center mb-6">
              <div className="bg-white p-4 rounded-lg inline-block shadow-sm border mb-4">
                <img 
                  src={qrCodeImage} 
                  alt="UPI QR Code" 
                  className="w-48 h-48 object-contain mx-auto rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-500 mb-2">Scan with any UPI App</p>
              <p className="font-mono text-lg font-semibold">8824780800@hdfc</p>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span className="text-sm text-gray-700">Open your UPI app</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span className="text-sm text-gray-700">Scan QR code or enter UPI ID</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span className="text-sm text-gray-700">Pay <strong>{selectedPlan.price}</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span className="text-sm text-gray-700">Take screenshot of payment confirmation</span>
              </div>
            </div>
          </div>

          {/* Upload Screenshot */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-6">Upload Payment Screenshot</h3>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>User:</strong> {user?.displayName || 'Anonymous'} ({user?.anonId})
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>College:</strong> {user?.college}
              </p>
            </div>

            {/* File Upload */}
            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Screenshot
              </label>
              <div className={`border-2 border-dashed rounded-lg p-8 text-center relative ${
                selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary-500'
              }`}>
                {preview ? (
                  <div className="relative">
                    <img 
                      src={preview} 
                      alt="Payment screenshot preview" 
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG up to 5MB
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || submitting}
              className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                !selectedFile || submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiCheck className="w-5 h-5" />
                  Submit Payment
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <FiMail className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium mb-1">Important Note</p>
              <p className="text-sm text-yellow-700">
                After submitting your payment screenshot, the admin will verify and grant you premium access within 24 hours.
                You'll receive a notification once your premium is activated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

