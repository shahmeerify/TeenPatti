import React, { useState, useEffect } from "react"
import { Socket } from "socket.io-client" 
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import './Home.css'

interface HomePageProps {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>,
  gameFull: boolean,
}

function HomePage({socket, gameFull}: HomePageProps){
    const [name, setName] = useState(''); 
    const [loading, setLoading] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(''); 
    
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
    };
    const handleClick = () => {
      setLoading(true); // Show loading screen
      console.log('Sending playerJoined event with name:', name);
      socket.emit('playerJoined', name); // Emit event with name
    };
    
    useEffect(() => {
        socket.on('startGame', () => {
          setLoading(false); // Hide loading screen
        });
      
        socket.on('gameFull', () => { // Listen for gameFull event
          setLoading(false); // Hide loading screen
          alert("The game is full. Please try again later."); // Display alert
        });
    }, [socket]);
  
    return(
      <>
        {errorMessage ? (
          <div className="sampleHomePage">
            <h1 className="sampleTitle">Welcome to TeenPatti</h1>
            <div className="sampleMessage">
              <h2>{errorMessage}</h2>
            </div>
          </div>
        ) : loading ? (
          <div className="sampleHomePage">
            <h1 className="sampleTitle">Welcome to TeenPatti</h1>
            <div className="sampleMessage">
              <h2>Waiting for other players to join...</h2>
            </div>
          </div>
        ) : gameFull ? (
            <div className="sampleHomePage">
              <h1 className="sampleTitle">Welcome to TeenPatti</h1>
              <div className="sampleMessage">
                <h2> Game Full. Please Try again later!!!</h2>
              </div>
            </div>
        ) : (
          <div className="sampleHomePage">
            <h1 className="sampleTitle">Welcome to TeenPatti</h1>
            <div className="sampleMessage">
              <input placeholder="Enter your name" value={name} onChange={handleNameChange} /> {/* Add input field */}
              <button onClick={handleClick}>Join game</button> {/* Add button */}
            </div>
          </div>
        )}
      </>
    )
  }  
export default HomePage
