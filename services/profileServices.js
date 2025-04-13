import Profile from '../models/profileModel.js';

const createOrUpdateProfile = async (req, profileData) => {
  const { name, bio, location } = profileData;
  const userId = req.user._id; // Use user from middleware
  let profile = await Profile.findOne({ userId });

  if (profile) {
    profile.name = name;
    profile.bio = bio;
    profile.location = location;
  } else {
    profile = new Profile({ userId, name, bio, location });
  }

  await profile.save();
  return profile;
};

const uploadProfilePicture = async (req) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  if (!req.mediaFilesData || req.mediaFilesData.length === 0) {
    throw new Error('No file uploaded');
  }

  const uploadedFile = req.mediaFilesData[0]; // Assuming only one file is uploaded
  profile.profilePicture = uploadedFile.secure_url;
  await profile.save();
  return profile;
};

const deleteProfilePicture = async (req) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.profilePicture = null;
  await profile.save();
  return profile;
};

const uploadCoverPhoto = async (req) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  if (!req.mediaFilesData || req.mediaFilesData.length === 0) {
    throw new Error('No file uploaded');
  }

  const uploadedFile = req.mediaFilesData[0]; // Assuming only one file is uploaded
  profile.coverPhoto = uploadedFile.secure_url;
  await profile.save();
  return profile;
};

const deleteCoverPhoto = async (req) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.coverPhoto = null;
  await profile.save();
  return profile;
};

const uploadResume = async (req) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  if (!req.mediaFilesData || req.mediaFilesData.length === 0) {
    throw new Error('No file uploaded');
  }

  const uploadedFile = req.mediaFilesData[0]; // Assuming only one file is uploaded
  profile.resume = uploadedFile.secure_url;
  await profile.save();
  return profile;
};

const viewUserProfile = async (req) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId }).populate('followers');
  if (!profile) throw new Error('Profile not found');

  return profile;
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