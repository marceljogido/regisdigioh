import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingPageProps {
  message?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ message = "Loading..." }) => {
  return (
    <Container>
      <Spinner />
      <Message>{message}</Message>
    </Container>
  );
};

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f3f4f6; // light gray background
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  animation: ${spin} 2s linear infinite;
`;

const Message = styled.p`
  margin-top: 20px;
  font-size: 1.5rem;
  color: #333;
`;

export default LoadingPage;
