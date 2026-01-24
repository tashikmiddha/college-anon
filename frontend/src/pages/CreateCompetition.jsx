import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createCompetition, clearMessage, clearError } from '../features/competitions/competitionSlice';
import { FiImage, FiX, FiPlus, FiStar, FiClock, FiArrowLeft, FiUpload } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// API function for creating competition (handles FormData properly)
const createCompetitionAPI = async (competitionData, token) => {
  const formData = new FormData();
  formData.append('title', competitionData.title);
  formData.append('description', competitionData.description || '');
  formData.append('type', competitionData.type || 'comparison');
  formData.append('durationHours', competitionData.durationHours || 24);
  
  // Append options as JSON
  const options = competitionData.options.map((opt, index) => ({
    name: opt.name,
    // Don't include image here since we're sending as files
  }));
  formData.append('options', JSON.stringify(options));
  
  // Append images in correct order - first image goes to optionImages[0], second to [1]
  if (competitionData.images && competitionData.images.length > 0) {
    console.log(`Attaching ${competitionData.images.length} images to FormData`);
    competitionData.images.forEach((image, index) => {
      if (image) {
        console.log(`Image ${index + 1}:`, image.name, image.size, image.type);
        formData.append('optionImages', image);
      }
    });
  } else {
    console.log('No images to attach');
  }

  console.log('Sending request to /api/competitions...');
  const response = await fetch('/api/competitions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  console.log('Response status:', response.status);

  const data = await response.json();

  if (!response.ok) {
    console.error('Server error response:', data);
    throw new Error(data.message || data.errors?.join(', ') || 'Failed to create competition');
  }

  console.log('Competition created successfully:', data);
  return data;
};

const CreateCompetition = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.competitions
  );

  // Check premium status
  const isPremium = user?.isPremium && new Date(user?.premiumExpiresAt) > new Date();
  const competitionLimit = user?.premiumLimits?.competitions || 0;
  const competitionUsed = user?.premiumUsage?.competitions || 0;
  const hasCompetitionQuota = competitionUsed < competitionLimit;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    option1Name: '',
    option2Name: '',
    option1Image: null,
    option2Image: null,
    option1Preview: null,
    option2Preview: null,
    durationHours: 24,
  });

  const [errors, setErrors] = useState({});
  const [uploadErrors, setUploadErrors] = useState({ option1: null, option2: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false); // Track if form has been submitted

  const option1InputRef = useRef(null);
  const option2InputRef = useRef(null);

  useEffect(() => {
    // Redirect if not premium or no quota
    if (!isPremium || !hasCompetitionQuota) {
      navigate('/competitions');
    }
  }, [isPremium, hasCompetitionQuota, navigate]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/competitions');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (isError) {
      setErrors({ submit: message });
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isError, message, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: null }));
    }
  };

  const handleFileChange = (e, optionKey) => {
    const file = e.target.files[0];
    // For option1Image, the preview key should be option1Preview
    // For option2Image, the preview key should be option2Preview
    const previewKey = optionKey === 'option1Image' ? 'option1Preview' : 'option2Preview';
    const errorKey = optionKey === 'option1Image' ? 'option1' : 'option2';
    
    console.log(`handleFileChange called for ${optionKey}`);
    console.log(`File selected:`, file);
    console.log(`Preview key: ${previewKey}, Error key: ${errorKey}`);
    
    if (file) {
      console.log(`File details: name=${file.name}, size=${file.size}, type=${file.type}`);
      
      if (file.size > MAX_FILE_SIZE) {
        console.log('File too large');
        setUploadErrors(prev => ({ ...prev, [errorKey]: 'File size must be less than 5MB' }));
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        console.log('Invalid file type');
        setUploadErrors(prev => ({ ...prev, [errorKey]: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }));
        return;
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      console.log(`Created preview URL: ${previewUrl.substring(0, 50)}...`);
      
      setFormData(prev => {
        console.log(`Updating formData.${optionKey} and formData.${previewKey}`);
        return {
          ...prev,
          [optionKey]: file,
          [previewKey]: previewUrl
        };
      });
      
      setUploadErrors(prev => ({ ...prev, [errorKey]: null }));
      console.log(`State updated for ${optionKey}`);
    } else {
      console.log('No file selected');
    }
  };

  const removeImage = (optionKey) => {
    // For option1Image, the preview key should be option1Preview
    // For option2Image, the preview key should be option2Preview
    const previewKey = optionKey === 'option1Image' ? 'option1Preview' : 'option2Preview';
    const errorKey = optionKey === 'option1Image' ? 'option1' : 'option2';
    
    console.log(`Removing image for ${optionKey}`);
    
    setFormData(prev => ({
      ...prev,
      [optionKey]: null,
      [previewKey]: null
    }));
    
    setUploadErrors(prev => ({ ...prev, [errorKey]: null }));
    console.log(`Image removed for ${optionKey}`);
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot be more than 200 characters';
      isValid = false;
    }
    
    if (!formData.option1Name.trim()) {
      newErrors.option1Name = 'Option 1 name is required';
      isValid = false;
    }
    
    if (!formData.option2Name.trim()) {
      newErrors.option2Name = 'Option 2 name is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Check if form is valid for button state
  const isFormValid = formData.title.trim() && formData.option1Name.trim() && formData.option2Name.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (hasSubmitted || isSubmitting) {
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setHasSubmitted(true); // Mark as submitted to prevent duplicates

    // Create competition data with images
    const competitionData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: 'comparison',
      durationHours: parseInt(formData.durationHours),
      options: [
        { name: formData.option1Name.trim(), image: null },
        { name: formData.option2Name.trim(), image: null }
      ],
      // Only include images that exist
      images: [formData.option1Image, formData.option2Image].filter(Boolean),
    };

    try {
      const token = localStorage.getItem('token');
      const response = await createCompetitionAPI(competitionData, token);

      // Update Redux state with the created competition
      dispatch(createCompetition(response));
    } catch (error) {
      setErrors({ submit: error.message });
      setIsSubmitting(false);
      setHasSubmitted(false); // Reset on error so user can try again
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <Link
        to="/competitions"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Back to Competitions
      </Link>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FiStar className="text-yellow-500" />
          Create Competition
        </h2>

        {/* Premium info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-800">
              <FiStar className="w-5 h-5" />
              <span className="font-medium">Premium Feature</span>
            </div>
            <span className="text-sm text-yellow-600">
              {competitionUsed}/{competitionLimit} used
            </span>
          </div>
        </div>

        {/* Error/Success messages */}
        {message && (
          <div className={`px-4 py-3 rounded ${
            isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question/Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`input ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Which is better?"
            maxLength={200}
            required
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {formData.title.length}/200 characters
          </p>
        </div>

        {/* Description (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input min-h-[80px] resize-y"
            placeholder="Add more context to your competition..."
            maxLength={500}
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Options Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Two Options
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Option 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option 1 Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="option1Name"
                value={formData.option1Name}
                onChange={handleChange}
                className={`input ${errors.option1Name ? 'border-red-500' : ''}`}
                placeholder="e.g., Pizza"
                maxLength={100}
              />
              {errors.option1Name && (
                <p className="text-sm text-red-600 mt-1">{errors.option1Name}</p>
              )}

              {/* Image upload for option 1 */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image (optional)
                </label>
                
                {!formData.option1Preview ? (
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer ${
                      uploadErrors.option1 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    onClick={() => {
                      console.log('Clicking option1 input');
                      option1InputRef.current?.click();
                    }}
                  >
                    <input
                      type="file"
                      accept={ALLOWED_TYPES.join(',')}
                      onChange={(e) => {
                        console.log('File selected for option1:', e.target.files?.[0]?.name);
                        handleFileChange(e, 'option1Image');
                      }}
                      className="hidden"
                      ref={option1InputRef}
                    />
                    <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to add image
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Up to 5MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={formData.option1Preview}
                        alt="Option 1 preview"
                        className="w-full h-40 object-cover"
                        onLoad={() => console.log('Option 1 image loaded successfully')}
                        onError={() => console.log('Option 1 image failed to load')}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          console.log('Removing option1 image');
                          removeImage('option1Image');
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md"
                        title="Remove image"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-green-600 mt-2 flex items-center">
                      <FiImage className="w-3 h-3 mr-1" />
                      Image attached
                    </p>
                    {uploadErrors.option1 && (
                      <p className="text-sm text-red-600 mt-1">
                        {uploadErrors.option1}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Option 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option 2 Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="option2Name"
                value={formData.option2Name}
                onChange={handleChange}
                className={`input ${errors.option2Name ? 'border-red-500' : ''}`}
                placeholder="e.g., Burger"
                maxLength={100}
              />
              {errors.option2Name && (
                <p className="text-sm text-red-600 mt-1">{errors.option2Name}</p>
              )}

              {/* Image upload for option 2 */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image (optional)
                </label>
                
                {!formData.option2Preview ? (
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer ${
                      uploadErrors.option2 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    onClick={() => {
                      console.log('Clicking option2 input');
                      option2InputRef.current?.click();
                    }}
                  >
                    <input
                      type="file"
                      accept={ALLOWED_TYPES.join(',')}
                      onChange={(e) => {
                        console.log('File selected for option2:', e.target.files?.[0]?.name);
                        handleFileChange(e, 'option2Image');
                      }}
                      className="hidden"
                      ref={option2InputRef}
                    />
                    <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to add image
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Up to 5MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={formData.option2Preview}
                        alt="Option 2 preview"
                        className="w-full h-40 object-cover"
                        onLoad={() => console.log('Option 2 image loaded successfully')}
                        onError={() => console.log('Option 2 image failed to load')}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          console.log('Removing option2 image');
                          removeImage('option2Image');
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md"
                        title="Remove image"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-green-600 mt-2 flex items-center">
                      <FiImage className="w-3 h-3 mr-1" />
                      Image attached
                    </p>
                    {uploadErrors.option2 && (
                      <p className="text-sm text-red-600 mt-1">
                        {uploadErrors.option2}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Competition Duration
          </label>
          <select
            name="durationHours"
            value={formData.durationHours}
            onChange={handleChange}
            className="input max-w-xs"
          >
            <option value={1}>1 Hour</option>
            <option value={6}>6 Hours</option>
            <option value={12}>12 Hours</option>
            <option value={24}>24 Hours (Recommended)</option>
            <option value={48}>48 Hours</option>
            <option value={72}>72 Hours</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            <FiClock className="inline w-4 h-4 mr-1" />
            Results will be visible after the competition ends
          </p>
        </div>

        {/* Required fields indicator */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <FiStar className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Required fields:</p>
            <ul className="mt-1 list-disc list-inside text-amber-700">
              <li className={formData.title.trim() ? 'opacity-50' : ''}>
                Title {formData.title.trim() && '✓'}
              </li>
              <li className={formData.option1Name.trim() ? 'opacity-50' : ''}>
                Option 1 Name {formData.option1Name.trim() && '✓'}
              </li>
              <li className={formData.option2Name.trim() ? 'opacity-50' : ''}>
                Option 2 Name {formData.option2Name.trim() && '✓'}
              </li>
            </ul>
          </div>
        </div>

        {/* Submit */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/competitions')}
            className="btn btn-secondary flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting || hasSubmitted}
            className={`btn flex-1 flex items-center justify-center gap-2 ${
              !isFormValid || hasSubmitted ? 'opacity-50 cursor-not-allowed' : 'btn-primary'
            }`}
            title={!isFormValid ? 'Please fill in all required fields' : hasSubmitted ? 'Competition is being created...' : ''}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                Creating...
              </>
            ) : (
              <>
                <FiUpload />
                Create Competition
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> Users will see your competition and can vote
            on either option. Vote counts are hidden until the competition ends (24 hours).
            Then everyone can see which option won!
          </p>
        </div>
      </form>
    </div>
  );
};

export default CreateCompetition;

