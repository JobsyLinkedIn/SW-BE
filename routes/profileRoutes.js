import express from 'express';
import authenticateUser from '../middlewares/authenticateUser.js';
import uploadByMulter from '../middlewares/multer/multer.js';
import cloudinaryUploadFiles from '../middlewares/uploadToCloudinary/uploadFilesToCloudinary.js';
import {
  createOrUpdateProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  uploadCoverPhoto,
  deleteCoverPhoto,
  uploadResume,
  addWorkExperience,
  addEducation,
  addSkills,
  updatePrivacySettings,
  viewUserProfile,
  followUser,
  deleteWorkExperience,
  deleteEducation, 
  deleteSkills, 
} from '../controllers/profileController.js';

const router = express.Router();

// Apply middleware to all routes
router.use(authenticateUser);

// Profile routes
router.post('/', createOrUpdateProfile);

// Profile picture upload route
router.post(
  '/picture',
  uploadByMulter.single('file'), // Handle file upload
  cloudinaryUploadFiles, // Upload to Cloudinary
  uploadProfilePicture
);

// Delete profile picture
router.delete('/picture', deleteProfilePicture);

// Cover photo upload route
router.post(
  '/cover',
  uploadByMulter.single('file'), // Handle file upload
  cloudinaryUploadFiles, // Upload to Cloudinary
  uploadCoverPhoto
);

// Delete cover photo
router.delete('/cover', deleteCoverPhoto);

// Resume upload route
router.post(
  '/resume',
  uploadByMulter.single('file'), // Handle file upload
  cloudinaryUploadFiles, // Upload to Cloudinary
  uploadResume
);

// Other profile-related routes
router.post('/work-experience', addWorkExperience);
router.delete('/work-experience/:id', deleteWorkExperience); 
router.post('/education', addEducation);
router.delete('/education/:id', deleteEducation); 
router.post('/skills', addSkills);
router.delete('/skills', deleteSkills); 
router.put('/privacy', updatePrivacySettings);
router.get('/', viewUserProfile);
router.post('/follow', followUser);

export default router;