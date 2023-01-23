import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import { Home } from './pages/Home';
import { DocEditor } from './pages/DocEditor';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>

        <div className='container'>
          <Routes>
            <Route path='/' element={<Home />}/>
            <Route path='/doceditor' element={<DocEditor />}/>
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
