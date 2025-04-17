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
  return { message: 'Profile created or updated successfully'};
};

const uploadProfilePicture = async (req) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  if (!req.mediaFilesData || req.mediaFilesData.length === 0) {
    throw new Error('No file uploaded');
  }

  const uploadedFile = req.mediaFilesData[0]; 
  profile.profilePicture = uploadedFile.secure_url;
  await profile.save();
  return { message: 'Profile picture uploaded successfully',profilePicture: profile.profilePicture};
};


const deleteProfilePicture = async (req) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.profilePicture = null;
  await profile.save();
  return { message: 'Profile picture deleted successfully' };
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
  return { message: 'Cover photo uploaded successfully',coverPhoto: profile.coverPhoto };
};

const deleteCoverPhoto = async (req) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.coverPhoto = null;
  await profile.save();
  return { message: 'Cover photo deleted successfully'};
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
  return { message: 'Resume uploaded successfully'};
};

const addWorkExperience = async (req, workExperienceData) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.workExperience.push(workExperienceData);
  await profile.save();
  return { message: 'Work experience added successfully' };
};

const addEducation = async (req, educationData) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.education.push(educationData);
  await profile.save();
  return { message: 'Education added successfully'};
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
  return { message: 'Skills added successfully'};
};

const updatePrivacySettings = async (req, privacySettings) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.privacySettings = privacySettings;
  await profile.save();
  return { message: 'Privacy settings updated successfully' };
};

const viewUserProfile = async (req) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId }).populate('followers');
  if (!profile) throw new Error('Profile not found');

  return { message: 'User profile retrieved successfully' };
};

const followUser = async (req, targetUserId) => {
  const userId = req.user._id; // Use user from middleware
  const targetProfile = await Profile.findOne({ userId: targetUserId });
  if (!targetProfile) throw new Error('Target user not found');

  if (!targetProfile.followers.includes(userId)) {
    targetProfile.followers.push(userId);
    await targetProfile.save();
  }

  return { message: 'User followed successfully' };
};

const deleteWorkExperience = async (req, workExperienceId) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  // Filter out the work experience with the given ID
  profile.workExperience = profile.workExperience.filter(
    (experience) => experience._id.toString() !== workExperienceId
  );

  await profile.save();
  return { message: 'Work experience deleted successfully' };
};

const deleteEducation = async (req, educationId) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  // Filter out the education with the given ID
  profile.education = profile.education.filter(
    (education) => education._id.toString() !== educationId
  );

  await profile.save();
  return { message: 'Education deleted successfully'};
};

const deleteSkills = async (req, skillsToDelete) => {
  const userId = req.user._id; // Use user from middleware
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  // Remove the specified skills from the profile
  profile.skills = profile.skills.filter(
    (skill) => !skillsToDelete.includes(skill)
  );


  await profile.save();
  return { message: 'Skills deleted successfully', };
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
};