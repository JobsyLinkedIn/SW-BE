import jwt from 'jsonwebtoken';
export const getUserIdFromToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userId;
};
