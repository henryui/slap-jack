import React, { useContext } from 'react';
import styled from 'styled-components';
import type { InputNumberProps } from 'antd';
import { CopyOutlined, StarFilled } from '@ant-design/icons';
import { Button, Divider, InputNumber, Tooltip } from 'antd';
import MafiaGameContext from './MafiaGameContext';

interface WaitingRoomPageProps {}

const WaitingRoomPage: React.FC<WaitingRoomPageProps> = () => {
  const {
    joinedRoomId,
    config,
    setConfig,
    currentUser,
    users,
    startGame,
    leaveGame,
  } = useContext(MafiaGameContext);

  const onChangeMafia: InputNumberProps['onChange'] = (value) => {
    if (value) {
      setConfig((prev) => ({
        ...prev,
        numMafias: value as number,
      }));
    }
  };

  const onChangeCop: InputNumberProps['onChange'] = (value) => {
    if (value) {
      setConfig((prev) => ({
        ...prev,
        numCops: value as number,
      }));
    }
  };

  const onChangeDoctor: InputNumberProps['onChange'] = (value) => {
    if (value) {
      setConfig((prev) => ({
        ...prev,
        numDoctors: value as number,
      }));
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(joinedRoomId);
  };

  return (
    <>
      <StyledHeader>
        <StyledRoomId>
          방 ID: {joinedRoomId}{' '}
          <Tooltip title="Copy to clipboard">
            <CopyOutlined
              style={{
                cursor: 'pointer',
              }}
              onClick={() => copyRoomId()}
            />
          </Tooltip>
        </StyledRoomId>
      </StyledHeader>
      <StyledSettingContainer>
        {Boolean(currentUser.isMc) && (
          <>
            <StyledH2>게임 설정</StyledH2>
            <StyledConfigRow>
              <StyledDropdownLabel>마피아</StyledDropdownLabel>
              <InputNumber
                min={1}
                max={20}
                value={config.numMafias}
                onChange={onChangeMafia}
              />
            </StyledConfigRow>
            <StyledConfigRow>
              <StyledDropdownLabel>경찰</StyledDropdownLabel>
              <InputNumber
                min={0}
                max={20}
                value={config.numCops}
                onChange={onChangeCop}
              />
            </StyledConfigRow>
            <StyledConfigRow>
              <StyledDropdownLabel>의사</StyledDropdownLabel>
              <InputNumber
                min={0}
                max={20}
                value={config.numDoctors}
                onChange={onChangeDoctor}
              />
            </StyledConfigRow>
            <StyledConfigRow>
              <StyledNewGame type="primary" onClick={startGame}>
                게임 시작
              </StyledNewGame>
            </StyledConfigRow>
            <StyledDivider />
          </>
        )}
        {users.map((user, uIndex) => (
          <StyledUserRow
            key={`${user.localStorageId}-${uIndex}`}
            $shaded={uIndex % 2 === 0}
          >
            {Boolean(user.isMc) && <StyledStar />}
            <StyledUserLabel
              $isCurrent={user.localStorageId === currentUser.localStorageId}
            >
              {user.userName}
            </StyledUserLabel>
          </StyledUserRow>
        ))}
        <StyledConfigRow>
          <StyledNewGame onClick={() => leaveGame()}>나가기</StyledNewGame>
        </StyledConfigRow>
      </StyledSettingContainer>
    </>
  );
};

export default WaitingRoomPage;

const StyledRoomId = styled.h1`
  font-size: 24px;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledH2 = styled.h2`
  margin: 0 0 35px 0;
`;

const StyledSettingContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
`;

const StyledConfigRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const StyledUserRow = styled.div<{ $shaded?: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 7px;

  ${({ $shaded }) =>
    $shaded
      ? `
    border-radius: 5px;
    background-color: #ddd;
  `
      : `
  border-radius: 5px;
  background-color: #888;
`}
`;

const StyledDropdownLabel = styled.div`
  margin-right: 20px;
  font-weight: bold;
  width: 45px;
`;

const StyledUserLabel = styled.div<{ $isCurrent?: boolean }>`
  ${({ $isCurrent }) => $isCurrent && `font-weight: bold;`}
  width: 100%;
`;

const StyledStar = styled(StarFilled)`
  && {
    margin-right: 10px;
    color: #e6cb1e;
  }
`;

const StyledDivider = styled(Divider)``;

const StyledNewGame = styled(Button)`
  && {
    margin-top: 10px;
    padding: 10px 25px;
    height: 50px;
    font-weight: bold;
    width: 100%;
  }
`;
