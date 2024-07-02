import React, { createContext, useEffect, useState } from 'react';
import { Modal } from 'antd';
import { UserType } from '../../../types';
import axios from 'axios';

export type UserWithId = UserType & { id: string };

export type UserContextType = {
  currentUser: UserWithId;
};

interface UserContextProviderProps {
  children: React.ReactNode;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserContextProvider: React.FC<UserContextProviderProps> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserWithId>();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data } = await axios.get<UserWithId>(
          '/api/user/get_current_user',
        );
        setCurrentUser(data);
      } catch (err) {
        Modal.error({
          title: 'Error fetching current user info.',
        });
      }
    };

    fetchCurrentUser();
  }, []);

  if (!currentUser) return null;

  return (
    <UserContext.Provider
      value={{
        currentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
