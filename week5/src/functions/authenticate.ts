import {Request} from 'express';
import jwt from 'jsonwebtoken';
import {UserIdWithToken} from '../interfaces/User';

export default (req: Request): UserIdWithToken | null => {
  const bearer = req.headers.authorization;
  if (!bearer) {
    return null;
  }

  const token = bearer.split(' ')[1];

  if (!token) {
    return null;
  }

  const userFromToken = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as UserIdWithToken;

  if (!userFromToken) {
    return null;
  }

  userFromToken.token = token;

  return userFromToken;
};
