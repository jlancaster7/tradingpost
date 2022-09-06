import React from "react";
import { slide as Menu } from 'react-burger-menu';

const SideMenu = () => {
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