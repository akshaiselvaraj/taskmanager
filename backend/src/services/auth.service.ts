import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as AuthRepo from '../repositories/auth.repository';

export const register = async (email: string, password: string) => {
  const existing = await AuthRepo.findUserByEmail(email);
  if (existing) throw new Error('Email already in use');
  const hashed = await bcrypt.hash(password, 10);
  const user = await AuthRepo.createUser(email, hashed);
  return { id: user.id, email: user.email };
};

export const login = async (email: string, password: string) => {
  const user = await AuthRepo.findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return { token };
};