import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import { Home } from './pages/Home';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>
        TradingPost Admin Tool
      </h1>
     <BrowserRouter>
      <div className='container'>
        <Routes>
          <Route path='/' element={<Home />}/>
        </Routes>
      </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
