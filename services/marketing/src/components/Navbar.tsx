import React from "react";
import TPLogoSvg from '../assets/TPLogo.svg';

const Navbar = () => {
    return (
        <nav className="navbar">
            <h1 className='title'>
                <a href="/"><img src={TPLogoSvg} alt="tradingpost logo"/></a>
                <a href="/"><span className='titleWhite'>Trading</span></a>
                <a href="/"><span className='titleGreen'>Post</span></a>
            </h1>
            <div className="links">
                <a href="/about" style={{
                    color: "white",
                }}>About</a>
            </div>
        </nav>
    );
}

export default Navbar;