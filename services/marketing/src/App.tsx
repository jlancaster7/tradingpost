import React from "react";
import {Routes, Route} from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SideMenu from './components/Sidebar';

import Home from './pages/Home';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
    return (
        <>
            <SideMenu pageWrapId={'page-wrap'} outerContainerId={'Navbar'}/>

            <Navbar/>

            <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/about' element={<About/>}/>
                <Route path='/privacy-policy' element={<PrivacyPolicy/>}/>
            </Routes>
            <Footer/>
        </>
    );
}

export default App;
