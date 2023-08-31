import passport from 'passport';
import {Strategy} from 'passport-local';
import {Strategy as JWTStrategy, ExtractJwt} from 'passport-jwt';
import bcrypt from 'bcryptjs';
import {getUserLogin} from '../api/models/userModel';
import {User} from '../interfaces/User';
import config from '../config';

passport.use(
  new Strategy(async (username, password, done) => {
    try {
      // console.log(`Login from ${username}`);
      const user = await getUserLogin(username);
      if (!user) {
        return done(null, false);
      }
      if (!bcrypt.compareSync(password, user.password!)) {
        return done(null, false);
      }
      return done(null, user, {message: 'Logged In Successfully'}); // use spread syntax to create shallow copy to get rid of binary row type
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwtSecret,
    },
    (jwtPayload, done) => {
      // console.log('payload', jwtPayload);
      delete jwtPayload.iat;
      const user = jwtPayload as User;
      done(null, user);
    }
  )
);

const passportMiddleware = passport.initialize();

export default passportMiddleware;
