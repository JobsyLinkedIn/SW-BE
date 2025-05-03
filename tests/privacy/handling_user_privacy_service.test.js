import updateConnectionPrivacy from '../../services/privacy/handling_user_privacy_service.js';
import User from '../../models/user.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');

describe('updateConnectionPrivacy', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update the connection privacy setting for a valid user', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockUser = { save: jest.fn().mockResolvedValueOnce(), connectionPrivacy: 'no-one' };

    User.findById.mockResolvedValueOnce(mockUser);

    const result = await updateConnectionPrivacy(mockUserId, 'everyone');

    expect(result).toEqual(mockUser);
    expect(mockUser.connectionPrivacy).toBe('everyone');
    expect(mockUser.save).toHaveBeenCalled();
    expect(User.findById).toHaveBeenCalledWith(mockUserId);
  });

  it('should throw an error if the privacy setting is invalid', async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    await expect(updateConnectionPrivacy(mockUserId, 'invalid-setting')).rejects.toThrow('Invalid privacy setting');
  });

  it('should throw an error if the user is not found', async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    User.findById.mockResolvedValueOnce(null);

    await expect(updateConnectionPrivacy(mockUserId, 'everyone')).rejects.toThrow('User not found');
    expect(User.findById).toHaveBeenCalledWith(mockUserId);
  });
});