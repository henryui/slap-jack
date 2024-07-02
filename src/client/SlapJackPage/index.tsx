import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Empty, Modal, message } from 'antd';
import styled from 'styled-components';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { transformToString, MAIN_HEADER_HEIGHT, TOTAL_CARDS } from '@constants';
import { UserContext } from '@contexts';
import { PlayingCardType } from '../types';
import PlayingCard from './PlayingCard';
import SlapJackFooter from './SlapJackFooter';
import { SlapJackGameMode } from '../../../types';

// Fetch data using /api/...

const SlapJackPage = () => {
  const { currentUser } = useContext(UserContext);
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
      const { data } = await axios.get<{
        gameId: string;
        turn: '1' | '2';
        playerNum: '1' | '2';
        cards: number;
        gameMode: SlapJackGameMode;
      }>('/api/slap_jack_game', {
        params: {
          socketId,
        },
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
        }: {
          cards: number;
          playedCard: PlayingCardType;
          turnChange?: boolean;
        }) => {
          setCards(cards);
          setPlayedCards((pCards) => [playedCard, ...pCards]);
          if (turnChange) {
            setTurn((turn) => (turn === '1' ? '2' : '1'));
          }
        },
      );

      ioRef.current!.on(
        'slapSuccess',
        ({ cards, newTurn }: { cards?: number; newTurn: '1' | '2' }) => {
          if (typeof cards === 'number') {
            setCards(cards);
          }
          setTurn(newTurn);
          setPlayedCards([]);
        },
      );

      ioRef.current!.on('slapFailure', ({ cards }: { cards: number }) => {
        setCards(cards);
      });

      ioRef.current!.on('gameEnd', ({ winner }: { winner?: string }) => {
        setLoading(true);
        if (winner) {
          Modal.success({
            title: 'You won!',
          });
        } else {
          Modal.warn({
            title: 'You lost..',
          });
        }
      });

      if (ioRef.current?.id) {
        startOrFetchGame(ioRef.current.id);
      }
    });
  }, []);

  const startNewGame = async () => {
    if (!gameInfo || !ioRef.current?.id) return;

    try {
      setLoading(true);
      await axios.delete(`/api/slap_jack_game/${gameInfo.gameId}`);
    } catch (err) {
      message.error('Error deleting game.');
      console.error(err);
      setLoading(false);
      return;
    }

    await startOrFetchGame(ioRef.current.id);
  };

  const getNewCard = () => {
    if (loading) return;
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
    setTurn((turn) => (turn === '1' ? '2' : '1'));
  };

  const slapCard = () => {
    if (loading) return;
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
    <StyledSlapJackWrapper>
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
            loading || !gameInfo?.playerNum || gameInfo.playerNum !== turn
          }
          isAI={gameInfo!.gameMode === SlapJackGameMode.AI}
          getNewCard={getNewCard}
          startNewGame={startNewGame}
        />
      )}
    </StyledSlapJackWrapper>
  );
};

export default SlapJackPage;

const StyledSlapJackWrapper = styled.div`
  margin-top: ${MAIN_HEADER_HEIGHT + 20}px;
`;

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
