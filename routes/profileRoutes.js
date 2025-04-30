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
  getProfile,
  unfollowUser,
} from '../controllers/profileController.js';

const router = express.Router();
router.use(authenticateUser);
router.post('/', createOrUpdateProfile);
router.post(
  '/picture',
  uploadByMulter.single('file'), // Handle file upload
  cloudinaryUploadFiles, // Upload to Cloudinary
  uploadProfilePicture
);
router.delete('/picture', deleteProfilePicture);
router.post(
  '/cover',
  uploadByMulter.single('file'), // Handle file upload
  cloudinaryUploadFiles, // Upload to Cloudinary
  uploadCoverPhoto
);
router.delete('/cover', deleteCoverPhoto);
router.post(
  '/resume',
  uploadByMulter.single('file'), // Handle file upload
  cloudinaryUploadFiles, // Upload to Cloudinary
  uploadResume
);
router.post('/work-experience', addWorkExperience);
router.delete('/work-experience/:id', deleteWorkExperience); 
router.post('/education', addEducation);
router.delete('/education/:id', deleteEducation); 
router.post('/skills', addSkills);
router.delete('/skills', deleteSkills); 
router.put('/privacy', updatePrivacySettings);
router.get('/user', viewUserProfile); 
router.post('/follow', followUser);
router.get('/profile', getProfile);
router.post('/follow', followUser); // Follow a user or company
router.post('/unfollow', unfollowUser); // Unfollow a user or company

export default router;