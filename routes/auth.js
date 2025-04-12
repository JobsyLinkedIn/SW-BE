import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authController.register);
router.get('/verify-email', authController.verify);
router.post('/login', authController.login);
router.get('/resend-confirmation-email', authController.resendConfirmation);
router.post('/forgot-password', authController.forgot);
router.post('/reset-password', authController.reset);
router.post('/change-password', authController.change);
router.post('/update-email', authController.updateEmailController);
router.post('/update-username', authController.updateUsernameController);
router.delete('/delete-account', authController.deleteAccountController);
router.post('/google-signin', authController.googleSignInController);

export default router;
