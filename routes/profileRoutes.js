import express from 'express';
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
} from '../controllers/profileController.js';

const router = express.Router();

router.post('/', createOrUpdateProfile);
router.post('/picture', uploadProfilePicture);
router.delete('/picture', deleteProfilePicture);
router.post('/cover', uploadCoverPhoto);
router.delete('/cover', deleteCoverPhoto);
router.post('/resume', uploadResume);
router.post('/work-experience', addWorkExperience);
router.post('/education', addEducation);
router.post('/skills', addSkills);
router.post('/privacy', updatePrivacySettings);
router.get('/:token', viewUserProfile);
router.post('/follow', followUser);
export default router;
