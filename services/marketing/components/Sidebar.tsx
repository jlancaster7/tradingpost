import React from "react";
import {slide as Menu} from 'react-burger-menu';
import HomeIconSvg from '../public/HomeIcon.svg';
import AboutSvg from '../public/AboutIcon.svg';
import LoginSvg from '../public/LoginIcon.svg';
import TPLogo from '../public/TPLogoWithHouse.svg'
import Image from 'next/image';
import { saveToken } from "./hooks/useToken";

type SideMenuProps = {
    pageWrapId: string
    outerContainerId: string
    isAuthed: boolean
    username?: string
}

const SideMenu: React.FunctionComponent<SideMenuProps> = ({pageWrapId, outerContainerId, isAuthed, username}) => {
    return (
        <Menu className="side-menu">
            <p className="menu-item">
                {isAuthed ? `Logged in as ${username}` : ''}
            </p>
            <a className="menu-item" href="/">
                <Image src={HomeIconSvg} alt="home icon"/>
                <p>Home</p>
            </a>
            {/*<a className="menu-item" href="/chatGPT">
                <Image src={HomeIconSvg} alt="home icon"/>
                <p>chatGPT <span style={{fontStyle: 'italic'}}>beta</span></p>
            </a>*/}
            <a className="menu-item" href="/about">
                <Image src={AboutSvg} alt="about icon"/>
                About
            </a>
            {/*<a className="menu-item"
                onClick={() => {
                    if (!isAuthed) {
                        window.location.href = '/chatGPT/login';
                    }
                    else {
                        saveToken({token: ''});
                        window.location.href = '/';
                    }
                }}
                >
                <Image src={LoginSvg} alt="login icon"/>
                {!isAuthed ? 'Login' : 'Logout'}
            </a>*/}
            <a style={{padding: 0, borderRadius: '20px'}}className="menu-item" href="https://m.tradingpostapp.com">
                <Image style={{width: '30%', marginRight: '10px'}}
                       src={TPLogo} alt="about icon"/>
                Go to TradingPost App
            </a>
        </Menu>
    );
};

export default SideMenu;