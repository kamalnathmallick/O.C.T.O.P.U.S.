import { Request, Response, NextFunction } from 'express';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

describe('authMiddleware - authenticate', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should return 401 if no token provided', () => {
    authenticate(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

  it('should return 401 if token is invalid', () => {
    req.headers = { authorization: 'Bearer invalid_token' };
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid token'); });
    authenticate(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('should call next() if token is valid', () => {
    req.headers = { authorization: 'Bearer valid_token' };
    (jwt.verify as jest.Mock).mockReturnValue({ userId: '123', email: 'test@test.com', role: 'ADMIN' });
    authenticate(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('roleMiddleware - authorize', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should return 401 if user not authenticated', () => {
    authorize(['ADMIN'])(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 403 if user role not allowed', () => {
    (req as any).user = { role: 'OPERATOR' };
    authorize(['ADMIN'])(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should call next() if user role is allowed', () => {
    (req as any).user = { role: 'ADMIN' };
    authorize(['ADMIN'])(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});