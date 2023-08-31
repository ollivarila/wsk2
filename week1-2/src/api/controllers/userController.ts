import {
  addUser,
  deleteUser,
  emailExists,
  getAllUsers,
  getUser,
  updateUser,
  userNameExists,
} from '../models/userModel';
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import bcrypt from 'bcryptjs';
import {User} from '../../interfaces/User';
import {check, matchedData, validationResult} from 'express-validator';
import {StatusCodes} from 'http-status-codes';

const salt = bcrypt.genSaltSync(12);

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) { next(error); }
};

const userGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getUser(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = getValidationResult<User>(req);
    user.password = bcrypt.hashSync(user.password!, salt);
    const id = await addUser(user);
    res.json({
      message: 'user added',
      user_id: id,
    });
  } catch (error) {
    next(error);
  }
};

const userPut = async (
  req: Request<{id: number}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    if ((req.user as User).role !== 'admin') {
      throw new CustomError('Admin only', 403);
    }

    const user = req.body;

    await updateUser(user, req.params.id);
    res.json({
      message: 'user modified',
    });
  } catch (error) {
    next(error);
  }
};

const userPutCurrent = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const detailsToUpdate = req.body as Partial<User>;
    const user = req.user as User;
    if (detailsToUpdate.password) {
      user.password = bcrypt.hashSync(user.password!, salt);
    }
    await updateUser(
      {
        ...user,
        ...detailsToUpdate,
      } as User,
      user.user_id
    );
    res.json({
      message: 'user modified',
    });
  } catch (error) {
    next(error);
  }
};

const userDelete = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    if ((req.user as User).role !== 'admin') {
      throw new CustomError('Admin only', StatusCodes.FORBIDDEN);
    }
    getValidationResult(req);
    await deleteUser(parseInt(req.params.id));
    res.json({
      message: 'user deleted',
    });
  } catch (error) {
    next(error);
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteUser((req.user as User).user_id);
    res.json({
      message: 'user deleted',
    });
  } catch (error) {
    next(error);
  }
};

const checkToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    next(new CustomError('token not valid', 403));
  } else {
    res.json(req.user);
  }
};

function getValidationResult<T>(req: Request): T {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return matchedData(req) as T;
  }
  const missing = result
    .array()
    .map((e) => `${e.param}: ${e.msg}`)
    .join(', ');

  throw new CustomError(
    'Invalid request body: ' + missing,
    StatusCodes.BAD_REQUEST
  );
}

export function createUserValidatorChain() {
  return [
    check(['user_name', 'password'], 'missing field').exists(),
    check('user_name').custom(async (username) => {
      const exists = await userNameExists(username);
      return exists;
    }),
    check('email').custom(async (email) => {
      const exists = await emailExists(email);
      return exists;
    }),
    check('email', 'invalid email').isEmail(),
  ];
}

export {
  userListGet,
  userGet,
  userPost,
  userPut,
  userPutCurrent,
  userDelete,
  userDeleteCurrent,
  checkToken,
};
