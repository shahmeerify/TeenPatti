import React from 'react';
import "./teenpatti.css";

export type CardProps = {
  rank: string;
  suit: string;
  show?: boolean;
};

const Card = ({ rank, suit, show }: CardProps) => {
  return (
    <div className="card-container">
      {show ?
        <div className='card back'>*</div> :
        <div className={`card rank-${rank} ${suit}`}>
          <span className="rank">{rank}</span>
          <span className="suit">{suit === 'diams' ? '♦' : suit === 'hearts' ? '♥' : suit === 'spades' ? '♠' : '♣'}</span>
        </div>      
      }
    </div>
  );
};

export default Card;
