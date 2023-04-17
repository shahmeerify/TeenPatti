import React, { useState, useEffect } from 'react';
import "./teenpatti.css";
import Player, { PlayerProps } from './Player';
import Messages from './Messages'
import Hand from './Hand';
import HomePage from '../Home/Home';
import { Socket } from "socket.io-client" 
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import PlayArea from './PlayArea';
import { CardProps } from './Card';


interface TeenpattiProps {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>
}

const Teenpatti = ({ socket }: TeenpattiProps) => {
  const [players, setPlayers] = useState<PlayerProps[]>([]);
  const [centerCards, setCenterCards] = useState<CardProps[]>([])
  const [messages, setmessages] = useState<string[]>([])
  const [playernum, setPlayernum] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameFull, setGameFull] = useState<boolean>(false);
  const [turn, setTurn] = useState<number>(0); 
  const [playStatus, setPlayStatus] = useState<'hand' | 'faceup' | 'facedown'>('hand');
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  
  useEffect(() => {
    socket.on('startGame', () => {
      setGameStarted(true);
    });

    socket.on('setPlayerNum', (playerNumber) => { // Listen for setPlayerNumber event
      setPlayernum(playerNumber);
      console.log("Player number set to", playernum);
    });

    socket.on('setPlayer', (playersData) => {
      setPlayers(playersData);
      console.log(playersData)
    });

    socket.on('topCard', (topCard) => {
      setCenterCards(topCard)
    });

    socket.on('currentTurn', (currentTurn) => {
      setTurn(currentTurn)
    });
    
    socket.on('message', (data) => {
      setmessages(data)
    });

    socket.on("gameState", (updatedGameState) => {
      setPlayers(updatedGameState.players);
      setCenterCards(updatedGameState.pile);
      setTurn(updatedGameState.currentTurn);
      setmessages(updatedGameState.messages);
      const currentPlayer = updatedGameState.players[playernum - 1];
      setPlayStatus(currentPlayer.playStatus);
      setGameEnded(updatedGameState.gameEnded);
    });
    
    socket.on('gameFull', () => { // Listen for gameFull event
      setGameFull(true); // Set gameFull state to true
    });
  }, [socket, playernum] );

  useEffect(() => {
    if (gameStarted && playernum === turn) {
      setTimeout(() => {
        socket.emit("checkValidCard", playernum, playStatus);
      }, 2000);
    }
  }, [socket, gameStarted, playernum, turn, playStatus]);

  const updatePlayStatus = (player: PlayerProps) => {
    console.log("h: ", player.hand.length)
    if (player.hand.length === 0 && player.faceup.length > 0) {
      console.log("here")
      return 'faceup';
    } else if (player.hand.length === 0 && player.faceup.length === 0) {
      return 'facedown';
    } else {
      return 'hand';
    }
  };
  

  const playCard = (card: CardProps, cardType: string) => {
    if (playernum === turn) {
      socket.emit("playCard", playernum, card, cardType);
    } else {
      alert(`It's not your turn. Its player ${turn}'s turn`);
    }
  };
  

  return (
    <>
      {(gameStarted && !gameEnded) ? (
        <div className="main-container playingCards">
          {/* Game Container */}
          <div className="game-container">
            <div className="heading-container">
              <h1>Teen Patti</h1>
            </div>
            <div className="game-table-container">
              <div className="game-table">
                <PlayArea cards={centerCards}/>
                <Player name={players[0].name} number={players[0].number} hand={players[0].hand} faceup={players[0].faceup} facedown={players[0].facedown}/>
                <Player name={players[1].name} number={players[1].number} hand={players[1].hand} faceup={players[1].faceup} facedown={players[1].facedown}/>
                <Player name={players[2].name} number={players[2].number} hand={players[2].hand} faceup={players[2].faceup} facedown={players[2].facedown}/>
                <Player name={players[3].name} number={players[3].number} hand={players[3].hand} faceup={players[3].faceup} facedown={players[3].facedown}/>
              </div>
            </div> 
          </div>
          <div className="messages-and-cards-container">
              <Messages messages={messages.slice().reverse()}/>
              <Hand
                hand={players[playernum - 1].hand} faceup={players[playernum - 1].faceup} facedown={players[playernum - 1].facedown}
                disabled={turn === playernum} playStatus={playStatus} playCard={playCard}/>
          </div>
        </div>
      ) : (
        <>
          <HomePage socket={socket} gameFull={gameFull} />
        </>
      )}
    </>
  );
};

export default Teenpatti;
