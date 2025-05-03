import sendConnectionRequest from '../../services/privacy/connection_privacy_service.js';
import User from '../../models/user.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');

describe('sendConnectionRequest', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if sender or target user is not found', async () => {
    const senderId = new mongoose.Types.ObjectId();
    const targetId = new mongoose.Types.ObjectId();

    User.findById.mockResolvedValueOnce(null);

    await expect(sendConnectionRequest(senderId, targetId)).rejects.toThrow('User not found');
    expect(User.findById).toHaveBeenCalledWith(senderId);
  });

  it('should return false if target user has connection privacy set to no-one', async () => {
    const senderId = new mongoose.Types.ObjectId();
    const targetId = new mongoose.Types.ObjectId();

    const mockTarget = { connectionPrivacy: 'no-one' };

    User.findById.mockResolvedValueOnce({}).mockResolvedValueOnce(mockTarget);

    const result = await sendConnectionRequest(senderId, targetId);

    expect(result).toBe(false);
    expect(User.findById).toHaveBeenCalledWith(senderId);
    expect(User.findById).toHaveBeenCalledWith(targetId);
  });

  it('should throw an error if connection request is already sent', async () => {
    const senderId = new mongoose.Types.ObjectId();
    const targetId = new mongoose.Types.ObjectId();

    const mockTarget = {
      connectionPrivacy: 'everyone',
      pendingRequests: [senderId],
    };

    User.findById.mockResolvedValueOnce({}).mockResolvedValueOnce(mockTarget);

    await expect(sendConnectionRequest(senderId, targetId)).rejects.toThrow('Connection request already sent');
  });

  it('should add sender to target pending requests if privacy is everyone', async () => {
    const senderId = new mongoose.Types.ObjectId();
    const targetId = new mongoose.Types.ObjectId();

    const mockTarget = {
      connectionPrivacy: 'everyone',
      pendingRequests: [],
      connections: [],
      save: jest.fn().mockResolvedValueOnce(),
    };

    User.findById.mockResolvedValueOnce({}).mockResolvedValueOnce(mockTarget);

    const result = await sendConnectionRequest(senderId, targetId);

    expect(result).toBe(true);
    expect(mockTarget.pendingRequests).toContain(senderId);
    expect(mockTarget.save).toHaveBeenCalled();
  });
});