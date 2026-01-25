import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createCompetition, clearMessage, clearError } from '../features/competitions/competitionSlice';
import { FiImage, FiX, FiStar, FiClock, FiArrowLeft, FiUpload, FiPlus } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const CreateCompetition = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.competitions);
  
  const [formData, setFormData] = useState({
    title: '', description: '', option1Name: '', option2Name: '',
    option1Image: null, option2Image: null,
    option1Preview: null, option2Preview: null, durationHours: 24,
  });
  const [errors, setErrors] = useState({});
  const [uploadErrors, setUploadErrors] = useState({ option1: null, option2: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const option1InputRef = useRef(null);
  const option2InputRef = useRef(null);

  const isPremium = user?.isPremium && new Date(user?.premiumExpiresAt) > new Date();
  const competitionLimit = user?.premiumLimits?.competitions || 0;
  const competitionUsed = user?.premiumUsage?.competitions || 0;
  const hasCompetitionQuota = competitionUsed < competitionLimit;
  const canAccess = user && isPremium && hasCompetitionQuota;
  const isFormValid = formData.title.trim() && formData.option1Name.trim() && formData.option2Name.trim();

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => navigate('/competitions'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (isError) {
      setErrors({ submit: message });
      // Reset submitting state on error so user can retry
      setIsSubmitting(false);
      setHasSubmitted(false);
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [isError, message, dispatch]);

  if (!canAccess) {
    return (
      <div className="container-custom py-6">
        <div className="max-w-lg mx-auto">
          <Link to="/competitions" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4">
            <FiArrowLeft className="mr-2" /> Back
          </Link>
          <div className="card text-center py-8">
            <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FiStar className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {!user ? 'Please Login' : !isPremium ? 'Premium Feature' : 'No Credits Left'}
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              {!user ? 'Login to create competitions.' : !isPremium ? 'Upgrade to Premium!' : `${competitionUsed}/${competitionLimit} used`}
            </p>
            {!user ? (
              <Link to="/login" className="btn btn-primary">Login</Link>
            ) : (
              <Link to="/premium" className="btn btn-primary flex items-center justify-center gap-2">
                <FiStar className="w-4 h-4" /> Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name] || errors.submit) setErrors(prev => ({ ...prev, [name]: null, submit: null }));
  };

  const handleFileChange = (e, optionKey) => {
    const file = e.target.files[0];
    const previewKey = optionKey === 'option1Image' ? 'option1Preview' : 'option2Preview';
    const errorKey = optionKey === 'option1Image' ? 'option1' : 'option2';
    
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setUploadErrors(prev => ({ ...prev, [errorKey]: 'Max 5MB' }));
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadErrors(prev => ({ ...prev, [errorKey]: 'Invalid type' }));
      return;
    }
    
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, [optionKey]: file, [previewKey]: previewUrl }));
    setUploadErrors(prev => ({ ...prev, [errorKey]: null }));
  };

  const removeImage = (optionKey) => {
    const previewKey = optionKey === 'option1Image' ? 'option1Preview' : 'option2Preview';
    const errorKey = optionKey === 'option1Image' ? 'option1' : 'option2';
    setFormData(prev => ({ ...prev, [optionKey]: null, [previewKey]: null }));
    setUploadErrors(prev => ({ ...prev, [errorKey]: null }));
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;
    if (!formData.title.trim()) { newErrors.title = 'Title required'; isValid = false; }
    if (!formData.option1Name.trim()) { newErrors.option1Name = 'Option 1 required'; isValid = false; }
    if (!formData.option2Name.trim()) { newErrors.option2Name = 'Option 2 required'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasSubmitted || isSubmitting || !validate()) return;
    setIsSubmitting(true);
    setHasSubmitted(true);

    const competitionData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: 'comparison',
      durationHours: parseInt(formData.durationHours),
      options: [
        { name: formData.option1Name.trim() },
        { name: formData.option2Name.trim() }
      ],
      images: [formData.option1Image, formData.option2Image].filter(Boolean),
    };

    console.log('Submitting competition data:', {
      title: competitionData.title,
      optionsCount: competitionData.options.length,
      options: competitionData.options,
      images: competitionData.images.length
    });

    try {
      // Dispatch to Redux - the async thunk in competitionSlice handles the API call
      await dispatch(createCompetition(competitionData)).unwrap();
    } catch (error) {
      console.error('Error creating competition:', error);
      setErrors({ submit: error.message || error });
      setIsSubmitting(false);
      setHasSubmitted(false);
    }
  };

  return (
    <div className="container-custom py-6">
      <div className="max-w-lg mx-auto">
        <Link to="/competitions" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4">
          <FiArrowLeft className="mr-2" /> Back
        </Link>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {/* Success Message */}
          {isSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Competition created successfully!</p>
                  <p className="text-xs text-green-600">Redirecting to competitions...</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="bg-yellow-100 p-2 rounded-full">
              <FiStar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Create Competition</h1>
              <p className="text-sm text-gray-500">{competitionUsed}/{competitionLimit} credits</p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question/Title <span className="text-red-500">*</span>
            </label>
            <input type="text" name="title" value={formData.title} onChange={handleChange}
              className={`input ${errors.title ? 'border-red-500' : ''}`} placeholder="Which is better?" maxLength={200} required />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.title.length}/200</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              className="input min-h-[80px] resize-y" placeholder="Add context..." maxLength={500} />
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.description.length}/500</p>
          </div>

          {/* Options */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Two Options</h2>
            
            <div className="space-y-4">
              {/* Option 1 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Option 1 <span className="text-red-500">*</span></label>
                <input type="text" name="option1Name" value={formData.option1Name} onChange={handleChange}
                  className={`input ${errors.option1Name ? 'border-red-500' : ''}`} placeholder="e.g., Pizza" maxLength={100} />
                {errors.option1Name && <p className="text-sm text-red-600 mt-1">{errors.option1Name}</p>}
                
                <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">Image (optional)</label>
                {!formData.option1Preview ? (
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    uploadErrors.option1 ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-primary-400'
                  }`} onClick={() => option1InputRef.current?.click()}>
                    <input type="file" accept={ALLOWED_TYPES.join(',')} onChange={(e) => handleFileChange(e, 'option1Image')}
                      className="hidden" ref={option1InputRef} />
                    <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <span className="text-sm text-gray-600">Tap to add image</span>
                    <p className="text-xs text-gray-400">Max 5MB</p>
                    {uploadErrors.option1 && <p className="text-xs text-red-600 mt-1">{uploadErrors.option1}</p>}
                  </div>
                ) : (
                  <div className="relative mt-2">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img src={formData.option1Preview} alt="Preview" className="w-full h-40 object-cover" />
                      <button type="button" onClick={() => removeImage('option1Image')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Option 2 <span className="text-red-500">*</span></label>
                <input type="text" name="option2Name" value={formData.option2Name} onChange={handleChange}
                  className={`input ${errors.option2Name ? 'border-red-500' : ''}`} placeholder="e.g., Burger" maxLength={100} />
                {errors.option2Name && <p className="text-sm text-red-600 mt-1">{errors.option2Name}</p>}
                
                <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">Image (optional)</label>
                {!formData.option2Preview ? (
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    uploadErrors.option2 ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-primary-400'
                  }`} onClick={() => option2InputRef.current?.click()}>
                    <input type="file" accept={ALLOWED_TYPES.join(',')} onChange={(e) => handleFileChange(e, 'option2Image')}
                      className="hidden" ref={option2InputRef} />
                    <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <span className="text-sm text-gray-600">Tap to add image</span>
                    <p className="text-xs text-gray-400">Max 5MB</p>
                    {uploadErrors.option2 && <p className="text-xs text-red-600 mt-1">{uploadErrors.option2}</p>}
                  </div>
                ) : (
                  <div className="relative mt-2">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img src={formData.option2Preview} alt="Preview" className="w-full h-40 object-cover" />
                      <button type="button" onClick={() => removeImage('option2Image')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select name="durationHours" value={formData.durationHours} onChange={handleChange} className="input">
              <option value={1}>1 Hour</option>
              <option value={6}>6 Hours</option>
              <option value={12}>12 Hours</option>
              <option value={24}>24 Hours</option>
              <option value={48}>48 Hours</option>
              <option value={72}>72 Hours</option>
            </select>
            <p className="text-xs text-gray-400 mt-1 flex items-center">
              <FiClock className="w-3 h-3 mr-1" /> Results visible after ends
            </p>
          </div>

          {/* Error */}
          {errors.submit && (
            <div className={`p-4 rounded-lg border ${
              errors.submit.includes('just created') 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  errors.submit.includes('just created') 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm ${
                    errors.submit.includes('just created') 
                      ? 'text-amber-800' 
                      : 'text-red-600'
                  }`}>
                    {errors.submit}
                  </p>
                  {errors.submit.includes('just created') && (
                    <p className="text-xs text-amber-700 mt-1">
                      Please wait a moment and try again with a different title.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={() => navigate('/competitions')} className="btn btn-secondary flex-1" disabled={isSubmitting}>Cancel</button>
            <button type="submit" disabled={!isFormValid || isSubmitting || hasSubmitted}
              className={`btn flex-1 flex items-center justify-center gap-2 ${!isFormValid || hasSubmitted ? 'opacity-50 cursor-not-allowed' : 'btn-primary'}`}>
              {isSubmitting ? <><LoadingSpinner /> Creating...</> : <><FiUpload /> Create</>}
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>How it works:</strong> Users vote on your competition. Results are hidden until time ends.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCompetition;

