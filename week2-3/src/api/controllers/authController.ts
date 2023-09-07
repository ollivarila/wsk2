import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import passport from '../../passport';
import CustomError from '../../classes/CustomError';
import {User} from '../../interfaces/User';

const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', {session: false}, (err: Error, user: User) => {
    if (err || !user) {
      next(new CustomError('Invalid username/password', 200));
      return;
    }
    req.login(user, {session: false}, (error) => {
      if (error) {
        next(new CustomError('Login error', 400));
        return;
      }
      const out = {
        username: user.username,
        email: user.email,
        id: user._id,
      };
      const token = jwt.sign(user, 'asdf');
      return res.json({user: out, token});
    });
  })(req, res, next);
};

export {login};
