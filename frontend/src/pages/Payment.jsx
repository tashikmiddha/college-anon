import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiStar, FiAward, FiClock, FiCheckCircle, FiPhone } from 'react-icons/fi';
import qrCodeImage from '../assets/qr-code.jpeg';
import { paymentAPI } from '../features/auth/authAPI';

const Payment = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const premiumPlans = [
    {
      id: 'basic',
      name: 'Basic',
      subtitle: 'Starter',
      price: '₹49',
      features: ['3 Images', '1 Competition', '10 Days']
    },
    {
      id: 'advance',
      name: 'Advance',
      subtitle: 'Most Popular',
      price: '₹149',
      features: ['10 Images', '5 Competitions', '30 Days']
    },
    {
      id: 'elite',
      name: 'Elite',
      subtitle: 'Lifetime',
      price: '₹299',
      features: ['25 Images', '15 Competitions', 'Lifetime']
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <FiCheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Submitted!</h1>
            <p className="text-gray-500 text-sm mb-6">Premium will be activated within 24 hours.</p>
            <Link to="/" className="block w-full py-3 bg-gray-900 text-white rounded-xl font-medium">Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Mobile Only */}
      <div className="md:hidden bg-white px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600">
          <FiArrowLeft className="w-5 h-5 mr-1.5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* PC Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="hidden md:flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Title - Mobile */}
        <div className="md:hidden text-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-500 text-sm mt-0.5">{selectedPlan.name} Plan - {selectedPlan.price}</p>
        </div>

        {/* PC Layout - Two Columns */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {/* Left Column - Plan & QR */}
          <div className="space-y-6">
            {/* Plan Card - PC */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPlan.name}</h2>
                  <p className="text-sm text-gray-500">{selectedPlan.subtitle}</p>
                </div>
                <span className="text-2xl font-bold text-gray-900">{selectedPlan.price}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPlan.features.map((feature, idx) => (
                  <span key={idx} className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{feature}</span>
                ))}
              </div>
            </div>

            {/* QR Card - PC */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiPhone className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-base mb-4 font-medium">Scan with any UPI App</p>
              <div className="bg-white rounded-xl p-4 inline-block mb-4 shadow-lg">
                <img src={qrCodeImage} alt="QR Code" className="w-40 h-40 object-contain" />
              </div>
              <br />
              <div className="bg-white/10 rounded-lg px-4 py-2 inline-block">
                <p className="text-white font-mono text-sm">8824780800@hdfc</p>
              </div>
            </div>

            {/* Steps - PC */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">How to Pay</h3>
              <div className="space-y-3">
                {['Open UPI App (GPay, PhonePe)', 'Scan QR or enter UPI ID', `Pay ${selectedPlan.price}`, 'Take screenshot'].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                    <span className="text-sm text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Upload */}
          <div className="space-y-6">
            {/* Upload Card - PC */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upload Payment Screenshot</h3>
              
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

              <div className="relative">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center ${selectedFile ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300'}`}>
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="Preview" className="max-h-56 mx-auto rounded-lg" />
                      <button onClick={() => { setSelectedFile(null); setPreview(null); }} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center">×</button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiUpload className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-sm">Tap to upload screenshot</p>
                      <p className="text-gray-400 text-xs mt-1">PNG or JPG up to 5MB</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>

              <button onClick={handleSubmit} disabled={!selectedFile || submitting} className={`w-full mt-4 py-4 rounded-xl font-semibold text-white ${!selectedFile || submitting ? 'bg-gray-200 text-gray-400' : 'bg-gray-900'}`}>
                {submitting ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>

            {/* Note - PC */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 text-sm">Premium will be activated within 24 hours after verification.</p>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Single Column */}
        <div className="md:hidden space-y-4">
          {/* Plan Card - Mobile */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between overflow-hidden">
              <div className="overflow-hidden">
                <h2 className="text-lg font-bold text-gray-900">{selectedPlan.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedPlan.features.join(' • ')}</p>
              </div>
              <span className="text-xl font-bold text-gray-900">{selectedPlan.price}</span>
            </div>
          </div>

          {/* QR Card - Mobile */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <FiPhone className="w-5 h-5 text-white" />
            </div>
            <p className="text-white text-sm mb-3 font-medium">Scan with any UPI App</p>
            <div className="bg-white rounded-xl p-2 inline-block mb-2 shadow-lg">
              <img src={qrCodeImage} alt="QR Code" className="w-28 h-28 object-contain" />
            </div>
            <br />
            <div className="bg-white/10 rounded-lg px-3 py-1.5 inline-block">
              <p className="text-white font-mono text-sm">8824780800@hdfc</p>
            </div>
          </div>

          {/* Steps - Mobile */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">How to Pay</h3>
            <div className="space-y-2">
              {['Open UPI App', 'Scan QR or enter ID', `Pay ${selectedPlan.price}`, 'Take screenshot'].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upload - Mobile */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Upload Screenshot</h3>
            {error && <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg mb-3">{error}</div>}
            <div className="relative">
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${selectedFile ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300'}`}>
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                    <button onClick={() => { setSelectedFile(null); setPreview(null); }} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm">×</button>
                  </div>
                ) : (
                  <div>
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FiUpload className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-sm">Tap to upload</p>
                    <p className="text-gray-400 text-xs mt-1">Max 5MB</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
            <button onClick={handleSubmit} disabled={!selectedFile || submitting} className={`w-full mt-3 py-3 rounded-lg font-semibold text-white text-sm ${!selectedFile || submitting ? 'bg-gray-200 text-gray-400' : 'bg-gray-900'}`}>
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>

          {/* Note - Mobile */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-xs">Premium activated within 24 hours after verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

