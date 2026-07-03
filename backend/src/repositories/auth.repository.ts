import prisma from '../config/prisma';

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const createUser = (email: string, password: string) =>
  prisma.user.create({ data: { email, password } });