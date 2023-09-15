// TODO: Add resolvers for cat
// 1. Queries
// 1.1. cats
// 1.2. catById
// 1.3. catsByOwner
// 1.4. catsByArea
// 2. Mutations
// 2.1. createCat
// 2.2. updateCat
// 2.3. deleteCat

import {Cat} from '../../interfaces/Cat';
import CatModel from '../models/catModel';
import {GetByIdArgs} from '.';
import userModel from '../models/userModel';

interface ByAreaArgs {
  topRight: Coordinates;
  bottomLeft: Coordinates;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface CreateCatArgs {
  cat_name: string;
  weight: number;
  birthdate: Date;
  filename: string;
  location: string;
  owner: string;
}

type UpdateCatArgs = Partial<CreateCatArgs> & {id: string};

export default {
  Cat: {
    async owner(cat: Cat) {
      return userModel.findById(cat.owner);
    },
  },
  Query: {
    async catById(_: Cat, args: GetByIdArgs) {
      return CatModel.findById(args.id);
    },
    async cats() {
      return CatModel.find();
    },
    async catsByOwner(_: Cat, args: {ownerId: string}) {
      return CatModel.find({owner: args.ownerId});
    },
    async catsByArea(_: Cat, args: ByAreaArgs) {
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
    async createCat(_: Cat, args: CreateCatArgs) {
      console.log('args', args);
      const cat = await CatModel.create({
        ...args,
        // cat_name: args.catName,
        // weight: args.weight,
        // birthdate: args.birthdate,
        // owner: args.owner,
        // filename: args.filename,
        // location: args.location,
      });
      return cat.populate('owner');
    },
    async updateCat(_: Cat, args: UpdateCatArgs) {
      return CatModel.findByIdAndUpdate(args.id, {...args}, {new: true});
    },
    async deleteCat(_: Cat, args: {id: string}) {
      return CatModel.findByIdAndDelete(args.id);
    },
  },
};
