import React, { useContext } from 'react';
import styled from 'styled-components';
import {
  CheckCircleOutlined,
  CopyOutlined,
  StarFilled,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { Badge, Button, Divider, Tooltip } from 'antd';
import MafiaGameContext, { SECOND } from './MafiaGameContext';
import WaitMinigame from './WaitMinigame';
import { MafiaGameTurn, MafiaUserType } from '../../../types';

const TURN_USER_MAP = {
  [MafiaGameTurn.Mafia]: MafiaUserType.Mafia,
  [MafiaGameTurn.Cop]: MafiaUserType.Cop,
  [MafiaGameTurn.Doctor]: MafiaUserType.Doctor,
};

const USER_TYPE_MAP_KOR = {
  [MafiaUserType.Mafia]: '마피아',
  [MafiaUserType.Cop]: '경찰',
  [MafiaUserType.Doctor]: '의사',
  [MafiaUserType.Civilian]: '시민',
};

interface InGamePageProps {}

const InGamePage: React.FC<InGamePageProps> = () => {
  const {
    gameTurn,
    joinedRoomId,
    currentUser,
    users,
    voteLeave,
    leaveGame,
    endDay,
    loading,
    updatePick,
    pickTimer,
  } = useContext(MafiaGameContext);

  const copyRoomId = () => {
    navigator.clipboard.writeText(joinedRoomId);
  };

  const cursor = (gameTurn === MafiaGameTurn.Day && currentUser.isMc) ||
      (gameTurn !== MafiaGameTurn.Day &&
        TURN_USER_MAP[gameTurn] === currentUser.userType)
    ? !pickTimer
      ? 'not-allowed'
      : loading
        ? 'wait'
        : 'pointer'
    : 'auto';

  return (
    <>
      <StyledHeader>
        <StyledRoomId>
          역할:{' '}
          {Boolean(currentUser.userType) &&
            USER_TYPE_MAP_KOR[currentUser.userType!]}
        </StyledRoomId>
      </StyledHeader>
      {gameTurn !== MafiaGameTurn.Day && (
        <StyledHeader>
          <StyledRoomId>
            {USER_TYPE_MAP_KOR[TURN_USER_MAP[gameTurn]]} 남은 시간:{' '}
            {pickTimer / SECOND}
          </StyledRoomId>
        </StyledHeader>
      )}
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
        {Boolean(currentUser.isMc && gameTurn === MafiaGameTurn.Day) && (
          <>
            <StyledH2>MC 메뉴</StyledH2>
            <StyledConfigRow>
              <StyledNewGame type="primary" onClick={() => endDay()}>
                턴 종료
              </StyledNewGame>
            </StyledConfigRow>
            <StyledDivider />
          </>
        )}
        {/* Display during normal Day turn */}
        {Boolean(
          gameTurn === MafiaGameTurn.Day ||
            TURN_USER_MAP[gameTurn] === currentUser.userType,
        ) &&
          users.map((user, uIndex) => (
            <StyledBadge
              key={`${user.localStorageId}-${uIndex}`}
              count={user.pickedCount || 0}
            >
              <StyledUserRow
                $shaded={uIndex % 2 === 0}
                $cursor={cursor}
                onClick={() => {
                  if (gameTurn === MafiaGameTurn.Day && currentUser.isMc) {
                    voteLeave(user.localStorageId);
                  } else if (
                    gameTurn !== MafiaGameTurn.Day &&
                    TURN_USER_MAP[gameTurn] === currentUser.userType
                  ) {
                    updatePick(user.localStorageId);
                  }
                }}
              >
                {Boolean(user.isMc) && <StyledStar />}
                <StyledUserLabel
                  $isCurrent={
                    user.localStorageId === currentUser.localStorageId
                  }
                >
                  {user.userName}
                </StyledUserLabel>
                {Boolean(
                  (gameTurn === MafiaGameTurn.Day && currentUser.isMc) ||
                    (gameTurn !== MafiaGameTurn.Day &&
                      TURN_USER_MAP[gameTurn] === currentUser.userType),
                ) && (
                  <StyledRemoveUser>
                    {gameTurn === MafiaGameTurn.Day ? (
                      <UserDeleteOutlined />
                    ) : (
                      <CheckCircleOutlined />
                    )}
                  </StyledRemoveUser>
                )}
              </StyledUserRow>
            </StyledBadge>
          ))}
        {/* Display mini game for non-turn user */}
        {Boolean(
          gameTurn !== MafiaGameTurn.Day &&
            TURN_USER_MAP[gameTurn] !== currentUser.userType,
        ) && <WaitMinigame />}
        <StyledConfigRow>
          <StyledNewGame onClick={() => leaveGame()}>나가기</StyledNewGame>
        </StyledConfigRow>
      </StyledSettingContainer>
    </>
  );
};

export default InGamePage;

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

const StyledUserRow = styled.div<{ $shaded?: boolean; $cursor: string }>`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 7px;
  ${({ $shaded }) =>
    $shaded &&
    `
    border-radius: 5px;
    background-color: #ddd;
  `}

  ${({ $cursor }) => `cursor: ${$cursor};`}
`;

const StyledRemoveUser = styled.div`
  margin-left: auto;
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

const StyledBadge = styled(Badge)`
  width: 100%;
`;

const StyledNewGame = styled(Button)`
  && {
    margin-top: 10px;
    padding: 10px 25px;
    height: 50px;
    font-weight: bold;
    width: 100%;
  }
`;
