import React from 'react';
import styled from 'styled-components';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { MAIN_HEADER_HEIGHT } from '@constants';
import { UserContextProvider } from '@contexts';
import MainHeader from './MainHeader';
import MainPage from './MainPage';
import PageRedirect from './PageRedirect';
import MafiaGamePage from './MafiaGamePage';
import SlapJackPage from './SlapJackPage';
import FrenchWordlePage from './FrenchWordlePage';

const Router: React.FC = () => (
  <>
    <HashRouter>
      <UserContextProvider>
        <PageRedirect />
        <MainHeader />
        <StyledMainContainer>
          <Switch>
            {/* TODO: This is just an example */}
            <Route path="/main" component={MainPage} />
            <Route path="/slap-jack" component={SlapJackPage} />
            <Route path="/mafia" component={MafiaGamePage} />
            <Route path="/french-wordle" component={FrenchWordlePage} />
          </Switch>
        </StyledMainContainer>
      </UserContextProvider>
    </HashRouter>
  </>
);

export default Router;

const StyledMainContainer = styled.div`
  margin-top: ${MAIN_HEADER_HEIGHT}px;
`;
