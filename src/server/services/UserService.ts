import { User, UserDoc } from '../schemas';

// This is a mongodb collection class

class UserService {
  public async findById(id: string) {
    // No projection needed for now, however, consider using 'select'
    return User.findById(id).lean();
  }

  public async createDummyUser() {
    await User.create({
      username: 'Test User',
      wins: 0,
      loses: 0,
    });
  }

  public async fetchRandomUser() {
    return User.findOne({}).lean<UserDoc>({ virtuals: true });
  }
}

export default new UserService();
