import {CatResponse} from './Cat';
import {UserResponse} from './User';

export default interface DBMessageResponse {
  message: string;
  data: UserResponse | CatResponse;
}
