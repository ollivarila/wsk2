import express, {Request} from 'express';
import {
  catDelete,
  catGet,
  catListGet,
  catPost,
  catPut,
  catGetByUser,
  catGetByBoundingBox,
  catPutAdmin,
  catDeleteAdmin,
} from '../controllers/catController';
import multer, {FileFilterCallback} from 'multer';
import {body, param, query} from 'express-validator';
import passport from '../../passport';
import {getCoordinates, makeThumbnail, validatorFrom} from '../../middlewares';
import config from '../../config';

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
  dest: config.uploadDir,
  fileFilter,
  storage: undefined,
});
const router = express.Router();

const catPostValidator = validatorFrom([
  body('name').isString().isLength({min: 3}).escape(),
  body('weight').isNumeric(),
  body('birthdate').isDate(),
]);

const catPutValidator = validatorFrom([
  body('name').optional().isString().isLength({min: 3}).escape(),
  body('weight').optional().isNumeric(),
  body('birthdate').optional().isDate(),
]);

router
  .route('/')
  .get(catListGet)
  .post(
    passport.authenticate('jwt', {session: false}),
    upload.single('cat'),
    catPostValidator,
    makeThumbnail,
    getCoordinates,
    catPost
  );

router
  .route('/area')
  .get(
    validatorFrom([
      query('topRight').isString().escape(),
      query('bottomLeft').isString().escape(),
    ]),
    catGetByBoundingBox
  );

router
  .route('/user')
  .get(passport.authenticate('jwt', {session: false}), catGetByUser);

router
  .route('/admin/:id')
  .put(
    passport.authenticate('jwt', {session: false}),
    catPutValidator,
    catPutAdmin
  )
  .delete(passport.authenticate('jwt', {session: false}), catDeleteAdmin);

router
  .route('/:id')
  .get(param('id'), catGet)
  .put(
    passport.authenticate('jwt', {session: false}),
    catPutValidator,
    param('id'),
    catPut
  )
  .delete(
    passport.authenticate('jwt', {session: false}),
    param('id'),
    catDelete
  );

export default router;
