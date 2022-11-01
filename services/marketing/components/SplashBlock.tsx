import React, {useState} from "react";
import Image from 'next/image'

const baseUrl = process.env.API_URL || 'http://localhost:8082';

const SplashBlock = () => {
    const [email, setEmail] = useState("");
    const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);

    // In useEffect, in the [] at the end, it basically tells the useEffect when to run
    // . if this variable changes. then it fires the useEffect
    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setIsEmailSubmitted(true);
        const result = fetch(baseUrl + '/alpha/waitlist/add', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email
            })
        })
        console.log(result);
    }

    return (
        <div className="home">
            <h1 className="centralPromise">
                <span className="promiseWhite">Stock Market Analysis From </span>
                <span className="promiseGreen">Every Corner </span>
                <span className="promiseWhite">Of The Internet</span>
            </h1>
            <p className="belowPromise">Searching for quality research is time consuming and frustrating.
                We find the best stock market analysis on the internet so you don't have to.</p>

            <HandleEmailForm email={email}
                             setEmail={setEmail}
                             handleSubmit={handleSubmit}
                             isEmailedSubmitted={isEmailSubmitted}
            />
            <div className="appStoreIcons">
                <a href="https://play.google.com/store/" target="_blank" rel="noreferrer">
                    <span className="playstore"/>
                </a>
                <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer">
                    <span className="appstore" />
                </a>
            </div>
            <div className="illustrations">
                <span className="illustrationImg"/>
            </div>

        </div>
    );
}

type BeforeEmailSubmitProps = {
    setEmail(email: string): void
    handleSubmit(e: { preventDefault: () => void; }): void
    isEmailedSubmitted: boolean
    email: string
}

const BeforeEmailSubmit: React.FunctionComponent<BeforeEmailSubmitProps> = ({
                                                                                email,
                                                                                setEmail,
                                                                                handleSubmit,
                                                                                isEmailedSubmitted
                                                                            }) => {
    return <><p className="signUpText">Sign Up For Beta</p>
        <form className="emailForm" onSubmit={handleSubmit}>
            <input className="emailInput" placeholder=" Email Address"
                   onChange={(e) => setEmail(e.target.value)} value={email}></input>
            <button type='submit' className="emailButton" onClick={handleSubmit}>
                Sign Up
            </button>
        </form>
    </>
}

const AfterEmailSubmit: React.FunctionComponent = () => {
    return <><p className="signUpThankYou">
        Thanks for signing up! We'll email you when you've been selected to join the
        beta!
    </p></>
}

const HandleEmailForm: React.FunctionComponent<BeforeEmailSubmitProps> = ({
                                                                              email,
                                                                              setEmail,
                                                                              handleSubmit,
                                                                              isEmailedSubmitted
                                                                          }) => {
    if (!isEmailedSubmitted) {
        return <BeforeEmailSubmit
            email={email}
            setEmail={setEmail}
            handleSubmit={handleSubmit}
            isEmailedSubmitted={isEmailedSubmitted}
        />;
    } else {
        return <AfterEmailSubmit/>
    }
}


export default SplashBlock;