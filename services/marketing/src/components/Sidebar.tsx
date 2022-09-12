import React from "react";
import {slide as Menu} from 'react-burger-menu';
import HomeIconSvg from '../assets/HomeIcon.svg';
import AboutSvg from '../assets/AboutIcon.svg';
import LoginSvg from '../assets/LoginIcon.svg';


type SideMenuProps = {
    pageWrapId: string
    outerContainerId: string
}

const SideMenu: React.FunctionComponent<SideMenuProps> = ({pageWrapId, outerContainerId}) => {
    return (
        <Menu className="side-menu">
            <a className="menu-item" href="/">
                <img src={HomeIconSvg} alt="home icon" />
                <p>Home</p>
            </a>
            <a className="menu-item" href="/about">
                <img src={AboutSvg} alt="about icon" />
                About
            </a>
            <a className="menu-item" href="https://m.tradingpostapp.com">
                <img src={LoginSvg} alt="login icon" />
                Login
            </a>
        </Menu>
    );
};

export default SideMenu;