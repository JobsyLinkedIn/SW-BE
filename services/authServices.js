import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import transporter from '../config/email.js';
import axios from 'axios';

import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleSignIn = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name } = payload;

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ name, email, isVerified: true });
    await user.save();
  }

  const jwtToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return { msg: 'Google Sign-In successful', token: jwtToken };
};

const verifyCaptcha = async (captchaToken) => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET;
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: secretKey,
        response: captchaToken,
      },
    });

    return response.data.success;
  } catch (error) {
    console.error('CAPTCHA Verification Error:', error);
    return false;
  }
};

const registerUser = async ({ name, email, password }) => {
  let user = await User.findOne({ email });
  if (user) throw new Error('Email already in use');

  const hashedPassword = await bcrypt.hash(password, 10);

  user = new User({ name, email, password: hashedPassword });
  await user.save();

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"Jobsy Support Team" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: '🔹 Jobsy - Email Verification Required 🔹',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0073e6;">Welcome to Jobsy! 🚀</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for signing up with Jobsy! To complete your registration and access all features, please verify your email address.</p>
        <p>Click the button below to verify your account:</p>
        <p style="text-align: center;">
          <a href="${verifyLink}" 
             style="background-color: #0073e6; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">
             Verify My Email
          </a>
        </p>
        <p>If you did not create this account, please ignore this email.</p>
        <hr>
        <p style="font-size: 14px; color: gray;">
          Best Regards, <br>
          <strong>Karim Mohamed</strong> <br>
          Backend Engineer | Jobsy <br>
          Need help? Contact us at <a href="mailto:jobsy.notifications@gmail.com">jobsy.notifications@gmail.com</a>
        </p>
      </div>
    `,
  });

  return { msg: 'User registered. Please check your email to verify.' };
};

const verifyEmail = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ email: decoded.email });

  if (!user) throw new Error('Invalid token or user does not exist');
  if (user.isVerified) throw new Error('Email already verified');

  user.isVerified = true;
  await user.save();

  return { msg: 'Email verified successfully!' };
};

const loginUser = async ({ email, password }) => {
  let user = await User.findOne({ email });
  if (!user) throw new Error('Login failed. Make sure your email and password are correct');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Login failed. Make sure your email and password are correct');

  const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return { msg: 'Logged in successfully', token };
};

const resendConfirmationEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error('User not found');
  if (user.isVerified) throw new Error('Email already verified');

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Jobsy Support Team" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: '🔹 Jobsy - Email Verification Required 🔹',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0073e6;">Welcome to Jobsy! 🚀</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for signing up with Jobsy! To complete your registration and access all features, please verify your email address.</p>
        <p>Click the button below to verify your account:</p>
        <p style="text-align: center;">
          <a href="${verifyLink}" 
             style="background-color: #0073e6; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">
             Verify My Email
          </a>
        </p>
        <p>If you did not create this account, please ignore this email.</p>
        <hr>
        <p style="font-size: 14px; color: gray;">
          Best Regards, <br>
          <strong>Karim Mohamed</strong> <br>
          Backend Engineer | Jobsy <br>
          Need help? Contact us at <a href="mailto:jobsy.notifications@gmail.com">jobsy.notifications@gmail.com</a>
        </p>
      </div>
    `,
  });

  return { msg: 'Verification email sent again. Please check your inbox.' };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const resetLink = `${process.env.BACKEND_URL}/api/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔑 Jobsy - Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0073e6;">Reset Your Password 🔑</h2>
        <p>Dear ${user.name},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p style="text-align: center;">
          <a href="${resetLink}" 
             style="background-color: #0073e6; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">
             Reset Password
          </a>
        </p>
        <p>This link will expire in 15 minutes. If you did not request this, please ignore this email.</p>
        <hr>
        <p style="font-size: 14px; color: gray;">
          Best Regards, <br>
          <strong>Karim Mohamed</strong> <br>
          Backend Engineer | Jobsy <br>
          Need help? Contact us at <a href="mailto:support@jobsy.com">support@jobsy.com</a>
        </p>
      </div>
    `,
  });

  return { msg: 'Password reset link sent. Please check your email.' };
};

const resetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findOne({ email: decoded.email });
  if (!user) throw new Error('Invalid or expired token');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return {
    msg: 'Password reset successfully. You can now log in with your new password.',
  };
};

const changePassword = async ({ email, currentPassword, newPassword }) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error('Current password is incorrect');

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  await transporter.sendMail({
    from: `"Jobsy Support Team" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: '🔑 Jobsy - Password Changed Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0073e6;">Password Changed Successfully</h2>
        <p>Dear ${user.name},</p>
        <p>Your password has been changed successfully. If you did not request this change, please reset your password immediately.</p>
        <p>If you need help, contact us at <a href="mailto:jobsy.notifications@gmail.com">jobsy.notifications@gmail.com</a>.</p>
        <hr>
        <p style="font-size: 14px; color: gray;">
          Best Regards, <br>
          <strong>Jobsy Support Team</strong>
        </p>
      </div>
    `,
  });

  return {
    msg: 'Password changed successfully. A confirmation email has been sent.',
  };
};

const updateEmail = async ({ currentEmail, newEmail, password }) => {
  const user = await User.findOne({ email: currentEmail });

  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Current password is incorrect');

  const newemailuser = await User.findOne({ email: newEmail });
  if (newemailuser) throw new Error('Email already in use');

  user.email = newEmail;
  await user.save();

  await transporter.sendMail({
    from: `"Jobsy Support Team" <${process.env.EMAIL_USER}>`,
    to: currentEmail,
    subject: '🔹 Jobsy - Email Updated Successfully 🔹',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0073e6;">Email Changed Successfully ✅</h2>
        <p>Dear ${user.name},</p>
        <p>Your email address on Jobsy has been successfully updated to <strong>${newEmail}</strong>.</p>
        <p>If you did not request this change, please contact our support team immediately.</p>
        <hr>
        <p style="font-size: 14px; color: gray;">
          Best Regards, <br>
          <strong>Jobsy Support Team</strong> <br>
          Need help? Contact us at <a href="mailto:jobsy.notifications@gmail.com">jobsy.notifications@gmail.com</a>
        </p>
      </div>
    `,
  });

  return {
    msg: 'Email updated successfully. A confirmation email has been sent to your new email.',
  };
};

const updateUsername = async ({ token, newUsername }) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.name = newUsername;
    await user.save();

    return { msg: 'Username updated successfully' };
  } catch (error) {
    console.error('Token Verification Error:', error.message);
    throw new Error('Invalid or expired token');
  }
};

const deleteAccount = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Incorrect password');

  await User.deleteOne({ email });

  await transporter.sendMail({
    from: `"Jobsy Support Team" <jobsy.notifications@gmail.com>`,
    to: email,
    subject: 'Account Deleted Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: red;">Your Jobsy Account has been Deleted</h2>
        <p>Dear ${user.name},</p>
        <p>We’re sorry to see you go! Your Jobsy account has been permanently deleted.</p>
        <p>If this wasn’t you, please contact us immediately at <a href="mailto:jobsy.notifications@gmail.com">jobsy.notifications@gmail.com</a></p>
        <hr>
        <p style="font-size: 14px; color: gray;">
          Best Regards, <br>
          <strong>Jobsy Support Team</strong>
        </p>
      </div>
    `,
  });

  return { msg: 'Account deleted successfully' };
};

export {
  verifyCaptcha,
  registerUser,
  verifyEmail,
  loginUser,
  resendConfirmationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  updateEmail,
  updateUsername,
  deleteAccount,
  googleSignIn,
};
