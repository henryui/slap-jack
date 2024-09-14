import React, { createContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';

export type FrenchWordleContextType = {
  //
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

  return (
    <FrenchWordleContext.Provider
      value={
        {
          //
        }
      }
    >
      {children}
    </FrenchWordleContext.Provider>
  );
};

export default FrenchWordleContext;
