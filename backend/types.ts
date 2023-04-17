export type Card = {
  rank: string;
  suit: string;
  show: boolean;
};

export type Player = {
  name: string;
  number: string;
  hand: Card[];
  faceup: Card[];
  facedown: Card[];
  playstatus: string;
};

export type GameState = {
  players: Player[];
  currentTurn: number;
  currentCard: Card | null;
  messages: string[]
  pile: Card[];
  deck: Card[];
  lowCardActive: boolean,
  gameEnded: boolean
};
