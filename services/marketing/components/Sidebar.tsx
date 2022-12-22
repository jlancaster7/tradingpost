import React from "react";
import {slide as Menu} from 'react-burger-menu';
import HomeIconSvg from '../public/HomeIcon.svg';
import AboutSvg from '../public/AboutIcon.svg';
import LoginSvg from '../public/LoginIcon.svg';
import Image from 'next/image';

type SideMenuProps = {
    pageWrapId: string
    outerContainerId: string
}

const SideMenu: React.FunctionComponent<SideMenuProps> = ({pageWrapId, outerContainerId}) => {
    return (
        <Menu className="side-menu">
            <a className="menu-item" href="/">
                <Image src={HomeIconSvg} alt="home icon"/>
                <p>Home</p>
            </a>
            <a className="menu-item" href="/chatGPT">
                <Image src={HomeIconSvg} alt="home icon"/>
                <p>chatGPT</p>
            </a>
            <a className="menu-item" href="/about">
                <Image src={AboutSvg} alt="about icon"/>
                About
            </a>
            <a className="menu-item" href="https://m.tradingpostapp.com">
                <Image src={LoginSvg} alt="login icon"/>
                Login
            </a>
        </Menu>
    );
};

export default SideMenu;