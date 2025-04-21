import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js'; 

const authenticateAdmin = async (req, res, next) => {
  try {

    
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ msg: 'Access Denied. No token provided.' });
    }


    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found.' });
    }


    req.admin = admin;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(403).json({ msg: 'Invalid or expired token.' });
  }
};

export default authenticateAdmin;
