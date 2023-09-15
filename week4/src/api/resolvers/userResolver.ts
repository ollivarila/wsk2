// TODO: Add resolvers for user
// 1. Queries
// 1.1. users
// 1.2. userById
// 2. Mutations
// 2.1. createUser
// 2.2. updateUser
// 2.3. deleteUser
import {GetByIdArgs} from '.';
import UserModel from '../models/userModel';
import {User} from '../../interfaces/User';

export default {
  Query: {
    async userById(_: User, args: GetByIdArgs) {
      return UserModel.findById(args.id);
    },
    async users() {
      return UserModel.find();
    },
  },
  Mutation: {
    async createUser(_: User, args: {user_name: string; email: string}) {
      return new UserModel({
        ...args,
      }).save();
    },
    async updateUser(_: User, args: {id: string; user_name: string}) {
      return UserModel.findByIdAndUpdate(
        args.id,
        {user_name: args.user_name},
        {new: true}
      );
    },
    async deleteUser(_: User, args: GetByIdArgs) {
      return UserModel.findByIdAndDelete(args.id);
    },
  },
};
