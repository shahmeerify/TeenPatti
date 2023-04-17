import React, { FC } from 'react';

type MessagesProps = {
  messages: string[];
};

const Messages = ({ messages }: MessagesProps) => {
  return (
    <div className="right-side-container messages-container">
      <h1>Messages</h1>
      <div className="message-box">
        {messages.slice(0,4).map((message, index) => (
          <div key={index} className="message-content-container">
            {message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;
