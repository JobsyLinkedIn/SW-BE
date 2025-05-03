import search_user_service from '../../services/connections/search_service.js';
import User from '../../models/user.js';
import UserDetails from '../../models/user_details.js';
import Company from '../../models/company.js';

jest.mock('../../models/user.js');
jest.mock('../../models/user_details.js');
jest.mock('../../models/company.js');

describe('search_user_service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return users matching the name', async () => {
    const mockUsers = [
      { _id: '1', name: 'John Doe' },
      { _id: '2', name: 'Jane Doe' },
    ];

    User.find.mockResolvedValueOnce(mockUsers);

    const result = await search_user_service('Doe', null, null);

    expect(result).toEqual(mockUsers);
    expect(User.find).toHaveBeenCalledWith({ $or: [{ name: /Doe/i }] });
  });

  it('should return users following a specific company', async () => {
    const mockCompany = { followers: ['1', '2'] };
    const mockUsers = [
      { _id: '1', name: 'John Doe' },
      { _id: '2', name: 'Jane Doe' },
    ];

    Company.findOne.mockResolvedValueOnce(mockCompany);
    User.find.mockResolvedValueOnce(mockUsers);

    const result = await search_user_service(null, 'TechCorp', null);

    expect(result).toEqual(mockUsers);
    expect(Company.findOne).toHaveBeenCalledWith({ name: /TechCorp/i });
    expect(User.find).toHaveBeenCalledWith({ $or: [{ _id: { $in: mockCompany.followers } }] });
  });

  it('should return users matching the industry', async () => {
    const mockUserDetails = [
      { user: '1' },
      { user: '2' },
    ];
    const mockUsers = [
      { _id: '1', name: 'John Doe' },
      { _id: '2', name: 'Jane Doe' },
    ];

    UserDetails.find.mockResolvedValueOnce(mockUserDetails);
    User.find.mockResolvedValueOnce(mockUsers);

    const result = await search_user_service(null, null, 'Engineering');

    expect(result).toEqual(mockUsers);
    expect(UserDetails.find).toHaveBeenCalledWith({ industry: /Engineering/i });
    expect(User.find).toHaveBeenCalledWith({ $or: [{ _id: { $in: ['1', '2'] } }] });
  });

  it('should return an empty array if no company is found', async () => {
    Company.findOne.mockResolvedValueOnce(null);

    const result = await search_user_service(null, 'NonExistentCompany', null);

    expect(result).toEqual([]);
    expect(Company.findOne).toHaveBeenCalledWith({ name: /NonExistentCompany/i });
  });

  it('should handle multiple query parameters', async () => {
    const mockCompany = { followers: ['1'] };
    const mockUserDetails = [{ user: '2' }];
    const mockUsers = [
      { _id: '1', name: 'John Doe' },
      { _id: '2', name: 'Jane Doe' },
    ];

    Company.findOne.mockResolvedValueOnce(mockCompany);
    UserDetails.find.mockResolvedValueOnce(mockUserDetails);
    User.find.mockResolvedValueOnce(mockUsers);

    const result = await search_user_service('Doe', 'TechCorp', 'Engineering');

    expect(result).toEqual(mockUsers);
    expect(Company.findOne).toHaveBeenCalledWith({ name: /TechCorp/i });
    expect(UserDetails.find).toHaveBeenCalledWith({ industry: /Engineering/i });
    expect(User.find).toHaveBeenCalledWith({
      $or: [
        { name: /Doe/i },
        { _id: { $in: mockCompany.followers } },
        { _id: { $in: ['2'] } },
      ],
    });
  });
});