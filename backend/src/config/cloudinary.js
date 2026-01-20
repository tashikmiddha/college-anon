import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload helper function
export const uploadImage = async (fileBuffer, folder = 'college-anon/posts') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      reject(new Error('Cloudinary configuration is missing'));
      return;
    }

    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      // Enable moderation for user-uploaded content
      moderation_status: 'pending'
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// Delete image helper
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export default cloudinary;

