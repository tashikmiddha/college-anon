import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updatePost, uploadImage, clearMessage, clearUploadedImage, fetchPost, clearCurrentPost } from '../features/posts/postSlice';
import { FiImage, FiX, FiUpload, FiTrash2, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

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

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentPost: post, isLoading, isError, isSuccess, message, uploadProgress, uploadedImage, error, needsModeration, moderationRejected, moderationReason } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [initialImageUrl, setInitialImageUrl] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);

  const { title, content, category, tags } = formData;

  useEffect(() => {
    // Fetch the post data
    dispatch(fetchPost(id));
    
    return () => {
      dispatch(clearCurrentPost());
      dispatch(clearMessage());
    };
  }, [dispatch, id]);

  useEffect(() => {
    // Check if user is the author and populate form data
    if (post && user) {
      setIsAuthor(user._id === post.author?._id);
      setFormData({
        title: post.title || '',
        content: post.content || '',
        category: post.category || 'general',
        tags: post.tags ? post.tags.join(', ') : '',
      });
      if (post.image && post.image.url) {
        setInitialImageUrl(post.image.url);
      }
    }
  }, [post, user]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(clearUploadedImage());
      // If post needs moderation, show a confirmation and stay on page
      if (needsModeration) {
        // Don't auto-clear - let user read the message
        // Message will stay visible until user navigates away
      } else {
        navigate(`/post/${id}`);
      }
    }
  }, [isSuccess, needsModeration, dispatch, navigate, id]);

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
    setInitialImageUrl(null);
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
    
    let imageData = null;
    
    // If a new file is selected, upload it
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
    } else if (initialImageUrl) {
      // Keep the existing image - send null to indicate no change
      imageData = null;
    } else {
      // Remove the image
      imageData = { url: '', publicId: '' };
    }

    const postData = {
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    // Only include image if we have new data or want to remove it
    if (imageData !== null || !initialImageUrl) {
      postData.image = imageData;
    }

    console.log('Updating post data:', postData);
    dispatch(updatePost({ id, postData }));
  };

  // Show loading state
  if (isLoading && !post) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show error if post not found or user is not author
  if (!isLoading && (!post || !isAuthor)) {
    return (
      <div className="container-custom py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {!post ? 'Post Not Found' : 'Not Authorized'}
        </h2>
        <p className="text-gray-600 mb-6">
          {!post 
            ? 'The post you\'re trying to edit doesn\'t exist or has been removed.' 
            : 'You are not authorized to edit this post.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Post</h2>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded flex items-start ${
            moderationRejected 
              ? 'bg-red-100 text-red-800 border border-red-300' 
              : needsModeration 
                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                : isError 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
          }`}>
            {moderationRejected ? (
              <FiAlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            ) : needsModeration ? (
              <FiAlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            ) : (
              <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">{message}</p>
              {moderationRejected && moderationReason && (
                <p className="text-sm mt-1 opacity-80">
                  <strong>Reason:</strong> {moderationReason}
                </p>
              )}
              {needsModeration && (
                <p className="text-sm mt-1 opacity-80">
                  Your post is gone for admin approval. It will be visible again once an admin reviews and approves it.
                </p>
              )}
            </div>
            {(moderationRejected || needsModeration) && (
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

        {error && (
          <div className="px-4 py-3 rounded bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={handleChange}
            className="input"
            placeholder="What's on your mind?"
            maxLength={200}
            required
          />
          <p className="text-sm text-gray-500 mt-1">{title.length}/200 characters</p>
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
            Content *
          </label>
          <textarea
            name="content"
            value={content}
            onChange={handleChange}
            className="input min-h-[200px] resize-y"
            placeholder="Share your thoughts anonymously..."
            maxLength={10000}
            required
          />
          <p className="text-sm text-gray-500 mt-1">{content.length}/10000 characters</p>
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
            Image (optional)
          </label>
          
          {!previewUrl && !initialImageUrl ? (
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
                  src={previewUrl || initialImageUrl}
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
          )}
          
          {/* Upload Error */}
          {uploadError && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <FiTrash2 className="w-4 h-4 mr-1" />
              {uploadError}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !content.trim()}
            className="btn btn-primary flex-1"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;

