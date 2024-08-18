import React, { createContext, useEffect, useState } from 'react';
import { SlapJackGameState } from '../types';
import {
  GameDifficulty,
  SlapJackGameConfig,
  SlapJackGameMode,
} from '../../../types';
import { Modal } from 'antd';

const DEFAULT_CONFIG: SlapJackGameConfig = {
  mode: SlapJackGameMode.AI,
  // Only exists with AI mode.
  difficulty: GameDifficulty.Medium,
  pair: true,
  oneBetweenPair: true,
  sequence: true,
  alphaCardRules: true,
};

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
  const [config, setConfig] = useState<SlapJackGameConfig>(DEFAULT_CONFIG);
  const [gameState, setGameState] = useState<SlapJackGameState>(
    SlapJackGameState.setConfig,
  );

  const startGame = () => {
    if (config.pair || config.alphaCardRules) {
      setGameState(SlapJackGameState.inGame);
    } else {
      Modal.info({
        title:
          'Disabling both the "Alphabet" rule and the "Pair" slap setting will cause the game to take longer to be finished. Do you really want to start the game with current set up?',
        onOk: () => {
          setGameState(SlapJackGameState.inGame);
        },
        footer: (_first, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />a
            <CancelBtn />
            <OkBtn />
          </>
        ),
      });
    }
  };

  const endGame = () => {
    setConfig(DEFAULT_CONFIG);
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
