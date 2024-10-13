import { RequestHandler } from 'express';
import { FrenchWordleService, UserService } from '../services';

const createNewWord: RequestHandler = async (req, res) => {
  const { englishWord, frenchWord } = req.body;
  // TODO: Get user from logged in state
  const randomUser = await UserService.fetchRandomUser();
  const roomId = await FrenchWordleService.createNewWord({
    englishWord,
    frenchWord,
    userId: randomUser!._id.toString(),
  });
  return res.json({ roomId });
};

// TODO: Add middlewares for policy guarding
export default {
  'post /create_new_word': [createNewWord],
};
