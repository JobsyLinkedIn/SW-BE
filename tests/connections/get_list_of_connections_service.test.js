import get_connections_service from '../../services/connections/get_list_of_connections_service.js';
import User from '../../models/user.js';
import mongoose from 'mongoose';

jest.mock('../../models/user.js');

describe('get_connections_service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the list of connections for a valid user', async () => {
    const userEmail = 'test@example.com';
    const mockConnections = [
      { _id: new mongoose.Types.ObjectId(), name: 'John Doe', email: 'john@example.com', profilePicture: 'john.jpg' },
      { _id: new mongoose.Types.ObjectId(), name: 'Jane Smith', email: 'jane@example.com', profilePicture: 'jane.jpg' },
    ];

    User.findOne.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce({ connections: mockConnections }),
    });

    const result = await get_connections_service(userEmail);

    expect(result).toEqual({ connections: mockConnections });
    expect(User.findOne).toHaveBeenCalledWith({ email: userEmail });
  });

  it('should throw an error if the user is not found', async () => {
    const userEmail = 'test@example.com';

    User.findOne.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce(null),
    });

    await expect(get_connections_service(userEmail)).rejects.toThrow('User not found');
    expect(User.findOne).toHaveBeenCalledWith({ email: userEmail });
  });

  it('should throw an error if there is a database issue', async () => {
    const userEmail = 'test@example.com';

    User.findOne.mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    await expect(get_connections_service(userEmail)).rejects.toThrow('Database error');
    expect(User.findOne).toHaveBeenCalledWith({ email: userEmail });
  });
});