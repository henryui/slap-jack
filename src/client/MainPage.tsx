// src/components/MainPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const games = [
  { name: 'Slap Jack', path: '/slap-jack' },
  { name: 'Game 2', path: '/game2' },
  { name: 'Game 3', path: '/game3' },
  { name: 'Game 4', path: '/game4' },
  { name: 'Game 5', path: '/game5' },
  { name: 'Game 6', path: '/game6' },
  { name: 'Game 7', path: '/game7' },
  { name: 'Game 8', path: '/game8' },
  { name: 'Game 9', path: '/game9' },
  { name: 'Game 10', path: '/game10' },
  { name: 'Game 11', path: '/game11' },
  { name: 'Game 12', path: '/game12' },
  { name: 'Game 13', path: '/game13' },
  { name: 'Game 14', path: '/game14' },
  { name: 'Game 15', path: '/game15' },
  { name: 'Game 16', path: '/game16' },
  { name: 'Game 17', path: '/game17' },
  { name: 'Game 18', path: '/game18' },
  { name: 'Game 19', path: '/game19' },
  { name: 'Game 20', path: '/game20' },
];

const MainPage: React.FC = () => {
  return (
    <MainContainer>
      <Title>Mini Games</Title>
      <GameGrid>
        {games.map((game) => (
          <GameCard key={game.name}>
            <GameLink to={game.path}>{game.name}</GameLink>
          </GameCard>
        ))}
      </GameGrid>
    </MainContainer>
  );
};

export default MainPage;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
`;

const GameCard = styled.div`
  background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const GameLink = styled(Link)`
  text-decoration: none;
  color: #007bff;
  font-size: 1.2em;

  &:hover {
    text-decoration: underline;
  }
`;
