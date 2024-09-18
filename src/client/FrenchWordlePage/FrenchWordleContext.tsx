import React, { createContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {FrenchWordleState} from '../types';
import {
  FrenchWordleUser
} from '../../../types'


export type FrenchWordleContextType = {
  // Define the structure of the context
  gameState: FrenchWordleState;

};

interface FrenchWordleContextProviderProps {
  children: React.ReactNode;
}

const FrenchWordleContext = createContext<FrenchWordleContextType>(
  {} as FrenchWordleContextType,
);

export const FrenchWordleContextProvider: React.FC<
  FrenchWordleContextProviderProps
> = ({ children }) => {
  //
  // const [currentUser, setCurrentUser] = useState<FrenchWordleUser>
  const [gameState, setGameState] = useState<FrenchWordleState>(
    FrenchWordleState.setConfig,
  );
  return (
    <FrenchWordleContext.Provider
      value={
        {
          //
          gameState
        }
      }
    >
      {children}
    </FrenchWordleContext.Provider>
  );
};

export default FrenchWordleContext;
