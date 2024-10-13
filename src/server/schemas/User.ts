import mongoose, { Schema, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import mongooseLeanGetters from 'mongoose-lean-getters';
import { UserType } from '../../../types';

export interface UserDoc extends UserType, Document {
  _id: Types.ObjectId;
  id: string;
}

const UserSchema = new Schema<UserDoc>(
  {
    username: String,
    wins: Number,
    loses: Number,
  },
  {
    collection: 'user',
    timestamps: true,
    versionKey: false,
    strict: true,
  },
);

UserSchema.plugin(mongooseLeanVirtuals).plugin(mongooseLeanGetters);

const User = mongoose.model('User', UserSchema);

export { User, UserSchema };
