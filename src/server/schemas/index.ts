import { Types } from 'mongoose';

export const ObjectId = (stringId: string) => new Types.ObjectId(stringId);

export { User, UserSchema, UserDoc } from './User';

export {
  SlapJackGame,
  SlapJackGameSchema,
  SlapJackGameDoc,
} from './SlapJackGame';

// Mafia Game

export { MafiaGame, MafiaGameSchema, MafiaGameDoc } from './MafiaGame';

export {
  MafiaGamePick,
  MafiaGamePickSchema,
  MafiaGamePickDoc,
} from './MafiaGamePick';

export { FrenchWord, FrenchWordSchema, FrenchWordDoc } from './FrenchWord';
