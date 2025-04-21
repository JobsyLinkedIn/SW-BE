import { createAdmin, loginAdmin } from '../services/adminServices.js';

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;

    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY)
      return res.status(403).json({ message: 'Invalid admin key' });

    const admin = await createAdmin({ name, email, password });

    res.status(201).json({ message: 'Admin registered', admin: { name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { msg, token, admin } = await loginAdmin({ email, password });

    res.status(200).json({
      message: msg,
      token
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
