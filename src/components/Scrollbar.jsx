import React from 'react';
import styled from 'styled-components';

const ScrollbarContainer = styled.div`
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e02460;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #e02460;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const Scrollbar = ({ children, style }) => {
  return <ScrollbarContainer style={style}>{children}</ScrollbarContainer>;
};

export default Scrollbar;
