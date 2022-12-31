import * as React from "react";
import TPLogo from '../public/TPLogo.svg';
import Image from 'next/image';
import { saveToken } from "./hooks/useToken";

const Navbar = (props: {isAuthed: boolean, user: any}) => {
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
                <div className="loggedInUserDisplay">
                    <p>
                        {props.user ? 'Logged in as' : ''}
                    </p>
                    <p>
                        {props.user ? `${props.user.userName}` : ''}
                    </p>
                </div>
                
                <button type="button" 
                        onClick={() => {
                            if (!props.isAuthed) {
                                window.location.href = '/chatGPT/login';
                            }
                            else {
                                saveToken({token: ''});
                                window.location.href = '/';
                            }
                        }}
                        >
                    {!props.isAuthed ? `Login` : 'Logout'}
                </button>
                <button type="button"
                        onClick={() => {
                            window.location.href = 'https://m.tradingpostapp.com';
                        }}
                        >
                    Go to TradingPost
                </button>
            </div>
        </nav>
    );
}

export default Navbar;