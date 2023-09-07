import {Document} from 'mongoose';

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export type UserPut = Partial<User>;

export type UserOutput = {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
};

export type UserResponse = {
  id: string;
  username: string;
  email: string;
};

export type UserTest = Partial<User>;
