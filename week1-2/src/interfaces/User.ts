import {RowDataPacket} from 'mysql2';

export interface User {
  user_id: number;
  user_name: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
}

export interface GetUser extends RowDataPacket, User {}

export type PostUser = Omit<User, 'user_id'>;

export type PutUser = Partial<PostUser>;
