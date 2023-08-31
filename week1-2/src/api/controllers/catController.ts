import {
  addCat,
  deleteCat,
  getAllCats,
  getCat,
  updateCat,
  userOwnsCat,
} from '../models/catModel';
import {Request, Response, NextFunction} from 'express';
import {Cat, PostCat} from '../../interfaces/Cat';
import {User} from '../../interfaces/User';
import CustomError from '../../classes/CustomError';
import {matchedData, validationResult} from 'express-validator';
import MessageResponse from '../../interfaces/MessageResponse';
import {StatusCodes} from 'http-status-codes';

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await getAllCats();
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGet = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const cat = await getCat(req.params.id);
    res.json(cat);
  } catch (error) {
    next(error);
  }
};

const catPost = async (
  req: Request<{}, {}, PostCat>,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    next(new CustomError('No file uploaded', StatusCodes.BAD_REQUEST));
    return;
  }
  try {
    const cat = getValidationResult<PostCat>(req);
    const [lat, lng] = res.locals.coords as [number, number];
    const id = await addCat({
      ...cat,
      filename: req.file.filename,
      lat,
      lng,
      owner: (req.user as User).user_id,
    });
    res.send({
      message: 'Cat created',
      id,
    });
  } catch (error) {
    next(error);
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
const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const id = parseInt(req.params.id);
    if (!(await canDeleteOrModify(req.user as User, id)))
      throw new CustomError(
        'You cannot modify this cat',
        StatusCodes.UNAUTHORIZED
      );
    const cat = req.body;
    await updateCat(cat, id);
    const message: MessageResponse = {
      message: 'cat updated',
      id,
    };
    res.json(message);
  } catch (error) {
    next(error);
  }
};

const catDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (!(await canDeleteOrModify(req.user as User, id)))
      throw new CustomError(
        'You cannot modify this cat',
        StatusCodes.UNAUTHORIZED
      );
    await deleteCat(id);
    res.send({
      message: 'Cat deleted',
      id,
    });
  } catch (error) {
    next(error);
  }
};

async function canDeleteOrModify(user: User, catId: number) {
  const isAdmin = user.role === 'admin';
  const isOwner = await userOwnsCat(catId, user.user_id);
  return isAdmin || isOwner;
}

export {catListGet, catGet, catPost, catPut, catDelete};
