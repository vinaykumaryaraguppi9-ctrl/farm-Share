import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production';

export const hashPassword = async (password) => {
  return bcryptjs.hash(password, 10);
};

export const comparePassword = async (password, hash) => {
  return bcryptjs.compare(password, hash);
};

export const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getUserFromRequest = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  return verifyToken(token);
};
