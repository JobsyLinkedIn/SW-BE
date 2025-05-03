import createMessageRequest from '../../services/connections/message_request_for_nonconnections_service.js';
import MessageRequest from '../../models/messagesRequest.js';
import checkConnection from '../../services/connections/check_connection_service.js';
import mongoose from 'mongoose';

jest.mock('../../models/messagesRequest.js');
jest.mock('../../services/connections/check_connection_service.js');

describe('createMessageRequest', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the sender and recipient are the same', async () => {
    const userId = new mongoose.Types.ObjectId();

    await expect(createMessageRequest(userId, userId, 'Hello!')).rejects.toThrow('You cannot send a message request to yourself.');
  });

  it('should throw an error if the users are already connected', async () => {
    const from = new mongoose.Types.ObjectId();
    const to = new mongoose.Types.ObjectId();

    checkConnection.mockResolvedValueOnce(true);

    await expect(createMessageRequest(from, to, 'Hello!')).rejects.toThrow('You are already connected with this user.');
    expect(checkConnection).toHaveBeenCalledWith(from, to);
  });

  it('should create a message request successfully', async () => {
    const from = new mongoose.Types.ObjectId();
    const to = new mongoose.Types.ObjectId();
    const content = 'Hello!';

    checkConnection.mockResolvedValueOnce(false);
    const mockRequest = { from, to, content };
    MessageRequest.create.mockResolvedValueOnce(mockRequest);

    const result = await createMessageRequest(from, to, content);

    expect(result).toEqual(mockRequest);
    expect(checkConnection).toHaveBeenCalledWith(from, to);
    expect(MessageRequest.create).toHaveBeenCalledWith({ from, to, content });
  });
});