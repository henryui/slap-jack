import mongoose, { Schema, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import mongooseLeanGetters from 'mongoose-lean-getters';
import {
  FrenchWordStatus,
  FrenchWord as IFrenchWord,
} from '../../../modelTypes';

export interface FrenchWordDoc extends IFrenchWord, Document {
  _id: Types.ObjectId;
  id: string;
}

const FrenchWordSchema = new Schema<FrenchWordDoc>(
  {
    englishWord: {
      type: String,
      required: true,
    },
    frenchWord: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.keys(FrenchWordStatus),
      required: true,
    },
    isDeleted: Boolean,
    userId: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'frenchword',
    timestamps: true,
    versionKey: false,
    strict: true,
  },
);

FrenchWordSchema.plugin(mongooseLeanVirtuals).plugin(mongooseLeanGetters);

const FrenchWord = mongoose.model('FrenchWord', FrenchWordSchema);

export { FrenchWord, FrenchWordSchema };
