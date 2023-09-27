import {Router, Request, Response, NextFunction} from 'express';
import authenticate from '../../functions/authenticate';
import multer, {FileFilterCallback} from 'multer';
import {getCoordinates} from '../../middlewares';

const fileFilter = (
  request: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.includes('image')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  dest: 'uploads/',
  fileFilter,
  storage: undefined,
});

const authenticateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = authenticate(req);
  if (!auth) {
    return res.status(401).send('Unauthorized');
  }
  next();
};

const fileRouter = Router();
fileRouter.post(
  '/',
  authenticateMiddleware,
  upload.single('cat'),
  getCoordinates,
  (req, res) => {
    const response = {
      message: 'File uploaded successfully',
      data: {
        filename: req.file?.filename,
        location: res.locals.coords,
      },
    };
    res.json(response);
  }
);

export default fileRouter;
