import blockUser from '../../services/connections/block_user_service.js';
import UserDetails from '../../models/user_details.js';
import mongoose from 'mongoose';

jest.mock('../../models/user_details.js');

describe('blockUser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should block a user successfully', async () => {
    const userId = new mongoose.Types.ObjectId();
    const targetUserId = new mongoose.Types.ObjectId();

    UserDetails.updateOne.mockResolvedValueOnce({ nModified: 1 });

    const result = await blockUser(userId, targetUserId);

    expect(result).toEqual({ nModified: 1 });
    expect(UserDetails.updateOne).toHaveBeenCalledWith(
      { user: userId },
      { $addToSet: { blockedUsers: targetUserId } }
    );
  });

  it('should throw an error if the database operation fails', async () => {
    const userId = new mongoose.Types.ObjectId();
    const targetUserId = new mongoose.Types.ObjectId();

    UserDetails.updateOne.mockRejectedValueOnce(new Error('Database error'));

    await expect(blockUser(userId, targetUserId)).rejects.toThrow('Database error');
    expect(UserDetails.updateOne).toHaveBeenCalledWith(
      { user: userId },
      { $addToSet: { blockedUsers: targetUserId } }
    );
  });
});