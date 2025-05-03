import getBlockedUsers from '../../services/connections/get_blocked_list_service.js';
import UserDetails from '../../models/user_details.js';
import mongoose from 'mongoose';

jest.mock('../../models/user_details.js');

describe('getBlockedUsers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the list of blocked users for a valid user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const mockBlockedUsers = [
      { _id: new mongoose.Types.ObjectId(), name: 'John Doe', email: 'john@example.com' },
      { _id: new mongoose.Types.ObjectId(), name: 'Jane Smith', email: 'jane@example.com' },
    ];

    UserDetails.findOne.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce({ blockedUsers: mockBlockedUsers }),
    });

    const result = await getBlockedUsers(userId);

    expect(result).toEqual(mockBlockedUsers);
    expect(UserDetails.findOne).toHaveBeenCalledWith({ user: userId });
  });

  it('should throw an error if the user is not found', async () => {
    const userId = new mongoose.Types.ObjectId();

    UserDetails.findOne.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce(null),
    });

    await expect(getBlockedUsers(userId)).rejects.toThrow('User not found');
    expect(UserDetails.findOne).toHaveBeenCalledWith({ user: userId });
  });

  it('should throw an error if there is a database issue', async () => {
    const userId = new mongoose.Types.ObjectId();

    UserDetails.findOne.mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    await expect(getBlockedUsers(userId)).rejects.toThrow('Error retrieving blocked users: Database error');
    expect(UserDetails.findOne).toHaveBeenCalledWith({ user: userId });
  });
});