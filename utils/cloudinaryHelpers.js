import cloudinary from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

//Cloudinary Remove Image Function
const deleteFileFromCloudinary = async (PublicId) => {
  try {
    result = await cloudinary.uploader.destroy(PublicId);
    return result;
  } catch (error) {
    return error;
  }
};

export default deleteFileFromCloudinary;
