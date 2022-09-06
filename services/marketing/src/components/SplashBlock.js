import React, {useState} from "react";

const baseUrl = process.env.API_URL || 'http://localhost:8082';

const SplashBlock = () => {
    const [email, setEmail] = useState("");
    const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);

    // In useEffect, in the [] at the end, it basically tells the useEffect when to run
    // .. if this variable changes.. then it fires the useEffect
    const handleSubmit = (e) => {
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

            <HandleEmailForm emailState={[email, setEmail, handleSubmit, isEmailSubmitted]}/>
            <div className="appStoreIcons">
                <a href="https://play.google.com/store/" target="_blank" rel="noreferrer">
                    <img className="playstore" alt=''/>
                </a>
                <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer">
                    <img className="appstore" alt=''/>
                </a>

            </div>
            <div className="illustrations">
                <img className="illustrationImg" alt='' />
            </div>

        </div>
    );
}

const BeforeEmailSubmit = (props) => {
    return <><p className="signUpText">Sign Up For Beta</p>
        <form className="emailForm" onSubmit={props.handler[2]}>
            <input className="emailInput" placeholder=" Email Address" onChange={(e) => props.handler[1](e.target.value)} value={props.handler[0]}></input>
            <button type='submit' className="emailButton"

            >
                Sign Up
            </button>
        </form>
    </>
}
const AfterEmailSubmit = (props) => {
    return <><p className="signUpThankYou">Thanks for signing up! We'll email you when you've been selected to join the
        beta!</p></>
}

const HandleEmailForm = (props) => {
    if (!props.emailState[3]) {
        return <BeforeEmailSubmit handler={props.emailState}/>;
    } else {
        return <AfterEmailSubmit/>
    }
}


export default SplashBlock;