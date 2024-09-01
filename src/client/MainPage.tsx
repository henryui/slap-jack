// src/components/MainPage.tsx
import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';

const games: { name: string; path: string; disabled?: boolean }[] = [
  { name: 'Slap Jack', path: '/slap-jack' },
  { name: 'Mafia', path: '/mafia' },
  { name: 'Game 3', path: '/game3', disabled: true },
  { name: 'Game 4', path: '/game4', disabled: true },
  { name: 'Game 5', path: '/game5', disabled: true },
  { name: 'Game 6', path: '/game6', disabled: true },
  { name: 'Game 7', path: '/game7', disabled: true },
  { name: 'Game 8', path: '/game8', disabled: true },
  { name: 'Game 9', path: '/game9', disabled: true },
  { name: 'Game 10', path: '/game10', disabled: true },
  { name: 'Game 11', path: '/game11', disabled: true },
  { name: 'Game 12', path: '/game12', disabled: true },
  { name: 'Game 13', path: '/game13', disabled: true },
  { name: 'Game 14', path: '/game14', disabled: true },
  { name: 'Game 15', path: '/game15', disabled: true },
  { name: 'Game 16', path: '/game16', disabled: true },
  { name: 'Game 17', path: '/game17', disabled: true },
  { name: 'Game 18', path: '/game18', disabled: true },
  { name: 'Game 19', path: '/game19', disabled: true },
  { name: 'Game 20', path: '/game20', disabled: true },
];

const MainPage: React.FC = () => {
  const history = useHistory();

  const onClickTile = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    path: string,
    disabled?: boolean,
  ) => {
    e.stopPropagation();
    if (disabled) return;

    history.push(path);
  };

  return (
    <MainContainer>
      <Title>Mini Games</Title>
      <GameGrid>
        {games.map((game) => (
          <GameCard
            key={game.name}
            onClick={(e) => onClickTile(e, game.path, game.disabled)}
          >
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
  cursor: pointer;

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
