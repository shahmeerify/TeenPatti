import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Card, GameState, Player } from "./types";
const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

function numToWord(num: number) {
  const words = ["one", "two", "three", "four"];
  return words[num - 1];
}

const createDeck = () => {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits = ["hearts", "spades", "clubs", "diams"];
  const deck: Card[] = [];

  ranks.forEach((rank) => {
    suits.forEach((suit) => {
      const card: Card = {
        rank,
        suit,
        show: false,
      };
      deck.push(card);
    });
  });

  return deck;
};

interface RankValue {
  [key: string]: number;
}
const cardValue = (card: Card) => {
  const rankValue: RankValue = {
    'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6,'5': 5,'4': 4,'3': 3,'2': 2,
};
  return rankValue[card.rank]
};

const shuffleDeck = (deck: Card[]) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};


const dealCards = (gameState: GameState) => {
  const { deck, players } = gameState;

  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < 3; j++) {
      const card: Card = deck.pop()!;
      players[i].hand.push(card);
    }
    for (let j = 0; j < 3; j++) {
      const card: Card = deck.pop()!;
      players[i].faceup.push(card);
    }
    for (let j = 0; j < 3; j++) {
      const card: Card = deck.pop()!;
      card.show = true;
      players[i].facedown.push(card);
    }
  }
};

const hasValidCard = (player: Player, gameState: GameState) => {
  const isPowerCard = (card: Card) => card.rank === "2" || card.rank === "7" || card.rank === "8" || card.rank === "10";
  const isValidCard = (card: Card) => gameState.lowCardActive ?
    cardValue(card) <= 7 || isPowerCard(card) :
    !gameState.currentCard || cardValue(card) >= cardValue(gameState.currentCard) || isPowerCard(card);

  if (player.hand.length > 0){
    for (const card of player.hand) {
      if (isValidCard(card)) {
        return true;
      }
    }
  }
 
  return false;
};

const checkForWinner = (gameState: GameState) => {
  const winner = gameState.players.find(player => player.hand.length === 0 && player.faceup.length === 0 && player.facedown.length === 0);
  if (winner) {
    gameState.gameEnded = true;
    gameState.messages.push(`${winner.name} has won this round of the game!`);
    console.log(`${winner.name} has won this round of the game!`);
    io.emit("gameState", gameState);
    return true;
  }
  return false;
};



const createPlayer = (name: string, num: number): Player => {
  return {
    name,
    number: numToWord(num),
    hand: [],
    faceup: [],
    facedown: [],
    playstatus: "hand",
  };
};


const gameState: GameState = {
  players: [],
  currentTurn: 1,
  currentCard: null,
  messages: [],
  pile: [],
  deck: createDeck(),
  lowCardActive: false,
  gameEnded: false,
};

gameState.deck = shuffleDeck(gameState.deck);
const sockets: any = [];


server.listen(3001, () => {
  console.log("SERVER IS LISTENING ON PORT 3001");
});

