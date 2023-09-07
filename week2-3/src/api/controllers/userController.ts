import {StatusCodes} from 'http-status-codes';
import UserModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import bcrypt from 'bcryptjs';
import {User, UserPut} from '../../interfaces/User';
import {Request, Response} from 'express';

export async function userGet(
  req: Request<{id: string}, {}, {}>,
  res: Response
) {
  const user = await UserModel.findById(req.params.id);
  if (!user)
    throw new CustomError(
      `User not found with ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  res.json(user);
}

export async function userListGet(_req: Request, res: Response) {
  const users = await UserModel.find();
  res.json(users);
}

export async function userPost(req: Request<{}, {}, User>, res: Response) {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  try {
    const user = await UserModel.create({
      ...req.body,
      password: hashedPassword,
      role: 'user',
    });
    const response = {
      message: 'User created',
      data: user,
    };
    res.json(response).status(StatusCodes.OK);
  } catch (error) {
    throw new CustomError((error as Error).message, StatusCodes.BAD_REQUEST);
  }
}

export async function createAdmin(req: Request, res: Response) {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  try {
    const user = await UserModel.create({
      ...req.body,
      password: hashedPassword,
      role: 'admin',
    });
    const response = {
      message: 'Admin created',
      data: user,
    };
    res.json(response).status(StatusCodes.OK);
  } catch (error) {
    throw new CustomError((error as Error).message, StatusCodes.BAD_REQUEST);
  }
}

export async function userPutCurrent(
  req: Request<{}, {}, UserPut>,
  res: Response
) {
  if (!req.user)
    throw new CustomError('Not logged in', StatusCodes.UNAUTHORIZED);
  const user = req.user as User;
  const target: UserPut = {
    ...req.body,
    role: 'user',
  };
  if (req.body.password) {
    target.password = bcrypt.hashSync(req.body.password, 10);
  }
  const updated = await UserModel.findByIdAndUpdate(user._id, target, {
    new: true,
  });

  if (!updated) {
    throw new CustomError(
      `User not found with ${user._id}`,
      StatusCodes.NOT_FOUND
    );
  }

  res.send({
    message: 'User updated',
    data: updated,
  });
}

export async function userDeleteCurrent(req: Request, res: Response) {
  if (!req.user)
    throw new CustomError('Not logged in', StatusCodes.UNAUTHORIZED);
  const user = req.user as User;
  const deleted = await UserModel.findByIdAndDelete(user._id);

  if (!deleted)
    throw new CustomError(
      `User not found with ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  const response = {
    message: 'User deleted',
    data: deleted,
  };

  res.send(response);
}

export function checkToken(req: Request, res: Response) {
  if (!req.user)
    throw new CustomError('token not valid', StatusCodes.UNAUTHORIZED);

  const user = req.user as User;
  const response = {
    username: user.username,
    email: user.email,
    id: user._id,
  };
  res.json(response);
}
