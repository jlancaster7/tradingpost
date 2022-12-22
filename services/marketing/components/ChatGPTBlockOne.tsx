import React, { useState, useRef, createRef, useEffect } from "react";
import { ImageList, ImageListItem, ImageListItemBar } from '@mui/material'
import {
    CSSTransition
  } from 'react-transition-group';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const ChatGPTBlockOne = () => {
    const [question, setQuestion] = useState(""),
          [answer, setAnswer] = useState(""),
          [isMobile, setIsMobile] = useState(false),
          [submittedQuestion, setSubmittedQuestion] = useState(''),
          [questionSubmitted, setQuestionSubmitted] = useState(false),
          [inProp, setInProp] = useState(false),
          scrollRef = createRef<any>(),
          [windowSize, setWindowSize] = useState({
        innerWidth: 0,
        innerHeight: 0,
      });

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (question === '') {
            notify()
        } else {
            setQuestionSubmitted(true);
            setSubmittedQuestion(question)
            fetch(baseUrl + '/chatGPT/prompt', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    symbol: list[0].symbol,
                    prompt: submittedQuestion
                })
            })
            .then(result => result.json())
            .then(text => setAnswer(text.answer))
            .catch((err) => console.error(err))
        }   
    }
    const resetQuestion = (e?: { preventDefault: () => void; }) => {
        if (e) e.preventDefault();
        setQuestion('');
        setAnswer('');
        setQuestionSubmitted(false);   
    }
    const notify = () => {
        toast(`Please enter a question and try asking Michael again.`,
                {position: toast.POSITION.TOP_CENTER})
    }

    useEffect(() => {
        function handleWindowResize() {
          setWindowSize(getWindowSize());
        }
        handleWindowResize();
        window.addEventListener('resize', handleWindowResize);
        
        return () => {
          window.removeEventListener('resize', handleWindowResize);
        };
      }, [])

    useEffect(() => {
        setIsMobile(() => windowSize.innerWidth < 770 ? true : false)
    },[windowSize, isMobile])

    useEffect(() => {
        if (questionSubmitted) scrollRef.current?.scrollIntoView({behavior: 'smooth'});

    }, [questionSubmitted])

    let data: any[] = [
        {symbol: 'AAPL', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/AAPL.png'}, 
        {symbol: 'ABNB', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/ABNB.png'}, 
        {symbol: 'ADBE', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/ADBE-1671486682003.png'}, 
        {symbol: 'AMZN', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/AMZN.png'}, 
        {symbol: 'COST', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/COST.png'}, 
        {symbol: 'CRM', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/CRM.png'}, 
        {symbol: 'CRWD', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/CRWD-1671487114964.png'}, 
        {symbol: 'DDOG', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/DDOG-1671487143454.jpg'}, 
        {symbol: 'DIS', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/DIS.png'}, 
        {symbol: 'GOOG', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/GOOG-1666113693819.jpg'}, 
        {symbol: 'META', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/META-1671487025787.jpg'}, 
        {symbol: 'MSFT', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/MSFT.png'}, 
        {symbol: 'NVDA', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/NVDA.png'}, 
        {symbol: 'SNAP', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/SNAP-1671486920339.png'}, 
        {symbol: 'SNOW', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/SNOW-1671486875966.jpg'}, 
        {symbol: 'TGT', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/TGT.png'}, 
        {symbol: 'TSLA', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/TSLA-1671486638257.jpg'}, 
        {symbol: 'V', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/V.png'}, 
    ]
    for (let i = 0; i < data.length; i++) {
        const ref = createRef<any>()
        data[i].nodeRef = ref
    }
    const [list, setList] = useState(data);
    useEffect(() => {
        if (list.length > 1) return;
       (async () => {
            setList(() => data)
            resetQuestion()
        })()
    }, [inProp])

    return (<>
        <div className="chatgptTop">    
            <h1 className="title">
                <span className="titleWhite">ChatWithManagement</span>
                <span style={isMobile ? {display: 'flex'} : {display: 'none'}} className="titleGreen"> </span>
                <span className="titleGreen">GPT</span>
            </h1>
            <p>
                Ask any quesiton you may have and our A.I.-powered analyst, Michael, will try and find an answer for you!
            </p>
            <p className="selectCompany">
                Select a Company:
            </p>
            <div className="iconList">
                <ImageList 
                    variant="standard" 
                    key={`Image List`}
                    style={list.length === 1 ? {justifyItems: 'center', marginBottom: '4vh'} : {marginBottom: '10vh'}}
                    cols={list.length === 1 ? 1 : isMobile ? 4 : 6} 
                    gap={20}
                    >
                    {list.map((item) => {
                        return (<>
                            <CSSTransition
                                key={`${item.logoUrl}_css_transition`}
                                nodeRef={item.nodeRef}
                                in={inProp}
                                timeout={1500}
                                classNames="item"
                                >
                                <ImageListItem 
                                    key={`${item.logoUrl}_image_list_item`}
                                    ref={item.nodeRef}

                                    onClick={async () => {
                                        setInProp(!inProp)
                                        if (list.length === 1) return
                                        await sleep(1000);
                                        setList((g) => g.filter((d) => d.logoUrl === item.logoUrl))
                                    }}>
                                    <img 
                                        key={`${item.logoUrl}_img`}
                                        src={`${item.logoUrl}`}
                                        alt={item.symbol}
                                        loading='lazy'
                                    />
                                </ImageListItem>
                            </CSSTransition>
                            </>
                        )
                    })}
                </ImageList>
                <p style={list.length === 1 ? {display: 'flex', alignSelf: 'center'} : {display: 'none'}}>
                    {`(Click the logo to choose a new company)`}
                </p>
            </div>
            <div className="questionInput" 
                style={list.length === 1 ? {display: 'block'} : {display: 'none'}}>
                <form className="questionForm" >
                    <input className="questionInput" placeholder="Enter your question here"
                        onChange={(e) => setQuestion(e.target.value)} 
                        value={question}
                        //disabled={questionSubmitted}
                        />
                    <div className="buttonGroup">
                        <button className="questionSubmitButton" 
                            onClick={handleSubmit}>
                            {'Ask Michael'}
                        </button>
                        <button className="resetButton" 
                            onClick={resetQuestion}
                            style={questionSubmitted ? {}: {display: 'none'}}>
                            {'Reset'}
                        </button>
                    </div>
                    <ToastContainer />
                </form>
            </div>
        </div>
        <div 
            className="chatgptBottom" 
            ref={scrollRef}
            style={questionSubmitted ? {display: 'flex'} : {display: 'none'}}
            >
            <div className="middle" >
                <h1>{submittedQuestion}</h1>
                <p>{answer}</p>
            </div>
        </div>
        </>
    );
}
const sleep = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function getWindowSize() {
    const {innerWidth, innerHeight} = window;
    return {innerWidth, innerHeight};
  }

export default ChatGPTBlockOne;