import React from 'react';

const ChatContainer = ({ channelName }) => {
  return (
    <div data-testid="chat-container">
      <div>{channelName}</div>
    </div>
  );
};

export default ChatContainer;