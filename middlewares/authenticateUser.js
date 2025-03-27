import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const authenticateUser = async (req, res, next) => {
  try {
    let token;
    //  (Local/Session Storage)
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Cookie
    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    if (!token){
    return res.status(401).json({ msg: "Access Denied. No token provided." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
        return res.status(404).json({ msg: "User not found." });
    }

    req.user = user;
    next(); 
  } catch (error) {
    return res.status(403).json({ msg: "Invalid or expired token." });
  }
};

export default authenticateUser;
