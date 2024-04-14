import { User } from './schemas';

// This is a mongodb collection class

class UserService {
  public async findById(id: string) {
    // No projection needed for now, however, consider using 'select'
    return User.findById(id).lean();
  }
}

export default new UserService();
