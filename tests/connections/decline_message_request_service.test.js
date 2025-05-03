import declineMessageRequest from '../../services/connections/decline_message_request_service.js';
import MessageRequest from '../../models/messagesRequest.js';
import mongoose from 'mongoose';

jest.mock('../../models/messagesRequest.js');

describe('declineMessageRequest', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the message request is not found', async () => {
    const requestId = new mongoose.Types.ObjectId();
    const currentUserId = new mongoose.Types.ObjectId();

    MessageRequest.findById.mockResolvedValueOnce(null);

    await expect(declineMessageRequest(requestId, currentUserId)).rejects.toThrow('Message request not found.');
    expect(MessageRequest.findById).toHaveBeenCalledWith(requestId);
  });

  it('should throw an error if the current user is not the recipient', async () => {
    const requestId = new mongoose.Types.ObjectId();
    const currentUserId = new mongoose.Types.ObjectId();
    const mockRequest = { to: new mongoose.Types.ObjectId() };

    MessageRequest.findById.mockResolvedValueOnce(mockRequest);

    await expect(declineMessageRequest(requestId, currentUserId)).rejects.toThrow('You are not authorized to decline this request.');
    expect(MessageRequest.findById).toHaveBeenCalledWith(requestId);
  });

  it('should successfully decline the message request', async () => {
    const requestId = new mongoose.Types.ObjectId();
    const currentUserId = new mongoose.Types.ObjectId();
    const mockRequest = { to: currentUserId };

    MessageRequest.findById.mockResolvedValueOnce(mockRequest);
    MessageRequest.findByIdAndDelete.mockResolvedValueOnce();

    const result = await declineMessageRequest(requestId, currentUserId);

    expect(result).toEqual({ message: 'Message request declined successfully.' });
    expect(MessageRequest.findById).toHaveBeenCalledWith(requestId);
    expect(MessageRequest.findByIdAndDelete).toHaveBeenCalledWith(requestId);
  });
});