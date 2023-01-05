
import React, { useState, useRef, createRef, useEffect } from "react";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getToken, saveToken } from "./hooks/useToken";
import { notify } from "./utils";

//const baseUrl = 'https://openai.tradingpostapp.com' || 'http://localhost:8082'
const baseUrl = process.env.NEXT_PUBLIC_API_URL

const ChatGPTLogin = () => {
    const [hydrate, setHydrate] = useState(false);
    useEffect(() => {
        setHydrate(true);
    }, [])
    
    const [password, setPassword] = useState(''),
          [email, setEmail] = useState('')

    const handleLogin = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if ( password === '' || email === '') {
            notify(`Please make sure to enter your username and password to login.`)
        } else {
            
            fetch(baseUrl + '/login', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    pass: password
                })
            })
            .then(result => result.json())
            .then(loginResponse => {
                if (loginResponse.token) {
                    saveToken({token: loginResponse.token})
                    window.location.href = '/chatGPT'
                }
                else if (loginResponse.statusCode === 401){
                    notify(loginResponse.msg)
                    setPassword('');
                }
                else {
                    notify(`Unknown error. Please email contact@tradingpostapp.com for help.`)
                    setEmail('');
                    setPassword('');
                }
            })
            .catch(err => {
                notify(`Unknown error. Please email contact@tradingpostapp.com for help.`)
                setEmail('');
                setPassword('');
            })
        }
    }
    return (!hydrate ? null : <>
        <div className="loginBase">
            <form className="loginForm">
                <div className="title">
                    <h1>
                        {`Login to`}
                    </h1>
                    <h1>
                        {'TradingPost'}
                    </h1>
                </div>
                <div className="loginEmailBox">
                    <input className="loginEmail" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        />
                </div>
                <input type='password' 
                       className="loginPassword" 
                       placeholder="Password" 
                       value={password} 
                       onChange={(e) => setPassword(e.target.value)}
                       />
                <div className="buttonGroup">
                    <button className="login"
                            onClick={handleLogin}
                            >
                        {'Login'}
                    </button>
                </div>
                <div className="createAccountLine">
                    <p>Don't have an account?</p>
                    <button className="createLinkButton"
                            type="button"
                            onClick={() => {
                                window.location.href = '/chatGPT/createAccount';
                            }}
                            >
                        Sign Up!
                    </button>
                </div>
                
            </form>
            <ToastContainer />
        </div>
    </>
    )
}
export default ChatGPTLogin;