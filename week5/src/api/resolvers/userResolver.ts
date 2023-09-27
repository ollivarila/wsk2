import jwt from 'jsonwebtoken';
import {GraphQLError} from 'graphql';
import {Cat} from '../../interfaces/Cat';
import LoginMessageResponse from '../../interfaces/LoginMessageResponse';
import {User, UserIdWithToken} from '../../interfaces/User';
import UserModel from '../models/userModel';
import authenticate from '../../functions/authenticate';
import bcrypt from 'bcryptjs';
import {MyContext} from '../../interfaces/MyContext';
import {token} from 'morgan';
// TODO: create resolvers based on user.graphql
// note: when updating or deleting a user don't send id to the auth server, it will get it from the token
// note2: when updating or deleting a user as admin, you need to check if the user is an admin by checking the role from the user object

const salt = bcrypt.genSaltSync(10);

type UserInput = {
  user: Omit<User, 'id' | '_id'>;
};

export default {
  Query: {
    async users() {
      return UserModel.find();
    },
    async userById(_: User, {id}: {id: string}) {
      return UserModel.findById(id);
    },
    async checkToken(
      _: User,
      __: {},
      {userIdWithToken}: {userIdWithToken: UserIdWithToken}
    ) {
      const user = await UserModel.findById(userIdWithToken.id);
      return {
        token: userIdWithToken.token,
        message: 'Token is valid',
        user,
      };
    },
  },
  Mutation: {
    async login(
      _: User,
      {credentials}: {credentials: {username: string; password: string}}
    ) {
      const user = await UserModel.findOne({email: credentials.username});
      if (!user) {
        throw new GraphQLError('User not found, invalid email');
      }
      const valid = bcrypt.compareSync(credentials.password, user.password);
      if (!valid) {
        throw new GraphQLError('Invalid password');
      }
      const token = genToken(user);

      return tokenMessage(token, user, 'Login successful');
    },
    async register(_: User, {user}: UserInput) {
      const created = await UserModel.create({
        ...user,
        password: bcrypt.hashSync(user.password, salt),
      });

      const token = genToken(created);

      return tokenMessage(token, created, 'User created');
    },
    async updateUser(
      _: User,
      {user}: {user: Partial<User>},
      context: MyContext
    ) {
      if (!context.userIdWithToken) {
        throw new GraphQLError('Invalid token');
      }

      const updated = await UserModel.findByIdAndUpdate(
        {_id: context.userIdWithToken.id},
        user,
        {new: true}
      );
      return tokenMessage(
        context.userIdWithToken.token,
        updated,
        'User updated'
      );
    },
    async deleteUser(_: User, __: {}, context: MyContext) {
      if (!context.userIdWithToken) {
        throw new GraphQLError('Invalid token');
      }

      const deleted = await UserModel.findByIdAndDelete(
        context.userIdWithToken.id
      );
      return tokenMessage(
        context.userIdWithToken.token,
        deleted,
        'User deleted'
      );
    },
    async updateUserAsAdmin(
      _: User,
      {id, user}: {id: string; user: Partial<User>},
      context: MyContext
    ) {
      if (!context.userIdWithToken) {
        throw new GraphQLError('Invalid token');
      }
      if (context.userIdWithToken.role !== 'admin') {
        throw new GraphQLError('You are not an admin');
      }

      return UserModel.findByIdAndUpdate(id, user, {new: true});
    },
    async deleteUserAsAdmin(_: User, {id}: {id: string}, context: MyContext) {
      if (!context.userIdWithToken) {
        throw new GraphQLError('Invalid token');
      }
      if (context.userIdWithToken.role !== 'admin') {
        throw new GraphQLError('You are not an admin');
      }
      const deleted = await UserModel.findByIdAndDelete(id);

      return tokenMessage(
        context.userIdWithToken.token,
        deleted,
        'User deleted'
      );
    },
  },
};

function genToken(user: User) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET as string
  );
}

function tokenMessage(token: string, user: User | null, message: string) {
  return {
    token,
    user,
    message,
  };
}
