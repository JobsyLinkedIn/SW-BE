import accept_decline_connection_service from '../../services/connections/accept_decline_connection_service.js';
import User from '../../models/user.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');

describe('accept_decline_connection_service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if one or both users are not found', async () => {
    User.findOne.mockResolvedValueOnce(null);

    await expect(accept_decline_connection_service('sender@example.com', 'receiver@example.com', 'accept')).rejects.toThrow('One or both users not found');
    expect(User.findOne).toHaveBeenCalledWith({ email: 'receiver@example.com' });
  });

  it('should throw an error if there is no pending request from the sender', async () => {
    const mockReceiver = { pendingRequests: [], _id: new mongoose.Types.ObjectId() };
    const mockSender = { _id: new mongoose.Types.ObjectId() };

    User.findOne.mockResolvedValueOnce(mockReceiver).mockResolvedValueOnce(mockSender);

    await expect(accept_decline_connection_service('sender@example.com', 'receiver@example.com', 'accept')).rejects.toThrow('No pending request from this user');
    expect(User.findOne).toHaveBeenCalledWith({ email: 'receiver@example.com' });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'sender@example.com' });
  });

  it('should accept a connection request successfully', async () => {
    const mockReceiver = {
      pendingRequests: [new mongoose.Types.ObjectId()],
      connections: [],
      save: jest.fn().mockResolvedValueOnce(),
      _id: new mongoose.Types.ObjectId(),
    };
    const mockSender = {
      connections: [],
      save: jest.fn().mockResolvedValueOnce(),
      _id: mockReceiver.pendingRequests[0],
    };

    User.findOne.mockResolvedValueOnce(mockReceiver).mockResolvedValueOnce(mockSender);

    const result = await accept_decline_connection_service('sender@example.com', 'receiver@example.com', 'accept');

    expect(result).toEqual({ message: 'Connection request accepted successfully' });
    expect(mockReceiver.pendingRequests).toHaveLength(0);
    expect(mockReceiver.connections).toContain(mockSender._id);
    expect(mockSender.connections).toContain(mockReceiver._id);
    expect(mockReceiver.save).toHaveBeenCalled();
    expect(mockSender.save).toHaveBeenCalled();
  });


  it('should throw an error for an invalid action', async () => {
    const mockReceiver = {
      pendingRequests: [new mongoose.Types.ObjectId()],
      _id: new mongoose.Types.ObjectId(),
    };
    const mockSender = { _id: mockReceiver.pendingRequests[0] };

    User.findOne.mockResolvedValueOnce(mockReceiver).mockResolvedValueOnce(mockSender);

    await expect(accept_decline_connection_service('sender@example.com', 'receiver@example.com', 'invalid-action')).rejects.toThrow('Invalid action. Use "accept" or "decline".');
  });
});