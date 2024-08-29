import React, { createContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { Modal, message } from 'antd';
import { io, Socket } from 'socket.io-client';
import { MafiaGameState } from '../types';
import {
  MafiaGameConfig,
  MafiaGameState as ServerState,
  MafiaGameUser,
  MafiaGameTurn,
  MafiaUserType,
} from '../../../types';

const DEFAULT_CONFIG: MafiaGameConfig = {
  numMafias: 1,
  numCops: 0,
  numDoctors: 0,
};

// In Milliseconds
export const SECOND = 1000;
const MAX_TIME = 20000;

export type GameUserWithCount = MafiaGameUser & { pickedCount?: number };

export type MafiaGameContextType = {
  joinedRoomId: string;
  config: MafiaGameConfig;
  setConfig: React.Dispatch<React.SetStateAction<MafiaGameConfig>>;
  currentUser: MafiaGameUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<MafiaGameUser>>;
  noNameError: boolean;
  users: GameUserWithCount[];
  setUsers: React.Dispatch<React.SetStateAction<GameUserWithCount[]>>;
  gameState: MafiaGameState;
  gameTurn: MafiaGameTurn;
  createGame: () => Promise<void>;
  joinGame: (roomId: string) => Promise<void>;
  startGame: () => Promise<void>;
  voteLeave: (votedId: string) => Promise<void>;
  leaveGame: () => Promise<void>;
  endDay: () => Promise<void>;
  loading: boolean;
  updatePick: (pickedId: string) => Promise<void>;
  pickTimer: number;
};

interface MafiaGameContextProviderProps {
  children: React.ReactNode;
}

const MafiaGameContext = createContext<MafiaGameContextType>(
  {} as MafiaGameContextType,
);

export const MafiaGameContextProvider: React.FC<
  MafiaGameContextProviderProps
> = ({ children }) => {
  const [joinedRoomId, setJoinedRoomId] = useState('');
  const [currentUser, setCurrentUser] = useState<MafiaGameUser>({
    localStorageId: '',
    userName: '',
  });
  const [noNameError, setNoNameError] = useState(false);
  const [users, setUsers] = useState<GameUserWithCount[]>([]);
  const [config, setConfig] = useState<MafiaGameConfig>(DEFAULT_CONFIG);
  const [gameState, setGameState] = useState<MafiaGameState>(
    MafiaGameState.setConfig,
  );
  const [gameTurn, setGameTurn] = useState<MafiaGameTurn>(MafiaGameTurn.Day);
  const [loading, setLoading] = useState(false);
  const [pickTimer, setPickTimer] = useState(0);
  const ioRef = useRef<Socket>();
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let storedUid = localStorage.getItem('minigameheaven-mafiagame-uid');
    if (!storedUid) {
      storedUid = nanoid();
      localStorage.setItem('minigameheaven-mafiagame-uid', storedUid);
    }
    setCurrentUser((prev) => ({
      ...prev,
      localStorageId: storedUid as string,
    }));
  }, []);

  useEffect(() => {
    if (currentUser.localStorageId) {
      ioRef.current = process.env.SOCKET_URL
        ? io(process.env.SOCKET_URL)
        : io();
      ioRef.current.on('connect', () => {
        ioRef.current!.on('error', (errMessage: string) => {
          message.error(errMessage);
        });

        ioRef.current!.on('playerJoin', (joinedPlayer: MafiaGameUser, cb) => {
          cb();
          setUsers((prev) => [
            ...prev.filter(
              (u) => u.localStorageId !== joinedPlayer.localStorageId,
            ),
            joinedPlayer,
          ]);
        });

        ioRef.current!.on(
          'playerLeave',
          (
            {
              localStorageId,
              userName,
              newMcId,
              onDeath,
              onVote,
            }: {
              localStorageId: string;
              userName: string;
              newMcId?: string;
              onDeath?: boolean;
              onVote?: boolean;
            },
            cb,
          ) => {
            cb();

            if (onDeath) {
              message.info(`${userName}님이 마피아에 의해 죽었습니다!`);
            } else if (onVote) {
              message.info(`${userName}님이 추방당했습니다!`);
            }

            if (currentUser.localStorageId === localStorageId) {
              setJoinedRoomId('');
              setCurrentUser((prev) => ({
                localStorageId: prev.localStorageId,
                userName: prev.userName,
              }));
              setUsers([]);
              setConfig(DEFAULT_CONFIG);
              setGameTurn(MafiaGameTurn.Day);
              setGameState(MafiaGameState.setConfig);
              return;
            }

            setUsers((prev) =>
              prev
                .filter((u) => u.localStorageId !== localStorageId)
                .map((u) => ({
                  ...u,
                  ...(Boolean(newMcId && u.localStorageId === newMcId) && {
                    isMc: true,
                  }),
                })),
            );
            if (newMcId && currentUser.localStorageId === newMcId) {
              setCurrentUser((prev) => ({
                ...prev,
                isMc: true,
              }));
            }
          },
        );

        ioRef.current!.on(
          'gameStart',
          ({ role }: { role: MafiaUserType }, cb) => {
            cb();
            setCurrentUser((prev) => ({
              ...prev,
              userType: role,
            }));
            setGameTurn(MafiaGameTurn.Day);
            setGameState(MafiaGameState.inGame);
          },
        );

        ioRef.current!.on(
          'turnChange',
          ({ turn, safe }: { turn: MafiaGameTurn; safe?: boolean }, cb) => {
            cb();
            setUsers((prev) =>
              prev.map((u) => ({
                ...u,
                pickedCount: 0,
              })),
            );
            setGameTurn(turn);
            setPickTimer(MAX_TIME);
            if (turn !== MafiaGameTurn.Day) {
              timerRef.current = setInterval(() => {
                setPickTimer((prev) =>
                  prev - SECOND >= 0 ? prev - SECOND : 0,
                );
              }, SECOND);
            }

            if (safe) {
              message.success('아무도 죽지 않았습니다!');
            }
          },
        );

        ioRef.current!.on(
          'updatePick',
          ({ pickMap = {} }: { pickMap: Record<string, number> }, cb) => {
            cb();
            setUsers((prev) =>
              prev.map((u) => ({
                ...u,
                pickedCount: pickMap[u.localStorageId] || 0,
              })),
            );
          },
        );

        ioRef.current!.on(
          'gameEnd',
          ({ winner }: { winner: 'Civilians' | 'Mafias' }, cb) => {
            cb();
            Modal.info({
              title: winner === 'Civilians' ? '시민 승리!' : '마피아 승리!',
              okText: '확인',
              closable: false,
              maskClosable: false,
              afterClose: () => {
                setJoinedRoomId('');
                setCurrentUser((prev) => ({
                  localStorageId: prev.localStorageId,
                  userName: prev.userName,
                }));
                setUsers([]);
                setConfig(DEFAULT_CONFIG);
                setGameTurn(MafiaGameTurn.Day);
                setGameState(MafiaGameState.setConfig);
              },
            });
          },
        );

        ioRef.current!.on(
          'copDetect',
          (
            {
              pickedName,
              isMafia,
            }: {
              pickedName: string;
              isMafia: boolean;
            },
            cb,
          ) => {
            cb();
            if (isMafia) {
              Modal.success({
                title: `${pickedName}은...`,
                content: '마피아가 맞습니다!',
                okText: '확인',
                closable: false,
              });
            } else {
              Modal.warn({
                title: `${pickedName}은...`,
                content: '마피아가 아닙니다.',
                okText: '확인',
                closable: false,
              });
            }
          },
        );
      });
    }

    return () => {
      ioRef.current?.disconnect();
    };
  }, [currentUser.localStorageId]);

  useEffect(() => {
    if (pickTimer === 0 && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [pickTimer]);

  useEffect(() => {
    setNoNameError(false);
  }, [currentUser.userName]);

  const startGame = async () => {
    if (!joinedRoomId) return;

    const withRoles = config.numMafias + config.numCops + config.numDoctors;
    if (users.length - withRoles <= 0) {
      Modal.error({
        title: '시민이 한 명 이상 존재해야 합니다.',
      });
      return;
    }

    const majority = Math.ceil(users.length / 2);
    if (config.numMafias >= majority) {
      Modal.error({
        title: '마피아가 과반수 이하여야 합니다.',
      });
      return;
    }

    if (!ioRef.current?.connected) {
      message.error('Error starting game, please refresh the page.');
    }

    try {
      await axios.post(`/api/mafia_game/${joinedRoomId}/start`, {
        gameConfig: config,
      });
    } catch (err) {
      message.error('Cannot start game.');
    }
  };

  const createGame = async () => {
    if (!currentUser.userName) {
      setNoNameError(true);
      return;
    }
    if (!ioRef.current?.connected) {
      message.error('Error creating game, please refresh the page.');
    }

    try {
      const { data } = await axios.post<{
        roomId: string;
      }>('/api/mafia_game', {
        mcUser: {
          localStorageId: currentUser.localStorageId,
          userName: currentUser.userName,
          isMc: true,
        },
        socketId: ioRef.current!.id,
      });
      setCurrentUser((prev) => ({
        ...prev,
        isMc: true,
      }));
      setJoinedRoomId(data.roomId);
      setGameState(MafiaGameState.inWaitingRoom);
    } catch (err) {
      message.error('Cannot create game.');
    }
  };

  const joinGame = async (roomId: string) => {
    if (!roomId) return;
    if (!currentUser.userName) {
      setNoNameError(true);
      return;
    }
    if (!ioRef.current?.connected) {
      message.error('Error joining game, please refresh the page.');
    }

    try {
      const { data } = await axios.post<{
        state: ServerState;
        users: MafiaGameUser[];
        role?: MafiaUserType;
      }>(`/api/mafia_game/${roomId}/join`, {
        localStorageId: currentUser.localStorageId,
        userName: currentUser.userName,
        socketId: ioRef.current!.id,
      });
      setJoinedRoomId(roomId);
      setUsers(data.users);
      if (data.role) {
        setCurrentUser((prev) => ({
          ...prev,
          userType: data.role,
        }));
      }
      setGameState(
        data.state === ServerState.Waiting
          ? MafiaGameState.inWaitingRoom
          : MafiaGameState.inGame,
      );
    } catch (err) {
      message.error('Cannot join game. Try changing name.');
    }
  };

  const voteLeave = async (votedId: string) => {
    if (
      gameState === MafiaGameState.setConfig ||
      gameTurn !== MafiaGameTurn.Day
    ) {
      message.error('Cannot vote right now.');
      return;
    }

    const votedUser = users.find((u) => u.localStorageId === votedId);
    if (!votedUser) {
      message.error('Cannot vote non-existing user.');
      return;
    }

    Modal.warn({
      title: `${votedUser.userName}님을 투표로 추방하시겠습니까?`,
      okText: '확인',
      closable: true,
      onOk: async () => {
        try {
          await axios.post(`/api/mafia_game/${joinedRoomId}/leave`, {
            localStorageId: votedId,
            onVote: 'true',
          });
        } catch (err) {
          message.error('Cannot vote user.');
        }
      },
    });
  };

  const leaveGame = async () => {
    if (gameState === MafiaGameState.setConfig) {
      message.error('Cannot leave game.');
      return;
    }

    Modal.warn({
      title: '정말 게임을 나가시겠습니까?',
      okText: '확인',
      closable: true,
      onOk: async () => {
        try {
          await axios.post(`/api/mafia_game/${joinedRoomId}/leave`, {
            localStorageId: currentUser.localStorageId,
          });
          setJoinedRoomId('');
          setCurrentUser((prev) => ({
            localStorageId: prev.localStorageId,
            userName: prev.userName,
          }));
          setUsers([]);
          setConfig(DEFAULT_CONFIG);
          setGameTurn(MafiaGameTurn.Day);
          setGameState(MafiaGameState.setConfig);
        } catch (err) {
          message.error('Cannot leave game.');
        }
      },
    });
  };

  const endDay = async () => {
    if (!joinedRoomId) return;

    if (!ioRef.current?.connected) {
      message.error('Error ending turn, please refresh the page.');
    }

    try {
      await axios.post(`/api/mafia_game/${joinedRoomId}/end_day`);
    } catch (err) {
      message.error('Cannot end turn.');
    }
  };

  const updatePick = async (pickedId: string) => {
    if (!joinedRoomId || !pickedId || loading || !pickTimer) return;

    if (!ioRef.current?.connected) {
      message.error('Error picking user, please refresh the page.');
    }

    setLoading(true);
    try {
      await axios.post(`/api/mafia_game/${joinedRoomId}/pick`, {
        localStorageId: currentUser.localStorageId,
        pickedId,
        turn: gameTurn,
      });
    } catch (err) {
      message.error('Cannot pick user.');
    }
    setLoading(false);
  };

  return (
    <MafiaGameContext.Provider
      value={{
        joinedRoomId,
        config,
        setConfig,
        noNameError,
        currentUser,
        setCurrentUser,
        users,
        setUsers,
        gameState,
        gameTurn,
        createGame,
        joinGame,
        startGame,
        voteLeave,
        leaveGame,
        endDay,
        loading,
        updatePick,
        pickTimer,
      }}
    >
      {children}
    </MafiaGameContext.Provider>
  );
};

export default MafiaGameContext;
