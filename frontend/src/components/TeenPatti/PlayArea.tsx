import React from "react";
import Card, { CardProps } from "./Card";

interface PlayareaProp {
  cards: CardProps[];
}

function PlayArea({ cards }: PlayareaProp) {
  return (
    <div className="card-area">
      <ul className="hand remove-margin">
        {cards.map((card, index) => (
          <li key={index}>
            <Card rank={card.rank} suit={card.suit} show={card.show} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlayArea;
