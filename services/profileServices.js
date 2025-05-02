import Profile from '../models/profileModel.js';

const getProfile = async (req) => {
  const userId = req.user._id; 
  const profile = await Profile.findOne({ userId })
    .populate('followers') 
    .populate('workExperience') 
    .populate('education'); 

  if (!profile) throw new Error('Profile not found');

  return {profile};
};

const createOrUpdateProfile = async (req, profileData) => {
  const { name, bio, location } = profileData;
  const userId = req.user._id; 
  let profile = await Profile.findOne({ userId });

  if (profile) {
    profile.name = name;
    profile.bio = bio;
    profile.location = location;
  } else {
    profile = new Profile({ userId, name, bio, location });
  }

  await profile.save();
  return { profile, message: 'Profile created/updated successfully' };
};

const uploadProfilePicture = async (req) => {
  const userId = req.user._id; 
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
  const userId = req.user._id; 
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.profilePicture = null;
  await profile.save();
  return { message: 'Profile picture deleted successfully' };
};

const uploadCoverPhoto = async (req) => {
  const userId = req.user._id; 
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  if (!req.mediaFilesData || req.mediaFilesData.length === 0) {
    throw new Error('No file uploaded');
  }

  const uploadedFile = req.mediaFilesData[0];
  profile.coverPhoto = uploadedFile.secure_url;
  await profile.save();
  return { message: 'Cover photo uploaded successfully',coverPhoto: profile.coverPhoto };
};

const deleteCoverPhoto = async (req) => {
  const userId = req.user._id; 
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.coverPhoto = null;
  await profile.save();
  return { message: 'Cover photo deleted successfully'};
};

const uploadResume = async (req) => {
  const userId = req.user._id; 
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  if (!req.mediaFilesData || req.mediaFilesData.length === 0) {
    throw new Error('No file uploaded');
  }

  const uploadedFile = req.mediaFilesData[0];
  profile.resume = uploadedFile.secure_url;
  await profile.save();
  return { message: 'Resume uploaded successfully'};
};

const addWorkExperience = async (req, workExperienceData) => {
  const userId = req.user._id; 
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.workExperience.push(workExperienceData);
  await profile.save();
  return { message: 'Work experience added successfully' };
};

const addEducation = async (req, educationData) => {
  const userId = req.user._id; 
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.education.push(educationData);
  await profile.save();
  return { message: 'Education added successfully'};
};

const addSkills = async (req, skillsData) => {
  const userId = req.user._id; 
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  if (!Array.isArray(skillsData)) {
    throw new Error('skillsData must be an array');
  }

  profile.skills.push(...skillsData); 
  await profile.save();
  return { message: 'Skills added successfully'};
};

const updatePrivacySettings = async (req, privacySettings) => {
  const userId = req.user._id; 
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.privacySettings = privacySettings;
  await profile.save();
  return { message: 'Privacy settings updated successfully' };
};

const viewUserProfile = async (req) => {
  try {
    const { name } = req.query;
    if (!name) {
      throw new Error('The "name" query parameter is required');
    }
    const profile = await Profile.findOne({ name }).populate('followers');
    if (!profile) {
      throw new Error('Profile not found');
    }

    return { profile, message: 'User profile retrieved successfully' };
  } catch (error) {
    console.error('Error in viewUserProfile:', error.message);
    throw new Error(error.message);
  }
};

const deleteWorkExperience = async (req, workExperienceId) => {
  const userId = req.user._id; 
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.workExperience = profile.workExperience.filter(
    (experience) => experience._id.toString() !== workExperienceId
  );

  await profile.save();
  return { message: 'Work experience deleted successfully' };
};

const deleteEducation = async (req, educationId) => {
  const userId = req.user._id; 
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  profile.education = profile.education.filter(
    (education) => education._id.toString() !== educationId
  );

  await profile.save();
  return { message: 'Education deleted successfully'};
};

const deleteSkills = async (req, skillsToDelete) => {
  const userId = req.user._id; 
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

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
  getProfile,
};
