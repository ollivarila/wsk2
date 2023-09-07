import {Point} from 'geojson';
import {Document, Types} from 'mongoose';
import {UserResponse} from './User';

export interface Cat extends Document {
  name: string;
  weight: number;
  filename: string;
  birthdate: Date;
  location: Point;
  owner: Types.ObjectId;
}

export type CatPut = Partial<Cat>;

export type CatResponse = {
  id: string;
  name: string;
  weight: number;
  filename: string;
  birthdate: string;
  location: Point;
  owner: UserResponse;
};
