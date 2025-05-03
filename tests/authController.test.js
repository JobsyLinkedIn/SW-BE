import request from 'supertest';
import express from 'express';
import * as authService from '../services/authServices.js';
import * as authController from '../controllers/authController.js';

// Create an Express app instance for testing
const app = express();
app.use(express.json());

// Map routes to controller methods for test simulation
app.post('/register', authController.register);
app.post('/register-cross', authController.registerforcross);
app.get('/verify', authController.verify);
app.post('/login', authController.login);
app.get('/resend', authController.resendConfirmation);
app.post('/forgot', authController.forgot);
app.post('/reset', authController.reset);
app.post('/change', authController.change);
app.post('/update-email', authController.updateEmailController);
app.post('/update-username', authController.updateUsernameController);
app.post('/delete', authController.deleteAccountController);
app.post('/google-signin', authController.googleSignInController);
app.get('/me', (req, res, next) => {
  req.user = { _id: '123', name: 'Test', email: 'test@example.com', company: 'company123' };
  next();
}, authController.getUser);

// Mock the authService methods
jest.mock('../services/authServices.js');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register - success', async () => {
    authService.registerUser.mockResolvedValue({ msg: 'User registered' });

    const res = await request(app)
      .post('/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body.msg).toBe('User registered');
  });

  test('registerforcross - success', async () => {
    authService.registerUser.mockResolvedValue({ msg: 'User registered (cross)' });

    const res = await request(app)
      .post('/register-cross')
      .send({ name: 'Test', email: 'cross@example.com', password: 'password123' });

    expect(res.statusCode).toBe(201);
  });

  test('verify - success', async () => {
    authService.verifyEmail.mockResolvedValue({ msg: 'Email verified' });

    const res = await request(app)
      .get('/verify')
      .query({ token: 'abc123' });

    expect(res.statusCode).toBe(200);
  });

  test('login - success', async () => {
    authService.loginUser.mockResolvedValue({ token: 'jwt-token' });

    const res = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'pass' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe('jwt-token');
  });

  test('resendConfirmation - success', async () => {
    authService.resendConfirmationEmail.mockResolvedValue({ msg: 'Sent' });

    const res = await request(app)
      .get('/resend')
      .query({ email: 'test@example.com' });

    expect(res.statusCode).toBe(200);
  });

  test('forgot - success', async () => {
    authService.forgotPassword.mockResolvedValue({ msg: 'Reset link sent' });

    const res = await request(app)
      .post('/forgot')
      .send({ email: 'test@example.com' });

    expect(res.statusCode).toBe(200);
  });

  test('reset - success', async () => {
    authService.resetPassword.mockResolvedValue({ msg: 'Password reset' });

    const res = await request(app)
      .post('/reset')
      .send({ token: 'token', newPassword: 'newPass123' });

    expect(res.statusCode).toBe(200);
  });

  test('change - success', async () => {
    authService.changePassword.mockResolvedValue({ msg: 'Password changed' });

    const res = await request(app)
      .post('/change')
      .send({ email: 'test@example.com', currentPassword: 'old', newPassword: 'new' });

    expect(res.statusCode).toBe(200);
  });

  test('updateEmailController - success', async () => {
    authService.updateEmail.mockResolvedValue({ msg: 'Email updated' });

    const res = await request(app)
      .post('/update-email')
      .send({ currentEmail: 'old@test.com', newEmail: 'new@test.com', password: 'pass' });

    expect(res.statusCode).toBe(200);
  });

  test('updateUsernameController - success', async () => {
    authService.updateUsername.mockResolvedValue({ msg: 'Username updated' });

    const res = await request(app)
      .post('/update-username')
      .send({ token: 'abc', newUsername: 'newname' });

    expect(res.statusCode).toBe(200);
  });

  test('deleteAccountController - success', async () => {
    authService.deleteAccount.mockResolvedValue({ msg: 'Account deleted' });

    const res = await request(app)
      .post('/delete')
      .send({ email: 'test@example.com', password: 'pass' });

    expect(res.statusCode).toBe(200);
  });

  test('googleSignInController - success', async () => {
    authService.googleSignIn.mockResolvedValue({ msg: 'Google sign-in success' });

    const res = await request(app)
      .post('/google-signin')
      .send({ token: 'google-token' });

    expect(res.statusCode).toBe(200);
  });

  test('getUser - returns user info', async () => {
    const res = await request(app).get('/me');

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test');
    expect(res.body.email).toBe('test@example.com');
  });
});
