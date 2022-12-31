import React, { useState, useRef, createRef, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import { isEmail, notify } from "./utils";

import 'react-toastify/dist/ReactToastify.css';

import { saveToken } from "./hooks/useToken";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const ChatGPTCreateAccount = () => {

    const [hydrate, setHydrate] = useState(false);
    useEffect(() => {
        setHydrate(true);
    }, [])

    const [email, setEmail] = useState(''), 
          [password, setPassword] = useState(''),
          [confirmPassword, setConfirmPassword] = useState(''),
          [firstName, setFirstName] = useState(''),
          [lastName, setLastName] = useState(''),
          [userName, setUserName] = useState(''),
          [emailValidation, setEmailValidation] = useState(true);

    
    const validateAndSetEmail = (email: string) => {
        if (isEmail(email)) setEmailValidation(true)
        else setEmailValidation(false)

        setEmail(email)
    }
    const handleCreate = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!email || !password || !isEmail(email) || (password !== confirmPassword)) {
            notify(`Please make sure you've entered a valid email address, your passwords match and you've .`)
        }
        else {
            fetch(baseUrl + '/createAccount', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    pass: password,
                    first_name: firstName,
                    last_name: lastName,
                    username: userName
                })
            })
            .then(result => {
                return result.json()
            })
            .then(loginResponse => {
                if (loginResponse.token) {
                    saveToken({token: loginResponse.token})
                    window.location.href = '/chatGPT'
                }
                else if (loginResponse.statusCode === 401){
                    notify(loginResponse.msg)
                    setConfirmPassword('');
                    setPassword('');
                }
                else {
                    notify(`Unknown error. Please email contact@tradingpostapp.com for help.`)
                    setEmail('');
                    setConfirmPassword('');
                    setPassword('');
                }
            })
            .catch(err => {
                notify(`Unknown error. Please email contact@tradingpostapp.com for help.`)
                setEmail('');
                setConfirmPassword('');
                setPassword('');
            })
        }
    }
    return (!hydrate ? null : 
    <>
        <div className="loginBase">
            <form className="loginForm">
                <div className="title">
                    <h1>Create a</h1>
                    <h1>TradingPost</h1>
                    <h1>Account</h1>
                </div>
                <input type='text' 
                       className="accountInfo" 
                       placeholder="First Name" 
                       value={firstName} 
                       onChange={(e) => setFirstName(e.target.value)}
                       />
                <input type='text'
                       className="accountInfo" 
                       placeholder="Last Name" 
                       value={lastName} 
                       onChange={(e) => setLastName(e.target.value)}
                />
                <input type='text' 
                       className="accountInfo" 
                       placeholder="Username" 
                       value={userName} 
                       onChange={(e) => setUserName(e.target.value)}
                />
                <div className="loginEmailBox">
                    <input type='email'
                        className="loginEmail" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => validateAndSetEmail(e.target.value)}
                        />
                        <p className="emailCheck"
                           style={(email !== '' && !emailValidation) ? {color: 'red', fontSize: 'small', justifyContent: 'flex-start'} : {display: 'none'}}
                       >
                        'Email' is not valid.
                    </p>
                </div>
                <input type='password' 
                       className="loginPassword" 
                       placeholder="Password" 
                       value={password} 
                       onChange={(e) => setPassword(e.target.value)}
                       />
                <div className="confirmLoginPasswordBox">
                    <input type='password' 
                        className="confirmLoginPassword" 
                        placeholder="Confirm Password"
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    <p className="passwordCheck"
                       style={(confirmPassword !== '' && password !== confirmPassword) ? {color: 'red', fontSize: 'small', justifyContent: 'flex-start'} : {display: 'none'}}
                       >
                        'Confirm' does not match
                    </p>
                </div>
                <div className="buttonGroup">
                    <button className="createAccount"
                            onClick={handleCreate}
                            >
                            Create Account
                    </button>
                </div>
                <div className="signInLine">
                    <p>Already have an account?</p>
                    <button className="createLinkButton"
                            type="button"
                            onClick={() => {
                                window.location.href = '/chatGPT/login';
                            }}
                            >
                        Login!
                    </button>
                </div>
            </form>
            <ToastContainer />
        </div>
    </>
    )
}
export default ChatGPTCreateAccount;