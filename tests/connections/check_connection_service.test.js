import checkConnection from '../../services/connections/check_connection_service.js';
import User from '../../models/user.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');

describe('checkConnection', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return false if either user is not found', async () => {
    const from = new mongoose.Types.ObjectId();
    const to = new mongoose.Types.ObjectId();

    User.findById.mockResolvedValueOnce(null);

    const result = await checkConnection(from, to);

    expect(result).toBe(false);
    expect(User.findById).toHaveBeenCalledWith(from);
  });

  it('should return true if sender is connected to receiver', async () => {
    const from = new mongoose.Types.ObjectId();
    const to = new mongoose.Types.ObjectId();

    const mockSender = { connections: [to] };
    const mockReceiver = { connections: [] };

    User.findById.mockResolvedValueOnce(mockSender).mockResolvedValueOnce(mockReceiver);

    const result = await checkConnection(from, to);

    expect(result).toBe(true);
    expect(User.findById).toHaveBeenCalledWith(from);
    expect(User.findById).toHaveBeenCalledWith(to);
  });

  it('should return true if receiver is connected to sender', async () => {
    const from = new mongoose.Types.ObjectId();
    const to = new mongoose.Types.ObjectId();

    const mockSender = { connections: [] };
    const mockReceiver = { connections: [from] };

    User.findById.mockResolvedValueOnce(mockSender).mockResolvedValueOnce(mockReceiver);

    const result = await checkConnection(from, to);

    expect(result).toBe(true);
    expect(User.findById).toHaveBeenCalledWith(from);
    expect(User.findById).toHaveBeenCalledWith(to);
  });

  it('should return false if neither user is connected', async () => {
    const from = new mongoose.Types.ObjectId();
    const to = new mongoose.Types.ObjectId();

    const mockSender = { connections: [] };
    const mockReceiver = { connections: [] };

    User.findById.mockResolvedValueOnce(mockSender).mockResolvedValueOnce(mockReceiver);

    const result = await checkConnection(from, to);

    expect(result).toBe(false);
    expect(User.findById).toHaveBeenCalledWith(from);
    expect(User.findById).toHaveBeenCalledWith(to);
  });
});