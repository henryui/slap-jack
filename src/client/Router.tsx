import React from 'react';
import styled from 'styled-components';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { MAIN_HEADER_HEIGHT } from '@constants';
import { UserContextProvider } from '@contexts';
import MainHeader from './MainHeader';
import MainPage from './MainPage';
import PageRedirect from './PageRedirect';
import SlapJackPage from './SlapJackPage';

const Router: React.FC = () => (
  <>
    <HashRouter>
      {/* <UserContextProvider> */}
      <PageRedirect />
      <MainHeader />
      <StyledMainContainer>
        <Switch>
          {/* TODO: This is just an example */}
          <Route path="/main" component={MainPage} />
          <Route path="/slap-jack" component={SlapJackPage} />
        </Switch>
      </StyledMainContainer>
      {/* </UserContextProvider> */}
    </HashRouter>
  </>
);

export default Router;

const StyledMainContainer = styled.div`
  margin-top: ${MAIN_HEADER_HEIGHT}px;
`;
