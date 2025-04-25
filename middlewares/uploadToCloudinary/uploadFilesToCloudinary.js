import cloudinary from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

const cloudinaryUploadFiles = async (req, res, next) => {
  try {
    let mediaFiles = []; //Array to store Upladed files
    // Handle both single and multiple file uploads
    if (req.files) {
      mediaFiles = req.files;
    } else if (req.file) {
      mediaFiles = [req.file];
    } else {
      return next();
    }
    let mediaFilesData = []; // Array to store Cloudinary upload results

    for (const file of mediaFiles) {
      // Determine the resource type based on the file's mimetype
      let resourceType = 'image';
      if (file.mimetype.startsWith('video/')) {
        resourceType = 'video';
      } else if (file.mimetype.startsWith('application/')) {
        resourceType = 'raw'; // For PDFs or other files
      }

      // Upload the file to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: resourceType,
      });

      mediaFilesData.push(result);

      // Remove the file from local storage
      fs.unlinkSync(file.path);
    }

    // Attach the uploaded file data to the request object
    req.mediaFilesData = mediaFilesData;
    return next();
  } catch (error) {
    console.error('Error in cloudinaryUploadFiles:', error);
    next(error);
  }
};

export default cloudinaryUploadFiles;
