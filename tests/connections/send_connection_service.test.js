import send_connection_request_service from '../../services/connections/send_connection_service.js';
import User from '../../models/user.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');

describe('send_connection_request_service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if one or both users are not found', async () => {
    User.findOne.mockResolvedValueOnce(null);

    await expect(send_connection_request_service('sender@example.com', 'receiver@example.com')).rejects.toThrow('One or both users not found');
    expect(User.findOne).toHaveBeenCalledWith({ email: 'sender@example.com' });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'receiver@example.com' });
  });

  it('should throw an error if users are already connected', async () => {
    const mockSender = { connections: [new mongoose.Types.ObjectId()] };
    const mockReceiver = { _id: mockSender.connections[0] };

    User.findOne.mockResolvedValueOnce(mockSender).mockResolvedValueOnce(mockReceiver);

    await expect(send_connection_request_service('sender@example.com', 'receiver@example.com')).rejects.toThrow('You are already connected');
    expect(User.findOne).toHaveBeenCalledWith({ email: 'sender@example.com' });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'receiver@example.com' });
  });
});