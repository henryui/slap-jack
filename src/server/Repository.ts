// Shouldn't need to change this file
import mongoose from 'mongoose';
import UserService from './services/UserService';

class Repository {
  public async connect(uri: string) {
    await mongoose.connect(uri);

    console.log('Connected to DB');

    await this.seed();
    console.log('Seeded the DB');

    process.on('exit', () => mongoose.disconnect());
  }

  private async seed() {
    await UserService.createDummyUser();
  }
}

export default new Repository();
