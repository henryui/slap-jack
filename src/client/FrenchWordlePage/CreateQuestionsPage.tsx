import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { Button, Divider, Input, Space } from 'antd';
import type { InputProps } from 'antd';

interface createQuestionsPageProps {}

const createQuestionsPage: React.FC<createQuestionsPageProps> = () => {
  // We need user id,
  const [englishWord, setEnglishWord] = useState('');
  const [frenchWord, setFrenchWord] = useState('');
  console.log('english: ', englishWord);
  console.log('french: ', frenchWord);
  const existCheck = (englishWord: string, frenchWord: string): boolean => {
    //check if englishWord exist in DB
    //If no, validatePair(englishWord, frenchWord)
    //If yes, return false;
    return true;
  };

  const validatePair = (englishWord: string, frenchWord: string) => {
    //check if englishWord exist in DB
    //If yes, return true or false
    return true;
  };

  const handleSubmit: InputProps['onSubmit'] = (e) => {
    // existCheck(englishWord, frenchWord);
    console.log(`e : ${e.target}`);
  };

  return (
    <>
      <StyledSettingContainer>
        <StyledHeader>
          <h2>Submit Word Translation</h2>
        </StyledHeader>

        <StyledDivider />

        <StyledConfigRow>
          <StyledDropdownLabel>English:</StyledDropdownLabel>
          <StyledInput
            value={englishWord}
            onChange={(e) => setEnglishWord(e.target.value)}
            placeholder="Enter English word"
          />
        </StyledConfigRow>

        <StyledConfigRow>
          <StyledDropdownLabel>French:</StyledDropdownLabel>
          <StyledInput
            value={frenchWord}
            onChange={(e) => setFrenchWord(e.target.value)}
            placeholder="Enter French translation"
          />
        </StyledConfigRow>

        <StyledConfigRow>
          <StyledNewGame type="primary" onSubmit={handleSubmit}>
            Submit
          </StyledNewGame>
        </StyledConfigRow>
      </StyledSettingContainer>
    </>
  );
};

export default createQuestionsPage;

// Style Tags
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
