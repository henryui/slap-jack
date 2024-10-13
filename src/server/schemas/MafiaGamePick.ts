import mongoose, { Schema, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import mongooseLeanGetters from 'mongoose-lean-getters';
import { MafiaGamePickType, MafiaUserType } from '../../../types';

export interface MafiaGamePickDoc extends MafiaGamePickType, Document {
  _id: Types.ObjectId;
  id: string;
}

const MafiaGamePickSchema = new Schema<MafiaGamePickDoc>(
  {
    gameId: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: Object.keys(MafiaUserType),
      required: true,
    },
    pickerId: {
      type: String,
      required: true,
    },
    pickedId: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'mafiagamepick',
    timestamps: true,
    versionKey: false,
    strict: true,
  },
);

MafiaGamePickSchema.plugin(mongooseLeanVirtuals).plugin(mongooseLeanGetters);

const MafiaGamePick = mongoose.model('MafiaGamePick', MafiaGamePickSchema);

export { MafiaGamePick, MafiaGamePickSchema };
