import * as profileService from "../services/profileServices.js";

const createOrUpdateProfile = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const { name, bio, location } = req.body;

  try {
    const response = await profileService.createOrUpdateProfile(token, { name, bio, location });
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const uploadProfilePicture = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const profilePicture = req.file;

  try {
    const response = await profileService.uploadProfilePicture(token, profilePicture);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const deleteProfilePicture = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
    const response = await profileService.deleteProfilePicture(token);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const uploadCoverPhoto = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const coverPhoto = req.file;

  try {
    const response = await profileService.uploadCoverPhoto(token, coverPhoto);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const deleteCoverPhoto = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
    const response = await profileService.deleteCoverPhoto(token);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const uploadResume = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const resume = req.file;

  try {
    const response = await profileService.uploadResume(token, resume);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const addWorkExperience = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const { workExperience } = req.body;

  try {
    const response = await profileService.addWorkExperience(token, workExperience);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const addEducation = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const { education } = req.body;

  try {
    const response = await profileService.addEducation(token, education);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const addSkills = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const { skills } = req.body;

  try {
    const response = await profileService.addSkills(token, skills);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const updatePrivacySettings = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const { privacySettings } = req.body;

  try {
    const response = await profileService.updatePrivacySettings(token, privacySettings);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const viewUserProfile = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
    const response = await profileService.viewUserProfile(token);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const followUser = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const { followUserToken } = req.body;

  try {
    const response = await profileService.followUser(token, followUserToken);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
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
  updatePrivacySettings,
  viewUserProfile,
  followUser,
};