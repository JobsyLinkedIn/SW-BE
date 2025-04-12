import * as authService from '../services/authServices.js';


const googleSignInController = async (req, res) => {
  const { token } = req.body;

  try {
    const response = await authService.googleSignIn(token);
    res.status(200).json(response);
  } catch (error) {
    console.error('Google Sign-In Error:', error.message);
    res.status(400).json({ msg: error.message });
  }
};
const register = async (req, res) => {
  const { name, email, password, captchaToken } = req.body;

   try {
    //  if (!captchaToken) {
    //    return res.status(400).json({ msg: "CAPTCHA verification failed" });
    //  }

    //  const isHuman = await authService.verifyCaptcha(captchaToken);
    //  if (!isHuman) {
    //    return res.status(400).json({ msg: "CAPTCHA verification failed" });
    //  }

     const response = await authService.registerUser({ name, email, password });
     res.status(201).json(response);
   } catch (error) {
     console.error("Registration Error:", error);
     res.status(400).json({ msg: error.message });
   }
};

const verify = async (req, res) => {
  const { token } = req.query;

  try {
    const response = await authService.verifyEmail(token);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await authService.loginUser({ email, password });
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const resendConfirmation = async (req, res) => {
  const { email } = req.query;

  try {
    const response = await authService.resendConfirmationEmail(email);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const forgot = async (req, res) => {
  const { email } = req.body;

  try {
    const response = await authService.forgotPassword(email);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const reset = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const response = await authService.resetPassword(token, newPassword);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const change = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    const response = await authService.changePassword({ email, currentPassword, newPassword });
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const updateEmailController = async (req, res) => {
  const { currentEmail, newEmail, password } = req.body;

  try {
    const response = await authService.updateEmail({ currentEmail, newEmail, password });
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const updateUsernameController = async (req, res) => {
  const { token, newUsername } = req.body;

  try {
    const response = await authService.updateUsername({ token, newUsername });
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const deleteAccountController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await authService.deleteAccount({ email, password });
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

export {
  register,
  verify,
  login,
  resendConfirmation,
  forgot,
  reset,
  change,
  updateEmailController,
  updateUsernameController,
  deleteAccountController,
  googleSignInController,
};
