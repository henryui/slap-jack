import React, { useContext } from 'react';
import styled from 'styled-components';
import { Button, Checkbox, Divider, Dropdown, MenuProps, Tooltip } from 'antd';
import {
  DownOutlined,
  InfoCircleFilled,
  MoonOutlined,
  RobotOutlined,
  StarOutlined,
  SunOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import {
  GameDifficulty,
  SlapJackGameConfig,
  SlapJackGameMode,
} from '../../../types';
import SlapJackContext from './SlapJackContext';

const CONFIG_TOOLTIP: Record<keyof SlapJackGameConfig, string> = {
  mode: '',
  difficulty: '',
  pair: 'Can slap pair of same number / alpha',
  oneBetweenPair: 'Can slap if the pair has one other card in between',
  sequence: 'Can slap if three cards are in series (i.e. 2,3,4)',
  alphaCardRules: '',
};

const difficultyItems: MenuProps['items'] = [
  {
    label: 'Easy',
    key: GameDifficulty.Easy,
    icon: <StarOutlined />,
  },
  {
    label: 'Medium',
    key: GameDifficulty.Medium,
    icon: <MoonOutlined />,
  },
  {
    label: 'Hard',
    key: GameDifficulty.Hard,
    icon: <SunOutlined />,
    danger: true,
  },
];

const modeItems: MenuProps['items'] = [
  {
    label: 'AI',
    key: SlapJackGameMode.AI,
    icon: <RobotOutlined />,
  },
  {
    label: 'Multi-Player',
    key: SlapJackGameMode.Player,
    icon: <UsergroupAddOutlined />,
    disabled: true,
  },
];

const MODE_MAP: Record<SlapJackGameMode, string> = {
  [SlapJackGameMode.AI]: 'AI',
  [SlapJackGameMode.Player]: 'Multi-Player',
};

interface SetConfigPageProps {}

const SetConfigPage: React.FC<SetConfigPageProps> = () => {
  const { config, setConfig, startGame } = useContext(SlapJackContext);

  const onClickDifficulty: MenuProps['onClick'] = (info) => {
    if (config.mode !== SlapJackGameMode.AI) return;
    setConfig((prev) => ({
      ...prev,
      difficulty: info.key as GameDifficulty,
    }));
  };

  const onClickMode: MenuProps['onClick'] = (info) => {
    setConfig((prev) => ({
      ...prev,
      mode: info.key as SlapJackGameMode,
    }));
  };

  const toggleChecks = (
    e: CheckboxChangeEvent,
    item: keyof SlapJackGameConfig,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [item]: e.target.checked,
    }));
  };

  return (
    <>
      <StyledHeader>
        <h1>Slap Jack</h1>
      </StyledHeader>
      <div>
        <StyledH3>Game Description</StyledH3>
        <StyledGameDescription>
          <p>
            <a href="https://en.wikipedia.org/wiki/Egyptian_Ratscrew">
              Wikipedia description link
            </a>
          </p>
          <p>
            The objective of the game is to collect all the cards by yourself.
          </p>
          <p>
            At the start of the game, each player will be dealt the same number
            of random cards.
          </p>
          <p>Players take turns playing a card in the middle.</p>
          <p>
            A player can claim the set of played cards by slapping or using an
            alphabet card, depending on the configuration set up below.
          </p>
          <p>
            You can slap the played card set by clicking on it. If you fail to
            slap correctly (e.g., slapping when there is no valid set such as a
            pair), you will give one card to each player.
          </p>
          <p>
            The first person to successfully slap a valid card set takes the set
            and then gets to play a card first.
          </p>
          <p>
            Cards are automatically collected to the bottom of your deck, and
            their order is kept without being shuffled.
          </p>
        </StyledGameDescription>
      </div>
      <div>
        <StyledH2>Game Configuration</StyledH2>
        <StyledConfigRow>
          <StyledDropdownLabel>Game Mode</StyledDropdownLabel>
          <Dropdown
            menu={{
              items: modeItems,
              onClick: onClickMode,
            }}
            trigger={['click']}
          >
            <Button style={{ width: '131px' }}>
              <StyledDropDownSpace>
                {MODE_MAP[config.mode]}
                <DownOutlined />
              </StyledDropDownSpace>
            </Button>
          </Dropdown>
        </StyledConfigRow>
        {config.mode === SlapJackGameMode.AI && (
          <StyledConfigRow>
            <StyledDropdownLabel>AI Difficulty</StyledDropdownLabel>
            <Dropdown
              menu={{
                items: difficultyItems,
                onClick: onClickDifficulty,
              }}
              trigger={['click']}
            >
              <Button style={{ width: '131px' }}>
                <StyledDropDownSpace>
                  {config.difficulty}
                  <DownOutlined />
                </StyledDropDownSpace>
              </Button>
            </Dropdown>
          </StyledConfigRow>
        )}
        <StyledConfigRow>
          <StyledCheckbox
            onChange={(e) => toggleChecks(e, 'alphaCardRules')}
            disabled
            checked={config.alphaCardRules}
          />
          Enable Alphabet Card rules
        </StyledConfigRow>
        <StyledAlphaDescription>
          <p>
            By enabling this, alphabet cards (Ace, King, Queen, Jack) will each
            have similar abilities when played.
          </p>
          <p>
            Ace - The next player must play 4 cards consecutively or until they
            also play an alphabet card, at which point they pass the turn to the
            next player. If no alphabet card or slap-able event occurs, you can
            take all the played card sets with your Ace card.
          </p>
          <p>
            King - Same as Ace, but the next player must play 3 cards until you
            take all the cards.
          </p>
          <p>
            Queen - Same as Ace, but the next player must play 2 cards until you
            take all the cards.
          </p>
          <p>
            Jack - Same as Ace, but the next player must play 1 card until you
            take all the cards.
          </p>
        </StyledAlphaDescription>
      </div>
      <div>
        <StyledH3>Slap Card Config</StyledH3>
        <StyledConfigRow>
          <StyledCheckbox
            onChange={(e) => toggleChecks(e, 'pair')}
            disabled
            checked={config.pair}
          />
          Pair
          <Tooltip title={CONFIG_TOOLTIP.pair} placement="right">
            <StyledInfo color="#08c" />
          </Tooltip>
        </StyledConfigRow>
        <StyledConfigRow>
          <StyledCheckbox
            onChange={(e) => toggleChecks(e, 'oneBetweenPair')}
            disabled
            checked={config.oneBetweenPair}
          />
          One Between Pair
          <Tooltip title={CONFIG_TOOLTIP.oneBetweenPair} placement="right">
            <StyledInfo color="#08c" />
          </Tooltip>
        </StyledConfigRow>
        <StyledConfigRow>
          <StyledCheckbox
            onChange={(e) => toggleChecks(e, 'sequence')}
            disabled
            checked={config.sequence}
          />
          3 Cards Sequence
          <Tooltip title={CONFIG_TOOLTIP.sequence} placement="right">
            <StyledInfo color="#08c" />
          </Tooltip>
        </StyledConfigRow>
      </div>
      <StyledDivider />
      <StyledFooter>
        <StyledNewGame onClick={startGame}>Start New Game (AI)</StyledNewGame>
        <Tooltip title="Multiplayer is currently disabled.">
          <StyledNewGame disabled>Start New Game (Multiplayer)</StyledNewGame>
        </Tooltip>
      </StyledFooter>
    </>
  );
};

export default SetConfigPage;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledH2 = styled.h2`
  margin: 35px 0;
`;

const StyledH3 = styled.h3`
  margin: 25px 0;
`;

const StyledConfigRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const StyledDropdownLabel = styled.div`
  margin-right: 20px;
  font-weight: bold;
  width: 92px;
`;

const StyledDropDownSpace = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  width: 100%;
  justify-content: space-between;
`;

const StyledCheckbox = styled(Checkbox)`
  margin-right: 10px;
`;

const StyledGameDescription = styled.div`
  background-color: #eee;
  color: #333;
  border-radius: 8px;
  margin: 15px 0px;
  padding: 1px 15px;
`;

const StyledAlphaDescription = styled.div`
  background-color: #eee;
  color: #333;
  border-radius: 8px;
  margin: 15px 0px;
  padding: 1px 15px;
`;

const StyledInfo = styled(InfoCircleFilled)`
  margin-left: 10px;
`;

const StyledDivider = styled(Divider)``;

const StyledFooter = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledNewGame = styled(Button)`
  && {
    padding: 15px 25px;
    height: 60px;
    font-weight: bold;
    margin-right: 30px;
  }
`;
