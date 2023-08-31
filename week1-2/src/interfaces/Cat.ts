import {RowDataPacket} from 'mysql2';
import {User} from './User';
export interface Cat {
  cat_id: number;
  cat_name: string;
  weight: number;
  filename: string;
  birthdate: string;
  lat: number;
  lng: number;
  owner: User | number;
}

export interface GetCat extends RowDataPacket, Cat {}

export type PostCat = Omit<Cat, 'cat_id'>;

export type PutCat = Partial<PostCat>;
