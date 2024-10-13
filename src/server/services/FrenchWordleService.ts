import { FrenchWordStatus } from '../../../modelTypes';
import { FrenchWord } from '../schemas';

class FrenchWordleService {
  async createNewWord({
    englishWord,
    frenchWord,
    userId,
  }: {
    englishWord: string;
    frenchWord: string;
    userId: string;
  }) {
    if (!englishWord || !frenchWord) {
      throw new Error(
        'You must pass non-empty english word and french word to create a question.',
      );
    }

    if (!userId) {
      throw new Error(
        'You must provide user ID of who is creating the question.',
      );
    }

    const exists = await FrenchWord.exists({
      englishWord,
    }).lean();

    if (exists) {
      return { isNew: false };
    }

    await FrenchWord.create({
      englishWord,
      frenchWord,
      status: FrenchWordStatus.Unverified,
      userId,
    });

    return { isNew: true };
  }

  async acceptWordRequest(wordId: string) {
    await FrenchWord.findByIdAndUpdate(wordId, {
      status: FrenchWordStatus.Verified,
    });
  }

  async denyWordRequest(wordId: string) {
    await FrenchWord.findByIdAndUpdate(wordId, {
      isDeleted: true,
    });
  }

  async adminListWords(wordCount: number) {
    await FrenchWord.find({
      status: FrenchWordStatus.Unverified,
      isDeleted: { $ne: true },
    });
    // TODO:
  }
}

export default new FrenchWordleService();
