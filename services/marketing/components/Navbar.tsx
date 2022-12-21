import * as React from "react";
import TPLogo from '../public/TPLogo.svg';
import Image from 'next/image';

const Navbar = () => {
    return (
        <nav className="navbar" style={{height: '10vh'}}>
            <h1 className='title'>
                <a href="/"><Image src={TPLogo} alt="tradingpost logo"/></a>
                <a href="/"><span className='titleWhite'>Trading</span></a>
                <a href="/"><span className='titleGreen'>Post</span></a>
            </h1>
            <div className="links">
                <a href="/about" style={{
                    color: "white",
                }}>About</a>
                <a href="/chatGPT" style={{
                    color: "white",
                }}>chatGPT</a>
            </div>
            <div className="loginButton">
                <button type="button" onClick={() => {
                    window.location.href = 'https://m.tradingpostapp.com';
                }}>
                    Login
                </button>
            </div>
        </nav>
    );
}

export default Navbar;