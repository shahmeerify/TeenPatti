import React from "react";
import Card, { CardProps } from "./Card";

export type PlayerProps = {
  name: string;
  number: string;
  hand: CardProps[];
  faceup: CardProps[];
  facedown: CardProps[];
};

const Player = ({ name, number, faceup, facedown }: PlayerProps) => {
  let showFaceup = false;
  const cards: CardProps[] = [];

  // Merge faceup and facedown cards, alternating between them
  for (let i = 0, j = 0; i < faceup.length || j < facedown.length; ) {
    if (showFaceup && i < faceup.length) {
      cards.push(faceup[i]);
      i++;
    } else if (!showFaceup && j < facedown.length) {
      cards.push(facedown[j]);
      j++;
    }
    showFaceup = !showFaceup;
  }

  return (
    <div className="game-players-container">
      <div className={`player-tag player-${number.toLowerCase()}`}>{name}</div>
      <ul className={`hand remove-margin player-${number.toLowerCase()}-cards`}>
        {cards.map((card, index) => (
          <li key={index}>
            <Card rank={card.rank} suit={card.suit} show={card.show} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Player;
