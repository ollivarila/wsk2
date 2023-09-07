import {Schema, model} from 'mongoose';
import {User} from '../../interfaces/User';

const userSchema = new Schema<User>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
    default: 'user',
  },
});

userSchema.set('toJSON', {
  transform: (_doc, ret: Partial<User>, _opt) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.role;
    return ret;
  },
});

export default model<User>('User', userSchema);
