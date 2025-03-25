import Profile from '../models/profileModel.js';
import jwt from 'jsonwebtoken';

const getUserIdFromToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userId;
};

const createOrUpdateProfile = async (token, profileData) => {
  const { name, bio, location } = profileData;
  const userId = getUserIdFromToken(token);
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

const uploadProfilePicture = async (token, profilePicture) => {
  const userId = getUserIdFromToken(token);
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.profilePicture = profilePicture.path;
  await profile.save();
  return profile;
};

const deleteProfilePicture = async (token) => {
  const userId = getUserIdFromToken(token);
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.profilePicture = null;
  await profile.save();
  return profile;
};

const uploadCoverPhoto = async (token, coverPhoto) => {
  const userId = getUserIdFromToken(token);
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.coverPhoto = coverPhoto.path;
  await profile.save();
  return profile;
};

const deleteCoverPhoto = async (token) => {
  const userId = getUserIdFromToken(token);
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.coverPhoto = null;
  await profile.save();
  return profile;
};

const uploadResume = async (token, resume) => {
  const userId = getUserIdFromToken(token);
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.resume = resume.path;
  await profile.save();
  return profile;
};

const addWorkExperience = async (token, workExperience) => {
  const userId = getUserIdFromToken(token);
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  if (workExperience) {
    profile.workExperience.push(workExperience);
  }
  await profile.save();
  return profile;
};

const addEducation = async (token, education) => {
  const userId = getUserIdFromToken(token);
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.education.push(education);
  await profile.save();
  return profile;
};

const addSkills = async (token, skills) => {
  const userId = getUserIdFromToken(token);
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.skills.push(...skills);
  await profile.save();
  return profile;
};

const updatePrivacySettings = async (token, privacySettings) => {
  const userId = getUserIdFromToken(token);
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.privacySettings = privacySettings;
  await profile.save();
  return profile;
};

const viewUserProfile = async (token) => {
  const userId = getUserIdFromToken(token);
  const profile = await Profile.findOne({ userId }).populate('followers');
  if (!profile) throw new Error('Profile not found');

  return profile;
};

const followUser = async (token, followUserToken) => {
  const userId = getUserIdFromToken(token);
  const followUserId = getUserIdFromToken(followUserToken);
  const profile = await Profile.findOne({ userId });
  const followProfile = await Profile.findOne({ userId: followUserId });

  if (!profile || !followProfile) throw new Error('Profile not found');

  if (!profile.followers.includes(followUserId)) {
    profile.followers.push(followUserId);
    await profile.save();
  }

  return profile;
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
