import acceptMessageRequest from '../../services/connections/accept_message_request_service.js';
import MessageRequest from '../../models/messagesRequest.js';
import { Message } from '../../models/message.js';
import { Conversation } from '../../models/conversation.js';
import mongoose from 'mongoose';

jest.mock('../../models/messagesRequest.js');
jest.mock('../../models/message.js');
jest.mock('../../models/conversation.js');

describe('acceptMessageRequest', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the message request is not found', async () => {
    const requestId = new mongoose.Types.ObjectId();
    const currentUserId = new mongoose.Types.ObjectId();

    MessageRequest.findById.mockResolvedValueOnce(null);

    await expect(acceptMessageRequest(requestId, currentUserId)).rejects.toThrow('Message request not found.');
    expect(MessageRequest.findById).toHaveBeenCalledWith(requestId);
  });

  it('should throw an error if the current user is not the recipient', async () => {
    const requestId = new mongoose.Types.ObjectId();
    const currentUserId = new mongoose.Types.ObjectId();
    const mockRequest = { to: new mongoose.Types.ObjectId() };

    MessageRequest.findById.mockResolvedValueOnce(mockRequest);

    await expect(acceptMessageRequest(requestId, currentUserId)).rejects.toThrow('You are not authorized to accept this request.');
    expect(MessageRequest.findById).toHaveBeenCalledWith(requestId);
  });

  it('should use an existing conversation and accept the message request', async () => {
    const requestId = new mongoose.Types.ObjectId();
    const currentUserId = new mongoose.Types.ObjectId();
    const mockRequest = {
      to: currentUserId,
      from: new mongoose.Types.ObjectId(),
      content: 'Hello!',
      isBlocked: true,
    };
    const mockConversation = { _id: new mongoose.Types.ObjectId(), participants: [mockRequest.from, mockRequest.to] };
    const mockMessage = { _id: new mongoose.Types.ObjectId(), content: mockRequest.content };

    MessageRequest.findById.mockResolvedValueOnce(mockRequest);
    Conversation.findOne.mockResolvedValueOnce(mockConversation);
    Message.create.mockResolvedValueOnce(mockMessage);
    Conversation.findByIdAndUpdate.mockResolvedValueOnce();
    MessageRequest.findByIdAndDelete.mockResolvedValueOnce();

    const result = await acceptMessageRequest(requestId, currentUserId);

    expect(result).toEqual({
      message: 'Message request accepted and added to messages.',
      newMessage: mockMessage,
      conversation: mockConversation,
    });
    expect(MessageRequest.findById).toHaveBeenCalledWith(requestId);
    expect(Conversation.findOne).toHaveBeenCalledWith({
      participants: { $all: [mockRequest.from, mockRequest.to] },
    });
    expect(Message.create).toHaveBeenCalledWith({
      conversationId: mockConversation._id,
      sender: mockRequest.from,
      receiver: mockRequest.to,
      content: mockRequest.content,
    });
    expect(Conversation.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(MessageRequest.findByIdAndDelete).toHaveBeenCalledWith(requestId);
  });
});