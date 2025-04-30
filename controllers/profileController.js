import * as profileService from '../services/profileServices.js';
import follow_target_service from '../services/connections/follow_service.js';
import unfollow_target_service from '../services/connections/unfollow_service.js';


const createOrUpdateProfile = async (req, res) => {
  try {
    const response = await profileService.createOrUpdateProfile(req, req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    const response = await profileService.uploadProfilePicture(req);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const deleteProfilePicture = async (req, res) => {
  try {
    const response = await profileService.deleteProfilePicture(req);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const uploadCoverPhoto = async (req, res) => {
  try {
    const response = await profileService.uploadCoverPhoto(req);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const deleteCoverPhoto = async (req, res) => {
  try {
    const response = await profileService.deleteCoverPhoto(req);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const uploadResume = async (req, res) => {
  try {
    const response = await profileService.uploadResume(req);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const addWorkExperience = async (req, res) => {
  try {
    const response = await profileService.addWorkExperience(req, req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const addEducation = async (req, res) => {
  try {
    const response = await profileService.addEducation(req, req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};


const updatePrivacySettings = async (req, res) => {
  try {
    const response = await profileService.updatePrivacySettings(req, req.body);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const viewUserProfile = async (req, res) => {
  try {
    const response = await profileService.viewUserProfile(req);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const followUser = async (req, res) => {
  try {
    const { targetId, targetType } = req.body; // Extract targetId and targetType from request body
    const response = await follow_target_service(req.user.email, targetId, targetType);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { targetId, targetType } = req.body; // Extract targetId and targetType from request body
    const response = await unfollow_target_service(req.user.email, targetId, targetType);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const addSkills = async (req, res) => {
  try {
    const response = await profileService.addSkills(req, req.body.skillsData);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};


const deleteWorkExperience = async (req, res) => {
  try {
    const response = await profileService.deleteWorkExperience(req, req.params.id);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const deleteEducation = async (req, res) => {
  try {
    const response = await profileService.deleteEducation(req, req.params.id);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const deleteSkills = async (req, res) => {
  try {
    const response = await profileService.deleteSkills(req, req.body.skillsToDelete);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const response = await profileService.getProfile(req);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export {
  createOrUpdateProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  uploadCoverPhoto,
  deleteCoverPhoto,
  uploadResume,
  addWorkExperience,
  addEducation,
  addSkills,
  deleteWorkExperience, 
  deleteEducation, 
  deleteSkills, 
  updatePrivacySettings,
  viewUserProfile,
  followUser,
  getProfile,
  unfollowUser,
};