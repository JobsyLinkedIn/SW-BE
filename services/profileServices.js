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

const addWorkExperience = async (req, workExperienceData) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.workExperience.push(workExperienceData);
  await profile.save();
  return profile;
};

const addEducation = async (req, educationData) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.education.push(educationData);
  await profile.save();
  return profile;
};

const addSkills = async (req, skillsData) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  // Validate that skillsData is an array
  if (!Array.isArray(skillsData)) {
    throw new Error('skillsData must be an array');
  }

  profile.skills.push(...skillsData); // Spread operator to add multiple skills
  await profile.save();
  return profile;
};

const updatePrivacySettings = async (req, privacySettings) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.privacySettings = privacySettings;
  await profile.save();
  return profile;
};

const viewUserProfile = async (req) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId }).populate('followers');
  if (!profile) throw new Error('Profile not found');

  return profile;
};

const followUser = async (req, targetUserId) => {
  const userId = req.user._id; // Use user from middleware
  const targetProfile = await Profile.findOne({ userId: targetUserId });
  if (!targetProfile) throw new Error('Target user not found');

  if (!targetProfile.followers.includes(userId)) {
    targetProfile.followers.push(userId);
    await targetProfile.save();
  }

  return targetProfile;
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