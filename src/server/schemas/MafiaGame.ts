import mongoose, { Schema, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import mongooseLeanGetters from 'mongoose-lean-getters';
import {
  MafiaGameState,
  MafiaGameTurn,
  MafiaGameType,
  MafiaUserType,
} from '../../../types';

export interface MafiaGameDoc extends MafiaGameType, Document {
  _id: Types.ObjectId;
  id: string;
}

const MafiaGameSchema = new Schema<MafiaGameDoc>(
  {
    roomId: {
      type: String,
      required: true,
    },
    config: {
      numMafias: {
        type: Number,
        required: true,
      },
      numCops: {
        type: Number,
        required: true,
      },
      numDoctors: {
        type: Number,
        required: true,
      },
      multiSelect: {
        type: Boolean,
      },
    },
    numPeopleLeft: {
      type: Number,
      required: true,
    },
    turn: {
      type: String,
      required: true,
      enum: Object.keys(MafiaGameTurn),
    },
    users: [
      {
        localStorageId: {
          type: String,
          required: true,
        },
        userName: {
          type: String,
          required: true,
        },
        isMc: {
          type: Boolean,
        },
        userType: {
          type: String,
          enum: [null, ...Object.keys(MafiaUserType)],
        },
        _id: false,
      },
    ],
    state: {
      type: String,
      required: true,
      enum: Object.keys(MafiaGameState),
    },
    mafiaPick: {
      type: String,
    },
    gameEnd: {
      type: Date,
    },
    winner: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
    },
  },
  {
    collection: 'mafiagame',
    timestamps: true,
    versionKey: false,
    strict: true,
  },
);

MafiaGameSchema.plugin(mongooseLeanVirtuals).plugin(mongooseLeanGetters);

const MafiaGame = mongoose.model('MafiaGame', MafiaGameSchema);

export { MafiaGame, MafiaGameSchema };
