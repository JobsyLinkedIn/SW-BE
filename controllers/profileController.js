import * as profileService from '../services/profileServices.js';

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

const viewUserProfile = async (req, res) => {
  try {
    const response = await profileService.viewUserProfile(req);
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
  viewUserProfile,
};