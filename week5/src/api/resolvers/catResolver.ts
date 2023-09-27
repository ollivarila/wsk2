import {makeExecutableSchema} from '@graphql-tools/schema';
import {GraphQLError} from 'graphql';
import {Cat} from '../../interfaces/Cat';
import {locationInput} from '../../interfaces/Location';
import {UserIdWithToken} from '../../interfaces/User';
import rectangleBounds from '../../utils/rectangleBounds';
import CatModel from '../models/catModel';
import {ObjectId, Types} from 'mongoose';
import UserModel from '../models/userModel';
import {Maybe, Result} from 'true-myth';

// TODO: create resolvers based on cat.graphql
// note: when updating or deleting a cat, you need to check if the user is the owner of the cat
// note2: when updating or deleting a cat as admin, you need to check if the user is an admin by checking the role from the user object
interface ByAreaArgs {
  topRight: Coordinates;
  bottomLeft: Coordinates;
}

interface Coordinates {
  lat: number;
  lng: number;
}
export default {
  Cat: {
    owner: async (cat: Cat) => UserModel.findById(cat.owner),
  },
  Query: {
    catById: async (_: Cat, {id}: {id: string}) => CatModel.findById(id),
    cats: async () => CatModel.find(),
    catsByOwner: async (_: Cat, {ownerId}: {ownerId: string}) =>
      CatModel.find({owner: ownerId}),
    catsByArea: async (_: Cat, args: ByAreaArgs) => {
      const {topRight, bottomLeft} = args;

      // MongoDb expects coordinates in the form of [lng, lat]
      return CatModel.find({
        location: {
          $geoWithin: {
            $box: [
              [topRight.lng, topRight.lng],
              [bottomLeft.lng, bottomLeft.lng],
            ],
          },
        },
      });
    },
  },
  Mutation: {
    createCat: async (
      _: Cat,
      cat: Omit<Cat, 'id' | '_id'>,
      {userIdWithToken}: {userIdWithToken: UserIdWithToken}
    ) => {
      if (!userIdWithToken) {
        throw new GraphQLError('Not authenticated');
      }
      const newCat = await CatModel.create({
        ...cat,
        owner: userIdWithToken.id,
      });
      return newCat;
    },
    updateCat: async (
      _: Cat,
      args: {id: string; cat_name: string; weight: number; birthdate: Date},
      {userIdWithToken}: {userIdWithToken: UserIdWithToken}
    ) => {
      if (!userIdWithToken) {
        throw new GraphQLError('Not authenticated');
      }

      return CatModel.findOneAndUpdate(
        {_id: args.id, owner: userIdWithToken.id},
        args,
        {new: true}
      );
    },
    deleteCat: async (
      _: Cat,
      args: {id: string},
      {userIdWithToken}: {userIdWithToken: UserIdWithToken}
    ) => {
      if (!userIdWithToken) {
        throw new GraphQLError('Not authenticated');
      }
      return CatModel.findOneAndDelete({
        _id: args.id,
        owner: userIdWithToken.id,
      });
    },
    updateCatAsAdmin: async (
      _: Cat,
      args: {id: string; cat_name: string; weight: number; birthdate: Date},
      {userIdWithToken}: {userIdWithToken: UserIdWithToken}
    ) => {
      if (!userIdWithToken) {
        throw new GraphQLError('Not authenticated');
      }

      if (userIdWithToken.role !== 'admin') {
        throw new GraphQLError('Not authorized');
      }
      return CatModel.findByIdAndUpdate(args.id, args, {new: true});
    },
    deleteCatAsAdmin: async (
      _: Cat,
      args: {id: string},
      {userIdWithToken}: {userIdWithToken: UserIdWithToken}
    ) => {
      if (!userIdWithToken) {
        throw new GraphQLError('Not authenticated');
      }
      if (userIdWithToken.role !== 'admin') {
        throw new GraphQLError('Not authorized');
      }
      return CatModel.findByIdAndDelete(args.id);
    },
  },
};