io.on("connection", (socket: Socket) => {
  console.log("user connected with a socket id", socket.id);

  socket.on("playerJoined", (name: string) => {
    if (gameState.players.length >= 4) {
      console.log("Game Full. Player", name, "cannot join");
      socket.emit("gameFull");
      return;
    }

    sockets.push(socket);
    const newPlayer: Player = createPlayer(name, gameState.players.length+1) 
    gameState.players.push(newPlayer);
    socket.emit("setPlayerNum", gameState.players.length);
    console.log("Player", name, "joined. Number of players:", gameState.players.length);


    if (gameState.players.length === 4) {
      dealCards(gameState);
      io.emit(`setPlayer`, gameState.players);

      const firstCard = gameState.deck.pop()!
      gameState.pile.push(firstCard)
      gameState.currentCard = firstCard
      
      io.emit("startGame");
      console.log("Game Started!")
      gameState.messages.push("Game Started!")
      console.log(`It is Player ${gameState.currentTurn}'s turn`)
      gameState.messages.push(`It is Player ${gameState.currentTurn}'s turn`)
      
      io.emit("gameState", gameState);
      console.log("Starting game");
    }
  });

  socket.on("checkValidCard", (playernum, playStatus) => {
    if (gameState.currentTurn !== playernum) {
      console.log(`It's not player ${playernum}'s turn`);
      return;
    }
  
    const currentPlayer = gameState.players[playernum - 1];
  
    if (!hasValidCard(currentPlayer, gameState)) {
      console.log(currentPlayer.number, playStatus)
      currentPlayer.hand.push(...gameState.pile);
      gameState.pile = [];
      gameState.currentCard = null
      gameState.currentTurn = (gameState.currentTurn % 4) + 1;
      console.log(`Player ${playernum} picked up the pile and their turn is skipped`);
      gameState.messages.push(`Player ${playernum} picked up the pile and their turn is skipped`);
      gameState.messages.push(`It is Player ${gameState.currentTurn}'s turn`);
      io.emit("gameState", gameState);
    }
  });
  

  socket.on("playCard", (playernum, card, cardType) => {
    if (gameState.currentTurn !== playernum) {
      console.log(`It's not player ${playernum}'s turn`);
      return;
    }
    if (checkForWinner(gameState)) {
      return;
    }

    const isPowerCard = card.rank === "2" || card.rank === "7" || card.rank === "8" || card.rank === "10";
    const isValidCard = gameState.lowCardActive ? 
      cardValue(card) <= 7 || isPowerCard : 
      !gameState.currentCard || cardValue(card) >= cardValue(gameState.currentCard) || isPowerCard;

    const currentPlayer = gameState.players[playernum - 1]

    
    if (isValidCard) {
      if (gameState.lowCardActive){
        gameState.lowCardActive = false
      }
    
      const cardCollections = { hand: currentPlayer.hand, faceup: currentPlayer.faceup, facedown: currentPlayer.facedown };
      const cardCollection = cardCollections[cardType as keyof typeof cardCollections];
      const index = cardCollection.findIndex((c: Card) => c.rank === card.rank && c.suit === card.suit);
      cardCollection.splice(index, 1);
    
      gameState.pile.push(card);
      gameState.currentCard = card;

      
    
      if (card.rank === '2') {
        gameState.currentCard = null;
        console.log(`Player ${playernum} played Refreshing Card`);
        gameState.messages.push(`Player ${playernum} played Refreshing Card`);
        gameState.currentTurn = gameState.currentTurn
      } else if (card.rank === '7') {
        gameState.lowCardActive = true;
        console.log(`Player ${playernum} played Low Card`);
        gameState.messages.push(`Player ${playernum} played Low Card`);
        gameState.currentTurn = (gameState.currentTurn % 4) + 1;
      } else if (card.rank === '8') {
        gameState.currentCard = gameState.pile[gameState.pile.length - 2];
        console.log("current card: ",  gameState.currentCard)
        console.log(`Player ${playernum} played Invisible Card`);
        gameState.messages.push(`Player ${playernum} played Invisible Card`);
        gameState.currentTurn = (gameState.currentTurn % 4) + 1;
      } else if (card.rank === '10') {
        gameState.pile = [];
        gameState.currentCard = null;
        console.log(`Player ${playernum} played Burn Card`);
        gameState.messages.push(`Player ${playernum} played Burn Card`);
        gameState.currentTurn = (gameState.currentTurn % 4) + 1;
      }
      else{
        console.log(`Player ${playernum} played ${card.rank} of ${card.suit}`);
        gameState.messages.push(`Player ${playernum} played ${card.rank} of ${card.suit}`);
        gameState.currentTurn = (gameState.currentTurn % 4) + 1;
      }
    
    
      if (gameState.deck.length > 0 && cardType === 'hand') {
        currentPlayer.hand.push(gameState.deck.pop()!);
      }else if (cardType === 'faceup') {
        gameState.currentCard!.show = true; // Show the face-up card
      } else if (cardType === 'facedown') {
        gameState.currentCard!.show = true; // Show the face-down card
      } 

      if (currentPlayer.hand.length <= 0){
        currentPlayer.playstatus = "faceup"
      }
      else  if (currentPlayer.hand.length <= 0 && currentPlayer.faceup.length <= 0){
        currentPlayer.playstatus = "facedown"
      } else{
        currentPlayer.playstatus = "hand"
      }

    } else {
      const errorMessage = gameState.lowCardActive ? 'higher than the current card' : 'lower than the current card';
      console.log(`Player ${playernum} tried to play ${card.rank} of ${card.suit}, but it's ${errorMessage}`);
      gameState.messages.push(`Player ${playernum} tried to play ${card.rank} of ${card.suit}, but it's ${errorMessage}`);
    }

    console.log(`It is Player ${gameState.currentTurn}'s turn`)
    gameState.messages.push(`It is Player ${gameState.currentTurn}'s turn`)
    io.emit("gameState", gameState);
  });


});