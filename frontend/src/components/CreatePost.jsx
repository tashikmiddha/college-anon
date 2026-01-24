import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, uploadImage, clearMessage, clearUploadedImage, fetchPosts } from '../features/posts/postSlice';
import { FiImage, FiX, FiUpload, FiTrash2, FiStar, FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const categories = [
  { value: 'general', label: 'General' },
  { value: 'academic', label: 'Academic' },
  { value: 'campus-life', label: 'Campus Life' },
  { value: 'confession', label: 'Confession' },
  { value: 'advice', label: 'Advice' },
  { value: 'humor', label: 'Humor' },
  { value: 'other', label: 'Other' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  
  // Track which fields have been touched for validation
  const [touched, setTouched] = useState({});
  // Track validation errors
  const [validationErrors, setValidationErrors] = useState({});

  const { title, content, category, tags } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, isError, isSuccess, message, uploadProgress, uploadedImage, needsModeration } = useSelector((state) => state.posts);

  // Check premium status
  const isPremium = user?.isPremium && new Date(user?.premiumExpiresAt) > new Date();
  const imageLimit = user?.premiumLimits?.imageUploads || 0;
  const imageUsed = user?.premiumUsage?.imageUploads || 0;
  const hasImageQuota = imageUsed < imageLimit;

  // Validate individual fields
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        return '';
      case 'content':
        if (!value.trim()) return 'Content is required';
        if (value.trim().length < 10) return 'Content must be at least 10 characters';
        return '';
      default:
        return '';
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    const titleValid = validateField('title', title) === '';
    const contentValid = validateField('content', content) === '';
    return titleValid && contentValid;
  };

  useEffect(() => {
    if (isError) {
      dispatch(clearMessage());
    }
    if (isSuccess) {
      dispatch(clearUploadedImage());
      // Only navigate if post doesn't need moderation
      // If needs moderation, stay on page to show the message
      if (!needsModeration) {
        navigate('/');
      }
    }
  }, [isError, isSuccess, needsModeration, dispatch, navigate]);

  // Set preview URL when file is selected
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  // Clear upload error when image changes
  useEffect(() => {
    setUploadError(null);
  }, [selectedFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate field and update validation errors
    const fieldError = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    // Validate field on blur
    const fieldError = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError('File size must be less than 5MB');
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    dispatch(clearUploadedImage());
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return null;
    
    try {
      const result = await dispatch(uploadImage(selectedFile)).unwrap();
      return result;
    } catch (error) {
      setUploadError(error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all required fields as touched
    setTouched({
      title: true,
      content: true,
    });

    // Validate all required fields
    const errors = {
      title: validateField('title', title),
      content: validateField('content', content),
    };
    setValidationErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some(err => err)) {
      // Scroll to first error
      const firstError = Object.keys(errors).find(key => errors[key]);
      const errorElement = document.querySelector(`[name="${firstError}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    let imageData = { url: '', publicId: '' };
    
    // Upload image if selected
    if (selectedFile) {
      const result = await handleUploadImage();
      if (result) {
        imageData = {
          url: result.url,
          publicId: result.publicId
        };
      } else if (uploadError) {
        // Don't submit if there's an upload error
        return;
      }
    }

    const postData = {
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      image: imageData,
    };

    console.log('Submitting post data:', postData);
    dispatch(createPost(postData));
  };

  // Helper to get input border class
  const getInputClass = (fieldName) => {
    const baseClass = 'input';
    if (touched[fieldName] && validationErrors[fieldName]) {
      return `${baseClass} border-red-500 focus:ring-red-500 focus:border-red-500`;
    }
    if (touched[fieldName] && !validationErrors[fieldName]) {
      return `${baseClass} border-green-500 focus:ring-green-500 focus:border-green-500`;
    }
    return baseClass;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="card space-y-6">
        <h2 className="text-2xl font-bold">Create Anonymous Post</h2>

        {message && (
          <div className={`px-4 py-3 rounded flex items-start ${needsModeration ? 'bg-amber-100 text-amber-800 border border-amber-300' : isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {needsModeration ? (
              <FiAlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            ) : (
              <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">{message}</p>
              {needsModeration && (
                <p className="text-sm mt-1 opacity-80">
                  Your post will be visible again once an admin reviews and approves it.
                </p>
              )}
            </div>
            {needsModeration && (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="ml-4 px-3 py-1 text-sm bg-amber-200 hover:bg-amber-300 text-amber-800 rounded transition-colors"
              >
                Go to Home
              </button>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('title')}
            placeholder="What's on your mind?"
            maxLength={200}
          />
          <p className="text-sm text-gray-500 mt-1 flex justify-between">
            <span>{title.length}/200 characters</span>
            {touched.title && validationErrors.title && (
              <span className="text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.title}
              </span>
            )}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={category}
            onChange={handleChange}
            className="input"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={content}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('content')}
            placeholder="Share your thoughts anonymously..."
            maxLength={10000}
          />
          <p className="text-sm text-gray-500 mt-1 flex justify-between">
            <span>{content.length}/10000 characters</span>
            {touched.content && validationErrors.content && (
              <span className="text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.content}
              </span>
            )}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={tags}
            onChange={handleChange}
            className="input"
            placeholder="e.g., exam, stress, motivation"
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image {isPremium ? '(Premium)' : ''}
          </label>
          
          {isPremium ? (
            hasImageQuota ? (
              !previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                    disabled={isLoading}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    <FiImage className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      JPEG, PNG, GIF, WebP up to 5MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Complete */}
                  {uploadedImage && uploadProgress === 100 && (
                    <p className="mt-2 text-sm text-green-600 flex items-center">
                      <FiUpload className="w-4 h-4 mr-1" />
                      Image uploaded successfully
                    </p>
                  )}
                </div>
              )
            ) : (
              <div className="border-2 border-dashed border-red-300 rounded-lg p-6 text-center bg-red-50">
                <FiLock className="w-12 h-12 text-red-400 mx-auto mb-2" />
                <p className="text-red-600">
                  You have reached your image upload limit ({imageUsed}/{imageLimit})
                </p>
                <Link to="/premium" className="text-sm text-red-500 hover:underline mt-2 inline-block">
                  <FiStar className="inline mr-1" />
                  Upgrade your plan for more uploads
                </Link>
              </div>
            )
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
              <FiLock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-3">
                Image uploads are a premium feature
              </p>
              <Link
                to="/premium"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <FiStar className="w-4 h-4" />
                Upgrade to Premium
              </Link>
            </div>
          )}
          
          {/* Upload Error */}
          {uploadError && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <FiTrash2 className="w-4 h-4 mr-1" />
              {uploadError}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Remember:</strong> Your post will be reviewed by AI moderation. 
            Posts that violate community guidelines may be removed.
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className={`btn flex-1 ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : 'btn-primary'}`}
          >
            {isLoading ? 'Publishing...' : 'Publish Anonymously'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;

