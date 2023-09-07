import express from 'express';
import {
  checkToken,
  createAdmin,
  userDeleteCurrent,
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
} from '../controllers/userController';
import passport from '../../passport';
import {validatorFrom} from '../../middlewares';
import {body} from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(userListGet)
  .post(
    validatorFrom([
      body('username').isString().isLength({min: 3}).escape(),
      body('password').isString().isLength({min: 3}).escape(),
      body('email').isEmail(),
    ]),
    userPost
  )
  .put(
    validatorFrom([
      body('username').optional().isString().isLength({min: 3}).escape(),
      body('password').optional().isString().isLength({min: 3}).escape(),
      body('email').optional().isEmail(),
    ]),
    passport.authenticate('jwt', {session: false}),
    userPutCurrent
  )
  .delete(passport.authenticate('jwt', {session: false}), userDeleteCurrent);

router.get(
  '/token',
  passport.authenticate('jwt', {session: false}),
  checkToken
);

router.route('/:id').get(userGet);

router.post('/admin', createAdmin);

export default router;
