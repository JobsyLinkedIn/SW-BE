import request from 'supertest';
import express from 'express';
import adminRoutes from '../routes/admin.js';
import * as adminServices from '../services/adminServices.js';

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

process.env.ADMIN_REGISTRATION_KEY = 'testkey';
process.env.ADMIN_JWT_SECRET = 'testsecret';

jest.mock('../middlewares/authenticateAdmin.js', () => (req, res, next) => next());

describe('Admin Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /admin/register', () => {
    it('should register admin successfully with valid key', async () => {
      const mockAdmin = { name: 'Admin', email: 'admin@example.com' };
      jest.spyOn(adminServices, 'createAdmin').mockResolvedValue(mockAdmin);

      const res = await request(app)
        .post('/admin/register')
        .send({
          name: 'Admin',
          email: 'admin@example.com',
          password: 'password',
          adminKey: 'testkey',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Admin registered');
    });

    it('should return 403 for invalid admin key', async () => {
      const res = await request(app)
        .post('/admin/register')
        .send({
          name: 'Admin',
          email: 'admin@example.com',
          password: 'password',
          adminKey: 'wrongkey',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Invalid admin key');
    });
  });

  describe('POST /admin/login', () => {
    it('should login admin and return token', async () => {
      const mockToken = 'mocktoken';
      const mockAdmin = { email: 'admin@example.com' };

      jest.spyOn(adminServices, 'loginAdmin').mockResolvedValue({
        msg: 'Logged in successfully',
        token: mockToken,
        admin: mockAdmin,
      });

      const res = await request(app).post('/admin/login').send({
        email: 'admin@example.com',
        password: 'password',
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe(mockToken);
    });
  });

  describe('GET /admin/analytics', () => {
    it('should return analytics data', async () => {
      jest.spyOn(adminServices, 'getUsersThisMonth').mockResolvedValue(10);
      jest.spyOn(adminServices, 'getPostsToday').mockResolvedValue(5);

      const res = await request(app).get('/admin/analytics');

      expect(res.status).toBe(200);
      expect(res.body.data.usersThisMonth).toBe(10);
      expect(res.body.data.postsToday).toBe(5);
    });
  });
});
