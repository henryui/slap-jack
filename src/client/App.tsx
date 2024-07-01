import React, { useEffect, useRef, useState } from 'react';
import { Button, Empty, message } from 'antd';
import styled from 'styled-components';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
// Use css or other styling library to style the UI
import './index.css';
import { PlayingCardType } from './types';
import PlayingCard from './PlayingCard';

// Fetch data using /api/...

const App = () => {
  const [playedCards, setPlayedCards] = useState<PlayingCardType[]>([]);
  const [cards, setCards] = useState<number>(0);
  const [gameInfo, setGameInfo] = useState<{
    gameId: string;
    playerNum: '1' | '2';
  }>();
  const [turn, setTurn] = useState<'1' | '2'>();
  const [loading, setLoading] = useState(true);
  const ioRef = useRef<Socket>();

  // This needs to be updated with the API from the server!
  useEffect(() => {
    const startOrFetchGame = async (socketId: string) => {
      try {
        const { data } = await axios.get<{
          gameId: string;
          turn: '1' | '2';
          playerNum: '1' | '2';
          cards: number;
        }>('/api/slap_jack_game', {
          params: {
            socketId,
          },
        });
        console.log('data', data);
        setGameInfo({
          gameId: data.gameId,
          playerNum: data.playerNum,
        });
        setCards(data.cards);
        setTurn(data.turn);
        setLoading(false);
      } catch (err) {
        console.error(err);
        message.error('Cannot start a game, please refresh the page.');
      }
    };

    ioRef.current = io('http://localhost:8000');
    ioRef.current.on('connect', () => {
      ioRef.current?.on('error', (errMessage: string) => {
        message.error(errMessage);
      });

      ioRef.current?.on(
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

      if (ioRef.current?.id) {
        startOrFetchGame(ioRef.current.id);
      }
    });
  }, []);

  const getNewCard = () => {
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
      // TODO: Implement UserId
    });
    setTurn((turn) => (turn === '1' ? '2' : '1'));
  };

  const slapCard = () => {
    //
  };

  return (
    <div className="wrapper">
      <h1>Slap Jack</h1>

      <div>Cards remaining: {cards}</div>

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

      <StyledNextCard
        size="large"
        onClick={getNewCard}
        disabled={
          loading || !gameInfo?.playerNum || gameInfo.playerNum !== turn
        }
      >
        Get Next Card
      </StyledNextCard>
    </div>
  );
};

export default App;

const StyledNextCard = styled(Button)`
  margin: 20px 0;
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
