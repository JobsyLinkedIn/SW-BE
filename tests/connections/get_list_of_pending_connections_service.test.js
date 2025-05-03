import get_pending_requests_service from '../../services/connections/get_list_of_pending_connections_service.js';
import User from '../../models/user.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');

describe('get_pending_requests_service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the list of pending connection requests for a valid user', async () => {
    const userEmail = 'test@example.com';
    const mockPendingRequests = [
      { _id: new mongoose.Types.ObjectId(), name: 'John Doe', email: 'john@example.com' },
      { _id: new mongoose.Types.ObjectId(), name: 'Jane Smith', email: 'jane@example.com' },
    ];

    User.findOne.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce({ pendingRequests: mockPendingRequests }),
    });

    const result = await get_pending_requests_service(userEmail);

    expect(result).toEqual({ pendingRequests: mockPendingRequests });
    expect(User.findOne).toHaveBeenCalledWith({ email: userEmail });
  });

  it('should throw an error if the user is not found', async () => {
    const userEmail = 'test@example.com';

    User.findOne.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce(null),
    });

    await expect(get_pending_requests_service(userEmail)).rejects.toThrow('User not found');
    expect(User.findOne).toHaveBeenCalledWith({ email: userEmail });
  });

  it('should throw an error if there is a database issue', async () => {
    const userEmail = 'test@example.com';

    User.findOne.mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    await expect(get_pending_requests_service(userEmail)).rejects.toThrow('Database error');
    expect(User.findOne).toHaveBeenCalledWith({ email: userEmail });
  });
});