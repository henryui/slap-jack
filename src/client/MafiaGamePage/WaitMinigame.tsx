import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Input, InputProps } from 'antd';

const MAX = 100;

const WaitMinigame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [first, setFirst] = useState(Math.floor(Math.random() * MAX));
  const [second, setSecond] = useState(Math.floor(Math.random() * MAX));
  const [answer, setAnswer] = useState('');

  const onAnswerChange: InputProps['onChange'] = (e) => {
    setAnswer(e.target.value);
  };

  const checkAnswer = () => {
    try {
      const parsed = parseInt(answer, 10);
      if (first + second === parsed) {
        setScore((prev) => prev + 1);
      }
    } catch (err) {
      // Do nothing
    } finally {
      setFirst(Math.floor(Math.random() * MAX));
      setSecond(Math.floor(Math.random() * MAX));
      setAnswer('');
    }
  };

  return (
    <div>
      <StyledHeader1>턴 기다리는 동안 할 (연막) 암산 게임</StyledHeader1>
      <StyledHeader2>점수: {score}</StyledHeader2>
      <StyledConfigRow>
        {first} + {second} ={' '}
      </StyledConfigRow>
      <StyledConfigRow>
        <StyledInput
          value={answer}
          placeholder="정답"
          onChange={onAnswerChange}
        />
      </StyledConfigRow>
      <StyledConfigRow>
        <StyledNewGame onClick={() => checkAnswer()}>입력</StyledNewGame>
      </StyledConfigRow>
    </div>
  );
};

export default WaitMinigame;

const StyledHeader1 = styled.h1`
  font-size: 18px;
`;

const StyledHeader2 = styled.h1`
  font-size: 24px;
`;

const StyledInput = styled(Input)`
  && {
    margin-left: 10px;
  }
`;

const StyledConfigRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
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
