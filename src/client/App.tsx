import React, { useEffect, useState } from 'react';
import { Button, message } from 'antd';
// Use css or other styling library to style the UI
import './index.css';
// TODO: Replace me
import { generateFullDeck, selectRandomly } from './constants';
import { PlayingCardType } from './types';
import PlayingCard from './PlayingCard';

// Fetch data using /api/...

const App = () => {
  const [currentCard, setCurrentCard] = useState<PlayingCardType>();
  const [cards, setCards] = useState<PlayingCardType[]>([]);

  // This needs to be updated with the API from the server!
  useEffect(() => {
    setCards(generateFullDeck());
  }, []);

  const getNewCard = () => {
    if (!cards.length) {
      message.info('No cards left');
      return;
    }
    const { selected, rest } = selectRandomly(cards);
    setCards(rest);
    setCurrentCard(selected);
  };

  return (
    <div className="wrapper">
      <h1>Slap Jack</h1>

      {currentCard ? (
        <PlayingCard shape={currentCard.shape} number={currentCard.number} />
      ) : (
        <div>No card selected.</div>
      )}

      <div>Cards remaining: {cards.length}</div>

      <Button onClick={getNewCard}>Get Next Card</Button>
    </div>
  );
};

export default App;
