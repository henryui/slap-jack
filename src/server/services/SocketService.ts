import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import SlapJackGameService from './SlapJackGameService';

class SocketService {
  private io: Server | null = null;

  public createSocket(server: HTTPServer) {
    if (this.io) return;
    this.io = new Server(server, {
      cors: {
        origin: process.env.ALLOWED_CORS_ORIGIN || '*',
      },
    });
    this.io.on('connection', (socket) => {
      console.log('Client connected with ID', socket.id);

      socket.on(
        'getNextCard',
        ({ gameId, userId }: { gameId: string; userId?: string }) => {
          SlapJackGameService.getNextCard(gameId, userId);
        },
      );

      socket.on(
        'slapCard',
        ({
          gameId,
          cardSet,
          userId,
        }: {
          gameId: string;
          cardSet: string;
          userId: string;
        }) => {
          SlapJackGameService.slapCard({
            gameId,
            cardSet,
            userId,
          });
        },
      );
      // when socket disconnects, remove it from the list:
      // socket.on("disconnect", () => {
      //     sequenceNumberByClient.delete(socket);
      //     console.info(`Client gone [id=${socket.id}]`);
      // });
    });
  }

  public emitSocketEvent(event: string, socketId: string, data: any) {
    if (!this.io) return;
    this.io.to(socketId).emit(event, data);
  }

  public closeSocket() {
    if (!this.io) return;
    this.io.removeAllListeners();
    this.io.close();
    this.io = null;
  }
}

export default new SocketService();
