import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import SlapJackGameService from './SlapJackGameService';

class SocketService {
  private io: Server | null = null;

  public createSocket(server: HTTPServer) {
    if (this.io) return;
    this.io = new Server(server, {
      cors: {
        origin: process.env.ALLOWED_CORS_ORIGIN,
      },
    });
    this.io.on('connection', (socket) => {
      console.log('Client connected with ID', socket.id);

      socket.on(
        'getNextCard',
        async ({ gameId, userId }: { gameId: string; userId?: string }) => {
          const data = SlapJackGameService.getNextCard(gameId, userId);
          if (data.error) {
            socket.emit('error', data.error);
          } else if (data.result) {
            socket.emit('newCard', data.result);
          }
          if (data.withAI) {
            const dataAI = await SlapJackGameService.getNextCardAI(gameId);
            if (dataAI.error) {
              socket.emit('error', data.error);
            } else if (dataAI.result) {
              socket.emit('newCard', dataAI.result);
            }
          }
        },
      );
      // when socket disconnects, remove it from the list:
      // socket.on("disconnect", () => {
      //     sequenceNumberByClient.delete(socket);
      //     console.info(`Client gone [id=${socket.id}]`);
      // });
    });
  }

  public closeSocket() {
    if (!this.io) return;
    this.io.removeAllListeners();
    this.io.close();
    this.io = null;
  }
}

export default new SocketService();
