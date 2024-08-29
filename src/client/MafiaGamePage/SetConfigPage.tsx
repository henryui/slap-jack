import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import type { InputProps } from 'antd';
import { Button, Divider, Input, Space } from 'antd';
import MafiaGameContext from './MafiaGameContext';

interface SetConfigPageProps {}

const SetConfigPage: React.FC<SetConfigPageProps> = () => {
  const [roomId, setRoomId] = useState('');
  const { currentUser, setCurrentUser, noNameError, joinGame, createGame } =
    useContext(MafiaGameContext);

  const onRoomIdChange: InputProps['onChange'] = (e) => {
    setRoomId(e.target.value);
  };

  const onUserNameChange: InputProps['onChange'] = (e) => {
    setCurrentUser((prev) => ({
      ...prev,
      userName: e.target.value,
    }));
  };

  return (
    <>
      <StyledHeader>
        <h1>마피아 게임</h1>
      </StyledHeader>
      <StyledSettingContainer>
        <StyledConfigRow>
          <StyledDropdownLabel>이름</StyledDropdownLabel>
          <Space.Compact>
            <StyledInput
              maxLength={20}
              value={currentUser.userName}
              onChange={onUserNameChange}
            />
          </Space.Compact>
        </StyledConfigRow>
        {noNameError && (
          <StyledConfigErrorRow>
            <StyledError>이름을 적어주세요</StyledError>
          </StyledConfigErrorRow>
        )}
        <StyledConfigRow>
          <StyledNewGame type="primary" onClick={createGame}>
            방 만들기
          </StyledNewGame>
        </StyledConfigRow>
        <StyledDivider />
        <StyledConfigRow>
          <StyledDropdownLabel>방 ID</StyledDropdownLabel>
          <Space.Compact>
            <StyledInput
              maxLength={8}
              value={roomId}
              onChange={onRoomIdChange}
            />
          </Space.Compact>
        </StyledConfigRow>
        <StyledConfigRow>
          <StyledNewGame onClick={() => joinGame(roomId)}>
            참가하기
          </StyledNewGame>
        </StyledConfigRow>
      </StyledSettingContainer>
    </>
  );
};

export default SetConfigPage;

const StyledHeader = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledSettingContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 25px;
`;

const StyledConfigRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const StyledConfigErrorRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 10px;
  border: 1px solid #ff8078;
  background-color: #ffcfcc;
  padding: 5px;
`;

const StyledDropdownLabel = styled.div`
  margin-right: 20px;
  font-weight: bold;
  width: 45px;
`;

const StyledError = styled.div`
  width: 100%;
  font-weight: bold;
  font-size: 14px;
  color: #cc2a1f;
`;

const StyledDivider = styled(Divider)``;

const StyledInput = styled(Input)``;

const StyledNewGame = styled(Button)`
  && {
    padding: 10px 25px;
    height: 50px;
    font-weight: bold;
    width: 100%;
  }
`;
