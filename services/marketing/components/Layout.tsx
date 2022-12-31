import React, { useState, useRef, createRef, useEffect } from "react";
import Navbar from './Navbar';
import Footer from './Footer';
import SideMenu from './Sidebar';
import { getToken } from "./hooks/useToken";
import { notify } from "./utils";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// @ts-ignore
export default function Layout({children}) {
    const [token, setToken] = useState('');
    const [user, setUser] = useState<any>(null)
    const [isAuthed, setIsAuthed] = useState(false)

    useEffect(() => {
        const newToken = getToken();
        setToken(newToken);
        
        if (newToken) {
            fetch(baseUrl + '/getAccount', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "authorization": 'Bearer ' + newToken
                }
            })
            .then(result => result.json())
            .then(user => {
                if (user.userId) {
                    setUser(user)
                    setIsAuthed(true)
                }
                else if (user.statusCode === 401) {
                    notify(user.msg)
                }
                else {
                    notify(`Unknown error. Please email contact@tradingpostapp.com for help.`)
                }
            })
            .catch(err => {
                console.error(err)
                notify(`Unknown error. Please email contact@tradingpostapp.com for help.`)
            })
        }
        

    }, [])
    return (
        <>
            <SideMenu pageWrapId={'page-wrap'} outerContainerId={'navbar'} isAuthed={isAuthed} username={user?.userName}/>

            <Navbar isAuthed={isAuthed} user={user}/>

            {children}

            <Footer/>
        </>
    );
}
