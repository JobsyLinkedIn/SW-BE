import search_user_service from '../services/connections/search_service.js';

export const search_user = async (req, res) => {
  try {
    const { name, company, industry } = req.query;
    const users = await search_user_service(name, company, industry);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error while searching for users' }, error);
  }
};
