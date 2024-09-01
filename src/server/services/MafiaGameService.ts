import { cloneDeep, sortBy } from 'lodash';
import { SocketService } from './index';
import {
  MafiaGame,
  MafiaGameDoc,
  MafiaGamePick,
  MafiaGamePickDoc,
} from '../schemas';
import {
  MafiaGameConfig,
  MafiaGameState,
  MafiaGameTurn,
  MafiaGameUser,
  MafiaUserType,
} from '../../../types';

class MafiaGameService {
  // In Milliseconds
  private TURN_TIME = 25000;

  private DEFAULT_CONFIG: MafiaGameConfig = {
    numMafias: 1,
    numCops: 0,
    numDoctors: 0,
  };

  private gameIdToSocket: Record<
    string,
    {
      users: {
        localStorageId: string;
        socketId?: string;
      }[];
    }
  > = {};

  private async waitInterval(ms: number) {
    await new Promise((res) => setTimeout(res, ms));
  }

  private generateRandomHex(size: number) {
    return [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }

  public async joinGame(
    gameId: string,
    socketId: string,
    addUser: MafiaGameUser,
  ) {
    const game = await MafiaGame.findOne({
      roomId: gameId,
      isDeleted: { $ne: true },
    })
      .select('users state')
      .lean<Pick<MafiaGameDoc, '_id' | 'users' | 'state'>>();
    if (!game || game.state === MafiaGameState.Ended) {
      throw new Error('Cannot join non-existing game.');
    }

    const userInUsers = game.users.find(
      (user) => user.localStorageId === addUser.localStorageId,
    );
    if (game.state === MafiaGameState.InGame && !userInUsers) {
      throw new Error('Cannot join a started game if you are not a member.');
    }

    const dupeName = game.users.find(
      (user) =>
        user.localStorageId !== addUser.localStorageId &&
        user.userName === addUser.userName,
    );
    if (dupeName) {
      throw new Error('Cannot join due to user with same name.');
    }

    if (!userInUsers) {
      await MafiaGame.findByIdAndUpdate(game._id, {
        $push: {
          users: {
            localStorageId: addUser.localStorageId,
            userName: addUser.userName,
          },
        },
      });
    }

    // Has to join room first
    await SocketService.joinSocketRoom(gameId, socketId);

    // Add to game map
    const { users } = this.gameIdToSocket[gameId];
    this.gameIdToSocket[gameId].users = [
      ...users.filter((user) => user.localStorageId !== addUser.localStorageId),
      {
        localStorageId: addUser.localStorageId,
        socketId,
      },
    ];

    // Then emit to room
    await SocketService.emitSocketEventAck(
      'playerJoin',
      gameId,
      userInUsers
        ? {
            localStorageId: userInUsers.localStorageId,
            userName: userInUsers.userName,
            isMc: userInUsers.isMc,
          }
        : addUser,
    );

    const updatedGame = await MafiaGame.findById(game._id)
      .select('users turn state')
      .lean<Pick<MafiaGameDoc, '_id' | 'users' | 'turn' | 'state'>>();

    return {
      state: updatedGame?.state,
      users: updatedGame?.users.map((u) => ({
        localStorageId: u.localStorageId,
        userName: u.userName,
        isMc: u.isMc,
      })),
      turn: updatedGame?.turn,
      ...(userInUsers?.userType && { role: userInUsers.userType }),
    };
  }

  private checkGameConfig(config: MafiaGameConfig, users: number) {
    if (config.numMafias < 1) {
      throw new Error('You need at least one mafia to start.');
    }

    const withRoles = config.numMafias + config.numCops + config.numDoctors;
    if (users - withRoles <= 0) {
      throw new Error('You need at least one civilian to start.');
    }

    const majority = Math.ceil(users / 2);
    if (config.numMafias >= majority) {
      throw new Error(
        'Number of mafias should be less than half of total players.',
      );
    }
  }

  private assignRoles(gameConfig: MafiaGameConfig, users: MafiaGameUser[]) {
    const indexesToDraft = Array(users.length)
      .fill(1)
      .map((_val, index) => index);

    const copiedUsers = cloneDeep(users);

    for (let i = 0; i < gameConfig.numMafias; i += 1) {
      const drafted = Math.ceil(Math.random() * indexesToDraft.length) - 1;
      const index = indexesToDraft.splice(drafted, 1)[0];
      copiedUsers[index].userType = MafiaUserType.Mafia;
    }

    for (let i = 0; i < gameConfig.numCops; i += 1) {
      const drafted = Math.ceil(Math.random() * indexesToDraft.length) - 1;
      const index = indexesToDraft.splice(drafted, 1)[0];
      copiedUsers[index].userType = MafiaUserType.Cop;
    }

    for (let i = 0; i < gameConfig.numDoctors; i += 1) {
      const drafted = Math.ceil(Math.random() * indexesToDraft.length) - 1;
      const index = indexesToDraft.splice(drafted, 1)[0];
      copiedUsers[index].userType = MafiaUserType.Doctor;
    }

    indexesToDraft.forEach((indexVal) => {
      copiedUsers[indexVal].userType = MafiaUserType.Civilian;
    });

    return copiedUsers;
  }

  public async startGame(gameId: string, gameConfig: MafiaGameConfig) {
    if (!gameId || !gameConfig || !this.gameIdToSocket[gameId]) {
      throw new Error('Cannot start game.');
    }

    const game = await MafiaGame.findOne({
      roomId: gameId,
      isDeleted: { $ne: true },
    })
      .select('state users')
      .lean<Pick<MafiaGameDoc, '_id' | 'state' | 'users'>>();

    if (!game || game.state !== MafiaGameState.Waiting) {
      throw new Error('The game is not in waiting state.');
    }

    // Validate game config and settings
    this.checkGameConfig(gameConfig, game.users.length);

    // Assign roles to user
    const usersWithRole = this.assignRoles(gameConfig, game.users);

    // Update MongoDB
    await MafiaGame.findByIdAndUpdate(game._id, {
      config: gameConfig,
      numPeopleLeft: usersWithRole.length,
      turn: MafiaGameTurn.Day,
      users: usersWithRole,
      state: MafiaGameState.InGame,
    });

    // Send socket event to each user with only their roles
    const { users: usersWithSocket } = this.gameIdToSocket[gameId];
    await Promise.all(
      usersWithRole.map((user) => {
        const socketId = usersWithSocket.find(
          (u) => u.localStorageId === user.localStorageId,
        )?.socketId;
        if (!socketId) return null;
        return SocketService.emitSocketEventAck('gameStart', socketId, {
          role: user.userType,
        });
      }),
    );
  }

  public async createGame(mcUser: MafiaGameUser, socketId: string) {
    let roomId: string;
    let dupe = false;

    // this is brittle way of checking duplicate
    do {
      roomId = this.generateRandomHex(8);
      const exists = await MafiaGame.exists({
        roomId,
      });
      dupe = Boolean(exists);
    } while (dupe);

    await MafiaGame.create({
      roomId,
      config: this.DEFAULT_CONFIG,
      numPeopleLeft: 1,
      turn: MafiaGameTurn.Day,
      users: [mcUser],
      state: MafiaGameState.Waiting,
    });

    this.gameIdToSocket[roomId] = {
      users: [{ localStorageId: mcUser.localStorageId, socketId }],
    };
    await SocketService.joinSocketRoom(roomId, socketId);
    // Then emit to room
    await SocketService.emitSocketEventAck('playerJoin', roomId, mcUser);

    return roomId;
  }

  public async leaveGame(
    gameId: string,
    localStorageId: string,
    onDeath?: boolean,
    onVote?: boolean,
  ) {
    if (!gameId || !localStorageId) {
      throw new Error('Cannot leave game.');
    }

    const game = await MafiaGame.findOne({
      roomId: gameId,
      isDeleted: { $ne: true },
    })
      .select('state users')
      .lean();

    const userInGame = game?.users.find(
      (user) => user.localStorageId === localStorageId,
    );
    if (!game || game.state === MafiaGameState.Ended || !userInGame) {
      throw new Error('Cannot leave game.');
    }

    const newUsers = game.users.filter(
      (user) => user.localStorageId !== localStorageId,
    );

    // If MC left, change MC to someone else
    let mcChanged = false;
    if (userInGame.isMc && newUsers.length) {
      newUsers[0].isMc = true;
      mcChanged = true;
    }

    // Leave from Socket room
    const leaverSocketId = this.gameIdToSocket[gameId]?.users.find(
      (user) => user.localStorageId === localStorageId,
    )?.socketId;

    // Update MongoDB and socket Map, emit playlerLeave for others
    if (newUsers.length) {
      await MafiaGame.findByIdAndUpdate(game._id, {
        users: newUsers,
      });
      if (this.gameIdToSocket[gameId]) {
        const { users } = this.gameIdToSocket[gameId];
        this.gameIdToSocket[gameId].users = users.filter(
          (user) => user.localStorageId !== localStorageId,
        );
      }

      await SocketService.emitSocketEventAck('playerLeave', gameId, {
        localStorageId,
        userName: userInGame.userName,
        ...(mcChanged && { newMcId: newUsers[0].localStorageId }),
        onDeath,
        onVote,
      });
    } else {
      await MafiaGame.findByIdAndUpdate(game._id, {
        users: [],
        gameEnd: new Date(),
        isDeleted: true,
      });
      delete this.gameIdToSocket[gameId];
    }

    if (leaverSocketId) {
      await SocketService.leaveSocketRoom(gameId, leaverSocketId);
    }

    if (newUsers.length && game.state === MafiaGameState.InGame) {
      await this.checkIfGameEnd(gameId);
    }
  }

  private async checkIfGameEnd(gameId: string) {
    if (!gameId) return;

    const game = await MafiaGame.findOne({
      roomId: gameId,
      isDeleted: { $ne: true },
    })
      .select('state users')
      .lean<Pick<MafiaGameDoc, '_id' | 'state' | 'users'>>();

    if (!game || game.state !== MafiaGameState.InGame) return;

    if (!game.users.length) {
      await MafiaGame.findByIdAndUpdate(game._id, {
        isDeleted: true,
      });
      delete this.gameIdToSocket[gameId];
      return;
    }

    const numMafias = game.users.filter(
      (u) => u.userType === MafiaUserType.Mafia,
    ).length;
    const numCivilians = game.users.filter(
      (u) => u.userType === MafiaUserType.Civilian,
    ).length;
    const rest = game.users.length - numMafias;
    if (!numCivilians || !numMafias || rest <= numMafias) {
      const winner = !numMafias ? 'Civilians' : 'Mafias';
      await SocketService.emitSocketEventAck('gameEnd', gameId, {
        winner,
      });
      await MafiaGame.findByIdAndUpdate(game._id, {
        gameEnd: new Date(),
        winner,
        isDeleted: true,
      });
      delete this.gameIdToSocket[gameId];
    }
  }

  public async endDay(gameId: string) {
    if (!gameId) {
      throw new Error('Cannot end turn.');
    }

    const game = await MafiaGame.findOne({
      roomId: gameId,
      isDeleted: { $ne: true },
    })
      .select('state turn')
      .lean<Pick<MafiaGameDoc, '_id' | 'state' | 'turn'>>();

    if (
      !game ||
      game.state !== MafiaGameState.InGame ||
      game.turn !== MafiaGameTurn.Day
    ) {
      throw new Error('Cannot end turn.');
    }

    await MafiaGame.findByIdAndUpdate(game._id, {
      turn: MafiaGameTurn.Mafia,
    });
    await SocketService.emitSocketEventAck('turnChange', gameId, {
      turn: MafiaGameTurn.Mafia,
    });
    this.startMafiaTurn(gameId);
  }

  private TURN_MAP: Record<MafiaGameTurn, MafiaUserType> = {
    [MafiaGameTurn.Day]: MafiaUserType.Civilian,
    [MafiaGameTurn.Mafia]: MafiaUserType.Mafia,
    [MafiaGameTurn.Cop]: MafiaUserType.Cop,
    [MafiaGameTurn.Doctor]: MafiaUserType.Doctor,
  };

  public async updatePick(
    gameId: string,
    localStorageId: string,
    pickedId: string,
    turn: MafiaGameTurn,
  ) {
    if (!gameId || !localStorageId || !pickedId || !turn) {
      throw new Error('Cannot end turn.');
    }

    const game = await MafiaGame.findOne({
      roomId: gameId,
      isDeleted: { $ne: true },
      turn,
    })
      .select('state turn users')
      .lean<Pick<MafiaGameDoc, '_id' | 'state' | 'turn' | 'users'>>();

    const currentUser = game?.users.find(
      (u) => u.localStorageId === localStorageId,
    );
    if (
      !game ||
      game.state !== MafiaGameState.InGame ||
      !currentUser ||
      currentUser.userType !== this.TURN_MAP[turn] ||
      !this.gameIdToSocket[gameId]
    ) {
      throw new Error(`Cannot pick for ${this.TURN_MAP[turn]}.`);
    }

    const pickerIds = game.users
      .filter((u) => u.userType === this.TURN_MAP[turn])
      .map((u) => u.localStorageId);
    const socketIds = this.gameIdToSocket[gameId].users
      .filter((u) => pickerIds.includes(u.localStorageId))
      .map((u) => u.socketId)
      .filter(Boolean);

    await MafiaGamePick.updateOne(
      {
        gameId,
        userType: this.TURN_MAP[turn],
        pickerId: localStorageId,
      },
      {
        pickedId,
      },
      {
        upsert: true,
      },
    );

    const picks = await MafiaGamePick.find({
      gameId,
      userType: this.TURN_MAP[turn],
    })
      .select('pickedId')
      .lean<Pick<MafiaGamePickDoc, '_id' | 'pickedId'>[]>();
    const pickMap = picks.reduce<Record<string, number>>((acc, cur) => {
      if (!acc[cur.pickedId]) {
        acc[cur.pickedId] = 1;
      } else {
        acc[cur.pickedId] += 1;
      }
      return acc;
    }, {});

    await Promise.all(
      socketIds.map((socketId) =>
        SocketService.emitSocketEventAck('updatePick', socketId!, {
          pickMap,
        }),
      ),
    );
  }

  private getDraftedPickedId(
    picks: Pick<MafiaGamePickDoc, '_id' | 'pickedId'>[],
  ) {
    const countMap = picks.reduce<Record<string, number>>((acc, cur) => {
      if (!acc[cur.pickedId]) {
        acc[cur.pickedId] = 1;
      } else {
        acc[cur.pickedId] += 1;
      }
      return acc;
    }, {});

    const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
    const max = sorted[0][1];
    const draft: string[] = [];
    sorted.forEach((s) => {
      if (s[1] === max) {
        draft.push(s[0]);
      }
    });
    const draftedIndex = Math.floor(Math.random() * draft.length);
    return draft[draftedIndex];
  }

  private async startMafiaTurn(gameId: string) {
    await this.waitInterval(this.TURN_TIME);
    await MafiaGame.updateOne(
      { roomId: gameId, isDeleted: { $ne: true } },
      { turn: MafiaGameTurn.Cop },
    );

    const picks = await MafiaGamePick.find({
      gameId,
      userType: MafiaUserType.Mafia,
    })
      .select('pickedId')
      .lean<Pick<MafiaGamePickDoc, '_id' | 'pickedId'>[]>();
    if (!picks.length) {
      await SocketService.emitSocketEventAck('turnChange', gameId, {
        turn: MafiaGameTurn.Cop,
      });
    } else {
      const drafted = this.getDraftedPickedId(picks);

      await Promise.all([
        MafiaGamePick.deleteMany({
          gameId,
          userType: MafiaUserType.Mafia,
        }),
        MafiaGame.updateOne(
          { roomId: gameId, isDeleted: { $ne: true } },
          { mafiaPick: drafted },
        ),
        SocketService.emitSocketEventAck('turnChange', gameId, {
          turn: MafiaGameTurn.Cop,
        }),
      ]);
    }

    this.startCopTurn(gameId);
  }

  private async startCopTurn(gameId: string) {
    await this.waitInterval(this.TURN_TIME);
    await MafiaGame.updateOne(
      { roomId: gameId, isDeleted: { $ne: true } },
      { turn: MafiaGameTurn.Doctor },
    );

    const [picks, game] = await Promise.all([
      MafiaGamePick.find({
        gameId,
        userType: MafiaUserType.Cop,
      })
        .select('pickedId')
        .lean<Pick<MafiaGamePickDoc, '_id' | 'pickedId'>[]>(),
      MafiaGame.findOne({ roomId: gameId, isDeleted: { $ne: true } })
        .select('users')
        .lean<Pick<MafiaGameDoc, '_id' | 'users'>>(),
    ]);

    if (!game) {
      return;
    }

    if (!picks.length || !this.gameIdToSocket[gameId]) {
      await SocketService.emitSocketEventAck('turnChange', gameId, {
        turn: MafiaGameTurn.Doctor,
      });
    } else {
      const drafted = this.getDraftedPickedId(picks);
      const draftedUser = game.users.find((u) => u.localStorageId === drafted);

      const copIds = game.users
        .filter((u) => u.userType === MafiaUserType.Cop)
        .map((u) => u.localStorageId);
      const copSocketIds = this.gameIdToSocket[gameId].users
        .filter((u) => copIds.includes(u.localStorageId))
        .map((u) => u.socketId)
        .filter(Boolean);
      if (copSocketIds.length) {
        await Promise.all(
          copSocketIds.map((socketId) =>
            SocketService.emitSocketEventAck('copDetect', socketId!, {
              pickedId: drafted,
              pickedName: draftedUser?.userName,
              isMafia: draftedUser?.userType === MafiaUserType.Mafia,
            }),
          ),
        );
      }

      await Promise.all([
        MafiaGamePick.deleteMany({
          gameId,
          userType: MafiaUserType.Cop,
        }),
        SocketService.emitSocketEventAck('turnChange', gameId, {
          turn: MafiaGameTurn.Doctor,
        }),
      ]);
    }

    this.startDoctorTurn(game._id.toString());
  }

  private async startDoctorTurn(id: string) {
    await this.waitInterval(this.TURN_TIME);
    const gameDoc = await MafiaGame.findByIdAndUpdate(
      id,
      { turn: MafiaGameTurn.Day },
      { new: true },
    );
    if (!gameDoc) {
      return;
    }

    const picks = await MafiaGamePick.find({
      gameId: gameDoc.roomId,
      userType: MafiaUserType.Doctor,
    })
      .select('pickedId')
      .lean<Pick<MafiaGamePickDoc, '_id' | 'pickedId'>[]>();

    if (picks.length) {
      const drafted = this.getDraftedPickedId(picks);
      const saved = Boolean(gameDoc.mafiaPick) && gameDoc.mafiaPick === drafted;

      await Promise.all([
        MafiaGamePick.deleteMany({
          gameId: gameDoc.roomId,
          userType: MafiaUserType.Doctor,
        }),
        saved && MafiaGame.findByIdAndUpdate(id, { $unset: { mafiaPick: 1 } }),
      ]);
    }

    await this.startDay(id);
  }

  private async startDay(id: string) {
    const game = await MafiaGame.findById(id)
      .select('mafiaPick roomId')
      .lean<Pick<MafiaGameDoc, '_id' | 'mafiaPick' | 'roomId'>>();

    if (!game) {
      return;
    }

    await MafiaGame.findByIdAndUpdate(id, {
      $unset: { mafiaPick: 1 },
    });

    if (game.mafiaPick) {
      await this.leaveGame(game.roomId, game.mafiaPick, true);
    }

    await SocketService.emitSocketEventAck('turnChange', game.roomId, {
      turn: MafiaGameTurn.Day,
      safe: !game.mafiaPick,
    });
  }
}

export default new MafiaGameService();
