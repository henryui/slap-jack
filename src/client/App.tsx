import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, message } from 'antd';
// Use css or other styling library to style the UI
import './index.css';
// TODO: Replace me
import { generateFullDeck, selectRandomly } from './constants';
import { PlayingCard } from './types';

// Fetch data using /api/...

const App = () => {
  const [currentCard, setCurrentCard] = useState<PlayingCard>();
  const [cards, setCards] = useState<PlayingCard[]>([]);

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

      <div>Need to put card image here</div>
      {currentCard ? (
        <>
          <div>Shape: {currentCard.shape}</div>
          <div>Number: {currentCard.number}</div>
        </>
      ) : (
        <div>No card selected.</div>
      )}

      <div>Cards remaining: {cards.length}</div>

      <Button onClick={getNewCard}>Get Next Card</Button>
    </div>
  );
};

export default App;
