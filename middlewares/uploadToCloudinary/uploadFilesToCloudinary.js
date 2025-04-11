import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import asyncHandler from 'express-async-handler';
import fs from 'fs';

//configure cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

const cloudinaryUploadFiles = async (req, res, next) => {
  try {
    if (!req.files) {
      return next();
    }
    let mediaFiles = req.filesss;
    let mediaFilesData = []; //public_id and secure_url

    for (const file of mediaFiles) {
      // Determine the correct resource type based on mimetype
      let resourceType = 'image';
      if (file.mimetype.startsWith('video/')) {
        resourceType = 'video';
      } else if (file.mimetype.startsWith('application/')) {
        resourceType = 'raw'; // for PDFs or other files
      }
      let result = await cloudinary.uploader.upload(file.path, {
        resource_type: resourceType,
      });
      mediaFilesData.push(result);
      //Remove image from storage
      fs.unlinkSync(file.path);
    }
    req.mediaFilesData = mediaFilesData;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default cloudinaryUploadFiles;
