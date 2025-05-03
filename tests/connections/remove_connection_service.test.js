import remove_connection_service from '../../services/connections/remove_connection_service.js';
import User from '../../models/user.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');

describe('remove_connection_service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if one or both users are not found', async () => {
    User.findOne.mockResolvedValueOnce(null);

    await expect(remove_connection_service('sender@example.com', 'receiver@example.com')).rejects.toThrow('One or both users not found');
    expect(User.findOne).toHaveBeenCalledWith({ email: 'sender@example.com' });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'receiver@example.com' });
  });

  it('should throw an error if users are not connected', async () => {
    const mockSender = { connections: [new mongoose.Types.ObjectId()] };
    const mockReceiver = { _id: new mongoose.Types.ObjectId() };

    User.findOne.mockResolvedValueOnce(mockSender).mockResolvedValueOnce(mockReceiver);

    await expect(remove_connection_service('sender@example.com', 'receiver@example.com')).rejects.toThrow('Users are not connected');
    expect(User.findOne).toHaveBeenCalledWith({ email: 'sender@example.com' });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'receiver@example.com' });
  });

  it('should remove the connection successfully', async () => {
    const mockReceiverId = new mongoose.Types.ObjectId();
    const mockSender = {
      connections: [mockReceiverId],
      save: jest.fn().mockResolvedValueOnce(),
    };
    const mockReceiver = {
      _id: mockReceiverId,
      connections: [new mongoose.Types.ObjectId()],
      save: jest.fn().mockResolvedValueOnce(),
    };

    User.findOne.mockResolvedValueOnce(mockSender).mockResolvedValueOnce(mockReceiver);

    const result = await remove_connection_service('sender@example.com', 'receiver@example.com');

    expect(result).toEqual({ message: 'Connection removed successfully' });
    expect(mockSender.connections).not.toContain(mockReceiverId);
    expect(mockReceiver.connections).not.toContain(mockSender._id);
    expect(mockSender.save).toHaveBeenCalled();
    expect(mockReceiver.save).toHaveBeenCalled();
  });
});