import getUserPrivacySetting from '../../services/privacy/get_privacy_info_service.js';
import User from '../../models/user.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');

describe('getUserPrivacySetting', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the connection privacy setting of the user', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockUser = { connectionPrivacy: 'everyone' };

    User.findById.mockResolvedValueOnce(mockUser);

    const result = await getUserPrivacySetting(mockUserId);

    expect(result).toBe('everyone');
    expect(User.findById).toHaveBeenCalledWith(mockUserId);
  });

  it('should throw an error if the user is not found', async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    User.findById.mockResolvedValueOnce(null);

    await expect(getUserPrivacySetting(mockUserId)).rejects.toThrow('User not found');
    expect(User.findById).toHaveBeenCalledWith(mockUserId);
  });

  it('should throw an error if there is a database issue', async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    User.findById.mockRejectedValueOnce(new Error('Database error'));

    await expect(getUserPrivacySetting(mockUserId)).rejects.toThrow('Database error');
    expect(User.findById).toHaveBeenCalledWith(mockUserId);
  });
});