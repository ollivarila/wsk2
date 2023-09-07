import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import CatModel from '../models/catModel';
import CustomError from '../../classes/CustomError';
import {Cat, CatPut} from '../../interfaces/Cat';
import {User} from '../../interfaces/User';

export async function catGet(
  req: Request<{id: string}, {}, {}>,
  res: Response
) {
  const cat = await CatModel.findById(req.params.id).populate('owner');
  if (!cat)
    throw new CustomError(
      `Cat not found with ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  res.json(cat);
}

export async function catListGet(_req: Request, res: Response) {
  const cats = await CatModel.find().populate('owner');
  res.json(cats);
}

type Coords = {
  type: 'Point';
  coordinates: [number, number];
};

export async function catPost(
  req: Request<{}, {}, Cat>,
  res: Response<{}, {coords: Coords}>
) {
  const user = req.user as User;
  const coordinates = res.locals.coords;
  const cat = await CatModel.create({
    ...req.body,
    owner: user._id,
    location: coordinates,
  });
  const response = {
    message: 'Cat created',
    data: cat,
  };
  res.json(response);
}

export async function catPut(
  req: Request<{id: string}, {}, CatPut>,
  res: Response
) {
  const user = req.user as User;
  const cat = await CatModel.findOneAndUpdate(
    {_id: req.params.id, owner: user._id},
    req.body,
    {new: true}
  );
  if (!cat)
    throw new CustomError(
      'You are not the owner of this cat',
      StatusCodes.NOT_FOUND
    );

  res.json({
    message: 'Cat updated',
    data: cat,
  });
}

export async function catDelete(
  req: Request<{id: string}, {}, {}>,
  res: Response
) {
  const user = req.user as User;
  const cat = await CatModel.findOneAndDelete({
    _id: req.params.id,
    owner: user._id,
  });
  if (!cat)
    throw new CustomError('Unable to delete this cat', StatusCodes.NOT_FOUND);

  res.json({
    message: 'Cat deleted',
    data: cat,
  });
}

export async function catGetByUser(req: Request, res: Response) {
  const user = req.user as User;
  const cats = await CatModel.find({owner: user._id});
  res.json(cats);
}

export async function catGetByBoundingBox(
  req: Request<{}, {}, {}, {topRight: string; bottomLeft: string}>,
  res: Response
) {
  const {topRight, bottomLeft} = req.query;

  // MongoDb expects coordinates in the form of [lng, lat]
  const [topRightLat, topRightLng] = topRight.split(',');
  const [bottomLeftLat, bottomLeftLng] = bottomLeft.split(',');

  const cats = await CatModel.find({
    location: {
      $geoWithin: {
        $box: [
          [topRightLng, topRightLat],
          [bottomLeftLng, bottomLeftLat],
        ],
      },
    },
  });
  res.json(cats);
}

export async function catPutAdmin(
  req: Request<{id: string}, {}, CatPut>,
  res: Response
) {
  const user = req.user as User;
  if (user.role !== 'admin')
    throw new CustomError('You are not admin', StatusCodes.UNAUTHORIZED);
  const updated = await CatModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).populate('owner');
  if (!updated)
    throw new CustomError(
      `Cat not found with ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  res.json(createResponse('Cat updated', updated));
}

export async function catDeleteAdmin(
  req: Request<{id: string}, {}, {}>,
  res: Response
) {
  const user = req.user as User;
  if (user.role !== 'admin')
    throw new CustomError('You are not admin', StatusCodes.UNAUTHORIZED);
  const deleted = await CatModel.findByIdAndDelete(req.params.id);
  if (!deleted)
    throw new CustomError(
      `Cat not found with ${req.params.id}`,
      StatusCodes.NOT_FOUND
    );
  res.json(createResponse('Cat deleted', deleted));
}

function createResponse(message: string, data: Cat) {
  return {
    message,
    data,
  };
}
