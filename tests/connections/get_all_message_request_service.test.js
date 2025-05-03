import get_message_requests from '../../services/connections/get_all_message_request_service.js';
import MessageRequest from '../../models/messagesRequest.js';
import mongoose from 'mongoose';

jest.mock('../../models/messagesRequest.js');

describe('get_message_requests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return message requests for a valid user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const mockRequests = [
      {
        _id: new mongoose.Types.ObjectId(),
        from: { name: 'John Doe', email: 'john@example.com' },
        to: { name: 'Jane Smith', email: 'jane@example.com' },
      },
      {
        _id: new mongoose.Types.ObjectId(),
        from: { name: 'Alice Brown', email: 'alice@example.com' },
        to: { name: 'Jane Smith', email: 'jane@example.com' },
      },
    ];

    const mockPopulate = jest.fn().mockReturnThis();
    const mockExec = jest.fn().mockResolvedValueOnce(mockRequests);

    MessageRequest.find.mockReturnValueOnce({ populate: mockPopulate, exec: mockExec });

    const result = await get_message_requests(userId);

    expect(result).toEqual(mockRequests);
    expect(MessageRequest.find).toHaveBeenCalledWith({ to: userId });
    expect(mockPopulate).toHaveBeenCalledWith('from', 'name email');
    expect(mockPopulate).toHaveBeenCalledWith('to', 'name email');
    expect(mockExec).toHaveBeenCalled();
  });

  it('should throw an error if fetching message requests fails', async () => {
    const userId = new mongoose.Types.ObjectId();

    const mockPopulate = jest.fn().mockReturnThis();
    const mockExec = jest.fn().mockRejectedValueOnce(new Error('Database error'));

    MessageRequest.find.mockReturnValueOnce({ populate: mockPopulate, exec: mockExec });

    await expect(get_message_requests(userId)).rejects.toThrow('Error fetching message requests');
    expect(MessageRequest.find).toHaveBeenCalledWith({ to: userId });
    expect(mockPopulate).toHaveBeenCalledWith('from', 'name email');
    expect(mockPopulate).toHaveBeenCalledWith('to', 'name email');
    expect(mockExec).toHaveBeenCalled();
  });
});