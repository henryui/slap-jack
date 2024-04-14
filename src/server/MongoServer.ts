import { MongoMemoryServer } from 'mongodb-memory-server';

class MongoServer {
  private mongod?: MongoMemoryServer;

  public async create(port: number) {
    this.mongod = await MongoMemoryServer.create({
      instance: { port, dbName: 'challenge' }
    });

    process.on('exit', () => this.mongod?.stop());

    const uri = this.mongod.getUri();

    return uri;
  }
}

export default new MongoServer();
