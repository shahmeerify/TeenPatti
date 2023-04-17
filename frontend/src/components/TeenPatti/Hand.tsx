import React from 'react';
import './teenpatti.css';
import { CardProps } from './Card';

export type HandProps = {
  hand: CardProps[];
  faceup: CardProps[];
  facedown: CardProps[];
  disabled: boolean;
  playStatus: 'hand' | 'faceup' | 'facedown';
  playCard: (card: CardProps, CardType: string) => void;
};

const Hand = ({ hand, faceup, facedown, disabled, playStatus, playCard } : HandProps) => {
  const Tag = disabled ? 'a' : 'div' ;

  const handleCardClick = (card: CardProps, cardType: 'hand' | 'faceup' | 'facedown') => {
    if ((playStatus === cardType && (cardType === 'hand' || cardType === 'faceup')) || cardType === 'facedown') {
      playCard(card, cardType);
    }
    else {
      alert(`Play ${playStatus} cards first`)
    }
  };
  

  return (
    <div className="right-side-container my-cards-container">
      <h1>My Cards</h1>
      <div className="my-cards-inner-container">
        <ul className="hand remove-margin">
          {hand.map((card, index) => (
            <li key={index}>
              {card.show ?
                <Tag className='card back' >*</Tag> :
                <Tag className={`card rank-${card.rank} ${card.suit}`} onClick={() => handleCardClick(card, 'hand')}>
                  <span className="rank">{card.rank}</span>
                  <span className="suit">{card.suit === 'diams' ? '♦' : card.suit === 'hearts' ? '♥' : card.suit === 'spades' ? '♠' : '♣'}</span>
                </Tag>
              }
            </li>
          ))}
        </ul>
      </div>
      <div className="my-fixed-cards-container">
        <ul className="hand remove-margin">
          {facedown.map((card, index) => (
            <li key={index} >
              {card.show ?
                <Tag className='card back' onClick={() => handleCardClick(card, 'facedown')}>*</Tag> :
                <Tag className={`card rank-${card.rank } ${card.suit}`} onClick={() => handleCardClick(card, 'facedown')}>
                  <span className="rank">{card.rank}</span>
                  <span className="suit">{card.suit === 'diams' ? '♦' : card.suit === 'hearts' ? '♥' : card.suit === 'spades' ? '♠' : '♣'}</span>
                </Tag>
              }
            </li>
          ))}
          {faceup.map((card, index) => (
            <li key={index} >
              <Tag className={`card rank-${card.rank } ${card.suit}`} onClick={() => handleCardClick(card, 'faceup')}>
                <span className="rank">{card.rank}</span>
                <span className="suit">{card.suit === 'diams' ? '♦' : card.suit === 'hearts' ? '♥' : card.suit === 'spades' ? '♠' : '♣'}</span>
              </Tag>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Hand;
