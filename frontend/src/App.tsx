import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { io } from "socket.io-client"
import HomePage from './components/Home/Home';
import Teenpatti from './components/TeenPatti/Teenpatti'


const socket = io('http://localhost:3001',{ transports: ["websocket"] });
socket.connect()


function App() {
  
  return (
    <div>
      <Router>
        <Routes>
          {/* <Route path="/" element={<HomePage socket={socket} />} /> */}
          <Route path="/" element={<Teenpatti socket={socket}/>} />
        </Routes>
      </Router>

    </div>
  );
}

export default App;
