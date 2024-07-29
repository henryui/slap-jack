import React, { createContext, useEffect, useState } from 'react';
import { SlapJackGameState } from '../types';
import {
  GameDifficulty,
  SlapJackGameConfig,
  SlapJackGameMode,
} from '../../../types';

export type SlapJackContextType = {
  config: SlapJackGameConfig;
  setConfig: React.Dispatch<React.SetStateAction<SlapJackGameConfig>>;
  gameState: SlapJackGameState;
  startGame: () => void;
  endGame: () => void;
};

interface SlapJackContextProviderProps {
  children: React.ReactNode;
}

const SlapJackContext = createContext<SlapJackContextType>(
  {} as SlapJackContextType,
);

export const SlapJackContextProvider: React.FC<
  SlapJackContextProviderProps
> = ({ children }) => {
  const [config, setConfig] = useState<SlapJackGameConfig>({
    mode: SlapJackGameMode.AI,
    // Only exists with AI mode.
    difficulty: GameDifficulty.Medium,
    pair: true,
    oneBetweenPair: true,
    sequence: true,
    alphaCardRules: true,
  });
  const [gameState, setGameState] = useState<SlapJackGameState>(
    SlapJackGameState.setConfig,
  );

  const startGame = () => {
    setGameState(SlapJackGameState.inGame);
  };

  const endGame = () => {
    setGameState(SlapJackGameState.setConfig);
  };

  useEffect(() => {
    if (config.mode === SlapJackGameMode.AI && !config.difficulty) {
      setConfig((prev) => ({
        ...prev,
        difficulty: GameDifficulty.Medium,
      }));
    } else if (config.mode === SlapJackGameMode.Player && config.difficulty) {
      setConfig((prev) => ({
        ...prev,
        difficulty: undefined,
      }));
    }
  }, [config.mode]);

  return (
    <SlapJackContext.Provider
      value={{
        config,
        setConfig,
        gameState,
        startGame,
        endGame,
      }}
    >
      {children}
    </SlapJackContext.Provider>
  );
};

export default SlapJackContext;
