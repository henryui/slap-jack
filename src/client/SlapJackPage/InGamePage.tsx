import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Empty, Modal, message } from 'antd';
import styled from 'styled-components';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { transformToString, CARD_MODAL_CLOSE, TOTAL_CARDS } from '@constants';
import { UserContext } from '@contexts';
import { PlayingCardType } from '../types';
import PlayingCard from './PlayingCard';
import SlapJackFooter from './SlapJackFooter';
import { SlapJackGameMode } from '../../../types';
import SlapJackContext from './SlapJackContext';

interface InGamePageProps {}

const InGamePage: React.FC<InGamePageProps> = () => {
  const { currentUser } = useContext(UserContext);
  const { config, endGame } = useContext(SlapJackContext);
  const [playedCards, setPlayedCards] = useState<PlayingCardType[]>([]);
  const [cards, setCards] = useState<number>(0);
  const [gameInfo, setGameInfo] = useState<{
    gameId: string;
    playerNum: '1' | '2';
    gameMode: SlapJackGameMode;
  }>();
  const [turn, setTurn] = useState<'1' | '2'>();
  const [loading, setLoading] = useState(true);
  const ioRef = useRef<Socket>();

  const startOrFetchGame = useCallback(async (socketId: string) => {
    setLoading(true);
    try {
      const { data } = await axios.post<{
        gameId: string;
        turn: '1' | '2';
        playerNum: '1' | '2';
        cards: number;
        gameMode: SlapJackGameMode;
      }>('/api/slap_jack_game', {
        socketId,
        config,
      });

      setGameInfo({
        gameId: data.gameId,
        playerNum: data.playerNum,
        gameMode: data.gameMode,
      });
      setCards(data.cards);
      setTurn(data.turn);
      setPlayedCards([]);
      setLoading(false);
    } catch (err) {
      console.error(err);
      message.error('Cannot start a game, please refresh the page.');
    }
  }, []);

  // This needs to be updated with the API from the server!
  useEffect(() => {
    // TODO: Change it with ENV
    ioRef.current = io('http://localhost:8000');
    ioRef.current.on('connect', () => {
      ioRef.current!.on('error', (errMessage: string) => {
        message.error(errMessage);
      });

      ioRef.current!.on(
        'newCard',
        ({
          cards,
          playedCard,
          turnChange,
          canTake,
        }: {
          cards: number;
          playedCard: PlayingCardType;
          turnChange?: boolean;
          canTake?: boolean;
        }) => {
          setCards(cards);
          setPlayedCards((pCards) => [playedCard, ...pCards]);
          if (turnChange) {
            setTurn((turn) => (turn === '1' ? '2' : '1'));
          }
          if (!canTake) {
            setLoading(false);
          }
        },
      );

      ioRef.current!.on(
        'slapSuccess',
        ({
          cards,
          newTurn,
          gameEnd,
          fromTake,
          slapUser,
        }: {
          cards?: number;
          newTurn: '1' | '2';
          gameEnd: boolean;
          fromTake?: boolean;
          slapUser?: string;
        }) => {
          if (typeof cards === 'number') {
            setCards(cards);
          }
          setTurn(newTurn);
          setPlayedCards([]);
          if (!gameEnd) {
            // ReturnType<
            //   (typeof Modal)['info' | 'success' | 'error']
            // >;
            const modalInstance =
              slapUser === currentUser.id
                ? Modal.success({
                    title: `${fromTake ? '[Alpha]' : '[Slap]'} You took the cards.`,
                    closable: false,
                    footer: null,
                  })
                : Modal.warn({
                    title: `${fromTake ? '[Alpha]' : '[Slap]'} Cards were taken by the opponent.`,
                    closable: false,
                    footer: null,
                  });

            setTimeout(() => {
              modalInstance!.destroy();
              setLoading(false);
            }, CARD_MODAL_CLOSE);
          }
        },
      );

      ioRef.current!.on(
        'slapFailure',
        ({ cards, gameEnd }: { cards: number; gameEnd: boolean }) => {
          setCards(cards);
          if (!gameEnd) {
            setLoading(false);
          }
        },
      );

      ioRef.current!.on('gameEnd', ({ winner }: { winner?: string }) => {
        setLoading(true);
        if (winner) {
          Modal.success({
            title: 'You won!',
            // closable: false,
          });
        } else {
          Modal.warn({
            title: 'You lost..',
            // closable: false,
          });
        }
      });

      if (ioRef.current?.id) {
        startOrFetchGame(ioRef.current.id);
      }
    });

    return () => {
      ioRef.current?.disconnect();
    };
  }, [currentUser.id]);

  const forfeitGame = () => {
    if (!gameInfo || !ioRef.current?.id) {
      message.error(
        'Error forfeiting the game, not connected to the game server.',
      );
      return;
    }

    Modal.info({
      title: 'Do you really want to forfeit the game?',
      onOk: async () => {
        try {
          setLoading(true);
          await axios.post(`/api/slap_jack_game/forfeit/${gameInfo.gameId}`);
          ioRef.current?.disconnect();
          endGame();
        } catch (err) {
          message.error('Error forfeiting the game.');
          console.error(err);
          setLoading(false);
          return;
        }
      },
    });
  };

  const getNewCard = () => {
    if (loading) return;
    setLoading(true);
    if (!cards) {
      message.info('No cards left.');
      return;
    }
    if (!ioRef.current || !gameInfo?.gameId) {
      message.error('Not connected to server.');
      return;
    }
    ioRef.current.emit('getNextCard', {
      gameId: gameInfo.gameId,
      userId: currentUser.id,
    });
  };

  const slapCard = () => {
    if (loading) return;
    setLoading(true);
    if (!playedCards?.length) {
      message.info('No cards played.');
      return;
    }
    if (!ioRef.current || !gameInfo?.gameId) {
      message.error('Not connected to server.');
      return;
    }
    ioRef.current.emit('slapCard', {
      gameId: gameInfo.gameId,
      userId: currentUser.id,
      cardSet: transformToString(playedCards),
    });
  };

  const yourTurn = useMemo(
    () => Boolean(gameInfo?.playerNum && gameInfo?.playerNum === turn),
    [gameInfo, turn],
  );

  if (!currentUser) return null;

  return (
    <>
      <StyledHeader>
        <h1>Slap Jack</h1>
        <StyledTurn $yourTurn={yourTurn}>
          {yourTurn ? 'Your Turn' : 'Their Turn'}
        </StyledTurn>
      </StyledHeader>

      <StyledAllCards onClick={slapCard}>
        {Boolean(playedCards[0]) && (
          <StyledCard1Container>
            <PlayingCard
              shape={playedCards[0].shape}
              number={playedCards[0].number}
            />
          </StyledCard1Container>
        )}
        {Boolean(playedCards[1]) && (
          <StyledCard2Container>
            <PlayingCard
              shape={playedCards[1].shape}
              number={playedCards[1].number}
            />
          </StyledCard2Container>
        )}
        {Boolean(playedCards[2]) && (
          <StyledCard3Container>
            <PlayingCard
              shape={playedCards[2].shape}
              number={playedCards[2].number}
            />
          </StyledCard3Container>
        )}
        {!playedCards.length && <Empty style={{ height: '464px' }} />}
      </StyledAllCards>

      {Boolean(gameInfo) && (
        <SlapJackFooter
          theirCards={TOTAL_CARDS - cards - playedCards.length}
          cards={cards}
          disabledNextCard={
            loading ||
            !gameInfo?.playerNum ||
            gameInfo.playerNum !== turn ||
            !cards
          }
          getNewCard={getNewCard}
          forfeitGame={forfeitGame}
        />
      )}
    </>
  );
};

export default InGamePage;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledTurn = styled.h1<{ $yourTurn: boolean }>`
  color: ${({ $yourTurn }) => ($yourTurn ? 'red' : 'blue')};
`;

const StyledAllCards = styled.div`
  height: 464px;
  margin-bottom: 50px;
`;

const StyledCard1Container = styled.div`
  z-index: 5;
  position: absolute;
  left: 50px;
`;

const StyledCard2Container = styled.div`
  z-index: 4;
  position: absolute;
  left: 140px;
  display: inline;
`;

const StyledCard3Container = styled.div`
  z-index: 3;
  position: absolute;
  left: 230px;
  display: inline;
`;
