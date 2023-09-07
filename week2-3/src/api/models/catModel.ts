import {Schema, model} from 'mongoose';
import {Cat} from '../../interfaces/Cat';

const catSchema = new Schema<Cat>({
  name: {
    type: String,
    required: true,
  },
  weight: Number,
  birthdate: Date,
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: [Number],
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

catSchema.set('toJSON', {
  transform: (_doc, ret: Partial<Cat>, _opt) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default model<Cat>('Cat', catSchema);
