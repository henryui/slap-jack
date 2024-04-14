import mongoose, { Schema } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import mongooseLeanGetters from 'mongoose-lean-getters';
import { IUser } from '../../types';

const UserSchema = new Schema<IUser>(
  {
    username: String,
    wins: Number,
    loses: Number
  },
  {
    collection: 'user',
    timestamps: true,
    versionKey: false,
    strict: true
  }
);

UserSchema.plugin(mongooseLeanVirtuals).plugin(mongooseLeanGetters);

const User = mongoose.model('User', UserSchema);

export { User, UserSchema };
