import mongoose, { Schema, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import mongooseLeanGetters from 'mongoose-lean-getters';
import {
  CardNumber,
  CardShape,
  GameDifficulty,
  SlapJackGameMode,
  SlapJackGameType,
  UserType,
} from '../../types';

export const ObjectId = (stringId: string) => new Types.ObjectId(stringId);

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

export interface SlapJackGameDoc extends SlapJackGameType, Document {
  _id: Types.ObjectId;
  id: string;
}

const SlapJackGameSchema = new Schema<SlapJackGameDoc>(
  {
    turn: {
      type: String,
      required: true,
      enum: ['1', '2'],
    },
    player1Id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // If none, then the game is against AI.
    player2Id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    // Only exists with AI mode.
    gameConfig: {
      mode: {
        type: String,
        required: true,
        enum: Object.keys(SlapJackGameMode),
      },
      // Only exists with AI mode.
      difficulty: {
        type: String,
        enum: Object.keys(GameDifficulty),
      },
      pair: {
        type: Boolean,
        required: true,
      },
      oneBetweenPair: {
        type: Boolean,
        required: true,
      },
      sequence: {
        type: Boolean,
        required: true,
      },
      alphaCardRules: {
        type: Boolean,
        required: true,
      },
    },
    playedCardSet: [
      {
        shape: {
          type: String,
          enum: Object.keys(CardShape),
          required: true,
        },
        number: {
          type: String,
          enum: Object.keys(CardNumber),
          required: true,
        },
        _id: false,
      },
    ],
    player1CardSet: [
      {
        shape: {
          type: String,
          enum: Object.keys(CardShape),
          required: true,
        },
        number: {
          type: String,
          enum: Object.keys(CardNumber),
          required: true,
        },
        _id: false,
      },
    ],
    player2CardSet: [
      {
        shape: {
          type: String,
          enum: Object.keys(CardShape),
          required: true,
        },
        number: {
          type: String,
          enum: Object.keys(CardNumber),
          required: true,
        },
        _id: false,
      },
    ],
    player1Misclicks: {
      type: Number,
      default: 0,
      required: true,
    },
    player1Hits: {
      type: Number,
      default: 0,
      required: true,
    },
    player2Misclicks: {
      type: Number,
      default: 0,
      required: true,
    },
    player2Hits: {
      type: Number,
      default: 0,
      required: true,
    },
    // End game
    gameEnd: Date,
    winner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    collection: 'slapjackgame',
    timestamps: true,
    versionKey: false,
    strict: true,
  },
);

UserSchema.plugin(mongooseLeanVirtuals).plugin(mongooseLeanGetters);

const SlapJackGame = mongoose.model('SlapJackGame', SlapJackGameSchema);

export { SlapJackGame, SlapJackGameSchema };
