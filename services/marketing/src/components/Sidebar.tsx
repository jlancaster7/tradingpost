import React from "react";
import {slide as Menu} from 'react-burger-menu';

type SideMenuProps = {
    pageWrapId: string
    outerContainerId: string
}

const SideMenu: React.FunctionComponent<SideMenuProps> = ({pageWrapId, outerContainerId}) => {
    return (
        <Menu>
            <a className="menu-item" href="/">
                Home
            </a>
            <a className="menu-item" href="/about">
                About
            </a>
            <a className="menu-item" href="https://m.tradingpostapp.com">
                Login
            </a>
            <a className="menu-item" href="/https://m.tradingpostapp.com/create">
                Create Account
            </a>
        </Menu>
    );
};

export default SideMenu;