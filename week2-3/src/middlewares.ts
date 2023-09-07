/* eslint-disable @typescript-eslint/no-unused-vars */
import {NextFunction, Request, Response} from 'express';
import sharp from 'sharp';
import {ExifImage} from 'exif';
import ErrorResponse from './interfaces/ErrorResponse';
import CustomError from './classes/CustomError';
import {ValidationChain, validationResult} from 'express-validator';
import HttpStatus from 'http-status-codes';

// convert GPS coordinates to decimal format
// for longitude, send exifData.gps.GPSLongitude, exifData.gps.GPSLongitudeRef
// for latitude, send exifData.gps.GPSLatitude, exifData.gps.GPSLatitudeRef
const gpsToDecimal = (gpsData: number[], hem: string) => {
  let d = gpsData[0] + gpsData[1] / 60 + gpsData[2] / 3600;
  return hem === 'S' || hem === 'W' ? (d *= -1) : d;
};

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`🔍 - Not Found - ${req.originalUrl}`, 404);
  next(error);
};

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  if (process.env.NODE_ENV !== 'test')
    console.error('errorHandler', err.message);
  res.status(err.status || 500);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

const getCoordinates = (req: Request, res: Response, next: NextFunction) => {
  const defaultPoint = {
    type: 'Point',
    coordinates: [24, 61],
  };
  try {
    // coordinates below should be an array of GPS coordinates in decimal format: [longitude, latitude]
    new ExifImage({image: req.file?.path}, (error, exifData) => {
      if (error) {
        res.locals.coords = defaultPoint;
        next();
      } else {
        try {
          const lon = gpsToDecimal(
            exifData.gps.GPSLongitude || [0, 0, 0],
            exifData.gps.GPSLongitudeRef || 'N'
          );
          const lat = gpsToDecimal(
            exifData.gps.GPSLatitude || [0, 0, 0],
            exifData.gps.GPSLatitudeRef || 'E'
          );
          const coordinates = {
            type: 'Point',
            coordinates: [lon, lat],
          };
          res.locals.coords = coordinates;
          next();
        } catch (err) {
          res.locals.coords = defaultPoint;
          next();
        }
      }
    });
  } catch (error) {
    res.locals.coords = defaultPoint;
    next();
  }
};

const makeThumbnail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await sharp(req.file?.path)
      .resize(160, 160)
      .png()
      .toFile(req.file?.path + '_thumb');
    next();
  } catch (error) {
    next(new CustomError('Thumbnail not created', 500));
  }
};

export function validatorFrom(validators: ValidationChain[]) {
  return [...validators, checkValidation];
}

function checkValidation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const message = errors
    .array()
    .map((error) => `${error.param}: ${error.msg}`)
    .join(', ');

  next(new CustomError(message, HttpStatus.BAD_REQUEST));
}

export {notFound, errorHandler, getCoordinates, makeThumbnail};
