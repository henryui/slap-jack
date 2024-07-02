import React from 'react';
import { useLocation, Redirect } from 'react-router-dom';

const PageRedirect: React.FC = () => {
  const { pathname } = useLocation();
  if (pathname === '/') {
    // TODO: Change this to main page
    return <Redirect to="/slap-jack" />;
  }

  return null;
};

export default PageRedirect;
