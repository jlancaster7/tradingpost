import React, { useState, useRef, createRef, useEffect } from "react";
import Navbar from './Navbar';
import Footer from './Footer';
import SideMenu from './Sidebar';
import { getToken } from "./hooks/useToken";

// @ts-ignore
export default function Layout({children}) {
    const [token, setToken] = useState('');

    useEffect(() => {
        const newToken = getToken();
        setToken(newToken);
    }, [])
    return (
        <>
            <SideMenu pageWrapId={'page-wrap'} outerContainerId={'navbar'}/>

            <Navbar token={token}/>

            {children}

            <Footer/>
        </>
    );
}
