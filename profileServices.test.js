import Profile from 'C:/Users/20102/Desktop/SW-BE/models/profileModel.js';
import * as profileServices from 'C:/Users/20102/Desktop/SW-BE/services/profileServices.js';

jest.mock('C:/Users/20102/Desktop/SW-BE/models/profileModel.js');


describe('Profile Services', () => {
  const mockUserId = 'mockUserId';
  const mockProfile = {
    userId: mockUserId,
    name: 'John Doe',
    bio: 'Software Engineer',
    location: 'New York',
    workExperience: [],
    education: [],
    skills: [],
    privacySettings: {},
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return the profile if found', async () => {
      const mockPopulate = jest.fn().mockReturnThis(); // Mock chainable populate
      Profile.findOne.mockReturnValue({
        populate: mockPopulate.mockReturnValueOnce({
          populate: mockPopulate.mockReturnValueOnce({
            populate: mockPopulate.mockResolvedValueOnce(mockProfile),
          }),
        }),
      });
  
      const req = { user: { _id: mockUserId } };
      const result = await profileServices.getProfile(req);
  
      expect(result.profile).toEqual(mockProfile);
      expect(Profile.findOne).toHaveBeenCalledWith({ userId: mockUserId });
      expect(mockPopulate).toHaveBeenCalledWith('followers');
      expect(mockPopulate).toHaveBeenCalledWith('workExperience');
      expect(mockPopulate).toHaveBeenCalledWith('education');
    });
  
    it('should throw an error if profile is not found', async () => {
      const mockPopulate = jest.fn().mockReturnThis(); // Mock chainable populate
      Profile.findOne.mockReturnValue({
        populate: mockPopulate.mockReturnValueOnce({
          populate: mockPopulate.mockReturnValueOnce({
            populate: mockPopulate.mockResolvedValueOnce(null),
          }),
        }),
      });
  
      const req = { user: { _id: mockUserId } };
      await expect(profileServices.getProfile(req)).rejects.toThrow('Profile not found');
    });
  });

  describe('createOrUpdateProfile', () => {
    it('should update an existing profile', async () => {
      Profile.findOne.mockResolvedValue(mockProfile);
      const req = { user: { _id: mockUserId } };
      const profileData = { name: 'Jane Doe', bio: 'Designer', location: 'San Francisco' };
      const result = await profileServices.createOrUpdateProfile(req, profileData);
      expect(mockProfile.name).toBe('Jane Doe');
      expect(mockProfile.bio).toBe('Designer');
      expect(mockProfile.location).toBe('San Francisco');
      expect(mockProfile.save).toHaveBeenCalled();
      expect(result.message).toBe('Profile created/updated successfully');
    });

    it('should create a new profile if none exists', async () => {
      Profile.findOne.mockResolvedValue(null);
      Profile.mockImplementation(() => mockProfile);
      const req = { user: { _id: mockUserId } };
      const profileData = { name: 'Jane Doe', bio: 'Designer', location: 'San Francisco' };
      const result = await profileServices.createOrUpdateProfile(req, profileData);
      expect(mockProfile.name).toBe('Jane Doe');
      expect(mockProfile.bio).toBe('Designer');
      expect(mockProfile.location).toBe('San Francisco');
      expect(mockProfile.save).toHaveBeenCalled();
      expect(result.message).toBe('Profile created/updated successfully');
    });
  });

  describe('uploadProfilePicture', () => {
    it('should upload a profile picture', async () => {
      Profile.findOne.mockResolvedValue(mockProfile);
      const req = {
        user: { _id: mockUserId },
        mediaFilesData: [{ secure_url: 'http://example.com/picture.jpg' }],
      };
      const result = await profileServices.uploadProfilePicture(req);
      expect(mockProfile.profilePicture).toBe('http://example.com/picture.jpg');
      expect(mockProfile.save).toHaveBeenCalled();
      expect(result.message).toBe('Profile picture uploaded successfully');
    });

    it('should throw an error if no file is uploaded', async () => {
      Profile.findOne.mockResolvedValue(mockProfile);
      const req = { user: { _id: mockUserId }, mediaFilesData: [] };
      await expect(profileServices.uploadProfilePicture(req)).rejects.toThrow('No file uploaded');
    });
  });

  describe('deleteProfilePicture', () => {
    it('should delete the profile picture', async () => {
      Profile.findOne.mockResolvedValue(mockProfile);
      const req = { user: { _id: mockUserId } };
      const result = await profileServices.deleteProfilePicture(req);
      expect(mockProfile.profilePicture).toBeNull();
      expect(mockProfile.save).toHaveBeenCalled();
      expect(result.message).toBe('Profile picture deleted successfully');
    });
  });

  describe('addWorkExperience', () => {
    it('should add work experience', async () => {
      Profile.findOne.mockResolvedValue(mockProfile);
      const req = { user: { _id: mockUserId } };
      const workExperienceData = { company: 'Company A', position: 'Developer' };
      const result = await profileServices.addWorkExperience(req, workExperienceData);
      expect(mockProfile.workExperience).toContainEqual(workExperienceData);
      expect(mockProfile.save).toHaveBeenCalled();
      expect(result.message).toBe('Work experience added successfully');
    });
  });

  describe('deleteWorkExperience', () => {
    it('should delete work experience by ID', async () => {
      const workExperienceId = 'mockWorkExperienceId';
      mockProfile.workExperience = [{ _id: workExperienceId, company: 'Company A' }];
      Profile.findOne.mockResolvedValue(mockProfile);
      const req = { user: { _id: mockUserId } };
      const result = await profileServices.deleteWorkExperience(req, workExperienceId);
      expect(mockProfile.workExperience).toHaveLength(0);
      expect(mockProfile.save).toHaveBeenCalled();
      expect(result.message).toBe('Work experience deleted successfully');
    });
  });

  // Add similar tests for other functions like uploadCoverPhoto, deleteCoverPhoto, uploadResume, addEducation, deleteEducation, addSkills, deleteSkills, etc.
});