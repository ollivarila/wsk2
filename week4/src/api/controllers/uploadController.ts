// TODO: create a controller to send the data of uploaded cat
// to the client
// data to send is described in UploadMessageResponse interface

import {NextFunction, Request, Response} from 'express';
import CustomError from '../../classes/CustomError';

// export {catPost};
type Coords = {
  type: 'Point';
  coordinates: [number, number];
};

export async function catPost(
  req: Request<{}, {}, {}>,
  res: Response<{}, {coords: Coords}>,
  next: NextFunction
) {
  const filename = req.file?.filename;
  const location = res.locals.coords;

  if (!filename) {
    next(new CustomError('file not uploaded', 500));
  }

  res.json({
    message: 'Picture uploaded',
    data: {
      filename,
      location,
    },
  });
}
