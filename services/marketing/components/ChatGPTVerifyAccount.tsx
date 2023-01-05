import React, { useState, useRef, createRef, useEffect } from "react";
import { useRouter } from 'next/router'
import { ToastContainer } from 'react-toastify';
import { isEmail, notify } from "./utils";
import { getToken, saveToken } from "./hooks/useToken";
import 'react-toastify/dist/ReactToastify.css';


const baseUrl = process.env.NEXT_PUBLIC_API_URL

const ChatGPTVerifyAccount = () => {
    const [verificationResult, setVerificationResult ] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        const queryParams = router.query;
        fetch(baseUrl + '/verify', {
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({verificationToken: queryParams.token})
        })
        .then(result => result.json())
        .then(verificationResponse => {
            setVerificationResult(verificationResponse.verified)
            if (verificationResponse.verified) {
                saveToken({token: ''})
                window.location.href = '/chatGPT/login'
            }

        })
        .catch(err => {
            notify('Unknown error. Please email contact@tradingpostapp.com for help.')
        })
    })
    
    return (
        <>
            <div className="verifyBase">
                <div className="verifyMessage">
                    <p>
                        {verificationResult ? 
                            'Email verification was successful! Redirecting you back to the login screen' :
                            'Email verification was unsucessful. Please email contact@tradingpostapp.com for assistance.'}
                    </p>
                </div>
                <ToastContainer />
            </div>
        </>
    )
}

export default ChatGPTVerifyAccount;