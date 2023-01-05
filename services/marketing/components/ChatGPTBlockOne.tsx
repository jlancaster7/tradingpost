
import React, { useState, useRef, createRef, useEffect } from "react";
import { ImageList, ImageListItem, ImageListItemBar, IconButton  } from '@mui/material'
import {
    CSSTransition
  } from 'react-transition-group';
  import SendIcon from '@mui/icons-material/Send';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getToken, saveToken } from "./hooks/useToken";
import { notify } from "./utils";
import Typewriter from "./Typewriter";


//const baseUrl = 'https://openai.tradingpostapp.com' || 'http://localhost:8082'
const baseUrl = process.env.NEXT_PUBLIC_OPENAI_API_URL 

const ChatGPTBlockOne = () => {
    const [token, setToken] = useState(''),
          [user, setUser] = useState<any>(null),
          [isAuthed, setIsAuthed] = useState(false),
          [hideTips, setHideTips] = useState(true);

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
    
    const [question, setQuestion] = useState(""),
          [answer, setAnswer] = useState<any[]>([]),
          [isMobile, setIsMobile] = useState(false),
          [questionSubmitted, setQuestionSubmitted] = useState(false),
          [inProp, setInProp] = useState(false),
          [cursor, setCursor] = useState(false),
          [windowSize, setWindowSize] = useState({
        innerWidth: 0,
        innerHeight: 0,
      });

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (question === '') {
            notify(`Please enter a question and try asking Michael again.`)
        } else {
            
            if (user.verified) {
                if (user.totalTokens - user.tokensUsed <= 0) {
                    notify("You're all out of tokens!")
                    return
                }
            }
            else {
                if (user.totalTokens - user.tokensUsed <= 15) {
                    notify('To use your remaining 15 tokens please verify your email address! A verification email was sent from no-reply@tradingpostapp.com.');
                    return
                }
            }
            setQuestionSubmitted(true);
            const time = (new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setAnswer((p: any[]) => {
                p.push({author: 'User', response: question, time});
                return p;
            })
            setCursor(true)
            fetch(baseUrl + '/chatGPT/prompt', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "authorization": 'Bearer ' + token
                },
                body: JSON.stringify({
                    symbol: list[0].symbol,
                    prompt: question
                })
            })
            .then(result => {
                setQuestion('')
                
                return result.json()
            })
            .then(text => {
                setCursor(false)
                if (text.answer !== '') {
                    setAnswer((p: any[]) => {
                        const newAnswer = p.slice(0);
                        const time = (new Date()).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                        newAnswer.push({author: 'Michael', response: text.answer, time})
                        setQuestion('')
                        return newAnswer;
                    })
                    user.tokensUsed +=1
                    setUser(user);
                }
                else if (text.statusCode === 401) {
                    notify(text.msg)
                }
                else {
                    notify(`Unknown error. Please email contact@tradingpostapp.com for help.`)
                }
                
            })
            .catch((err) => {
                notify(`Unknown error. Please email contact@tradingpostapp.com for help.`)
                saveToken({token: ''})
                //console.error(err)
            })
            .finally(() => {
                setQuestionSubmitted(false)
            })
        }   
    }
    const resetQuestion = (e?: { preventDefault: () => void; }) => {
        if (e) e.preventDefault();
        setQuestion('');
        setAnswer([]);
        setQuestionSubmitted(false);   
        setHideTips(true);
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
        if (list.length > 1) return;
       (async () => {
            setList(() => data)
            resetQuestion()
        })()
    }, [inProp])

    let data: any[] = [
        {symbol: 'AAPL', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/AAPL.png', nodeRef: createRef<any>()}, 
        {symbol: 'ABNB', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/ABNB.png', nodeRef: createRef<any>()}, 
        {symbol: 'ADBE', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/ADBE-1671486682003.png', nodeRef: createRef<any>()}, 
        {symbol: 'AMZN', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/AMZN.png', nodeRef: createRef<any>()}, 
        {symbol: 'COST', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/COST.png', nodeRef: createRef<any>()}, 
        {symbol: 'CRM', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/CRM.png', nodeRef: createRef<any>()}, 
        {symbol: 'CRWD', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/CRWD-1671487114964.png', nodeRef: createRef<any>()}, 
        {symbol: 'DDOG', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/DDOG-1671487143454.jpg', nodeRef: createRef<any>()}, 
        {symbol: 'DIS', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/DIS.png', nodeRef: createRef<any>()}, 
        {symbol: 'GOOGL', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/GOOG-1666113693819.jpg', nodeRef: createRef<any>()}, 
        {symbol: 'META', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/META-1671487025787.jpg', nodeRef: createRef<any>()}, 
        {symbol: 'MSFT', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/MSFT.png', nodeRef: createRef<any>()}, 
        {symbol: 'NVDA', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/NVDA.png', nodeRef: createRef<any>()}, 
        {symbol: 'SNAP', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/SNAP-1671486920339.png', nodeRef: createRef<any>()}, 
        {symbol: 'SNOW', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/SNOW-1671486875966.jpg', nodeRef: createRef<any>()}, 
        {symbol: 'TGT', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/TGT.png', nodeRef: createRef<any>()}, 
        {symbol: 'TSLA', logoUrl: 'https://tradingpost-images.s3.us-east-1.amazonaws.com/TSLA-1671486638257.jpg', nodeRef: createRef<any>()}, 
        {symbol: 'V', logoUrl: 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/V.png', nodeRef: createRef<any>()}, 
    ]

    const [list, setList] = useState(data);
    
    return (!token ? null : <>
        <div className="chatgptTop">    
            <h1 className="title">
                <span className="titleWhite">ChatWithManagement</span>
                <span style={isMobile ? {display: 'flex'} : {display: 'none'}} className="titleGreen"> </span>
                <span className="titleGreen">GPT</span>
            </h1>
            <p>
                Ask any quesiton you may have and our A.I.-powered analyst, Michael, will find an answer for you.
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
                            <CSSTransition key={`${item.logoUrl}_css_transition`}
                                           nodeRef={item.nodeRef}
                                           in={inProp}
                                           timeout={1500}
                                           classNames="item"
                                           >
                                <ImageListItem key={`${item.logoUrl}_image_list_item`}
                                               ref={item.nodeRef}
                                               onClick={async (e) => {
                                                   setInProp(!inProp)
                                                   if (list.length === 1) return
                                                   await sleep(1000);
                                                   setList((g) => g.filter((d) => d.logoUrl === item.logoUrl))
                                                   }}>
                                    <img key={`${item.logoUrl}_img`}
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
                 style={list.length === 1 ? {display: 'block'} : {display: 'none'}}
                >
                <div className="chatgptAnswer"
                     style={answer.length > 0 ? {display: 'flex'} : {display: 'none'}}
                    >
                    <div className="chatBox"
                         >
                        {answer.map(a => {
                            return (
                                <div style={a.author === 'User' ? {alignSelf: 'flex-start', maxWidth: '60%'} : {alignSelf: 'flex-end', maxWidth: '60%'}}>
                                    <p style={a.author === 'User' ? {textAlign: 'left', wordBreak: 'normal', whiteSpace: 'normal'} : {textAlign: 'left', wordBreak: 'normal', whiteSpace: 'normal'}}>
                                        {`${a.response}`}
                                    </p>
                                    <p style={a.author === 'User' ? {textAlign: 'left', fontSize: '14px', opacity: 0.9, marginLeft: '10px'} : {textAlign: 'right', fontSize: '14px', opacity: 0.9, marginRight: '10px'}}>
                                        {`${a.author} - ${a.time}`}
                                    </p>
                                </div>
                            )
                        }
                        )}
                        {cursor ? 
                            <div style={{alignSelf: 'flex-end'}}>
                                <Typewriter mount={cursor} text='Michael is typing...' cursor={true} />
                            </div> 
                            : null
                        }
                    </div>
                </div>
                <form className="questionForm">
                    <input className="questionInputBox" 
                           placeholder="Enter your question here"
                           onChange={(e) => setQuestion(e.target.value)} 
                           onKeyPress={(e) => {if ( e.key === 'Enter') handleSubmit(e)}}
                           value={question}
                           disabled={questionSubmitted}
                           />
                    <div className="buttonGroup">
                        <IconButton className="questionSubmitButton" 
                                    onClick={handleSubmit}
                                    disabled={questionSubmitted}
                                    >
                            <SendIcon />
                        </IconButton >
                        
                    </div>

                </form>
                <div className="tokenCounter">
                    <p>
                        {user ? `Tokens Remaining: ${user.totalTokens - user.tokensUsed}` : ''}
                    </p>
                </div>
                <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                    <button className="tipsButton"
                            onClick={() => setHideTips(!hideTips)}>
                        Tips and tricks
                    </button>
                    <div className="tips" style={hideTips ? {display: 'none'} : {display: 'inherit'}}>
                        <ol type="1">
                            <li>
                                <span style={{fontWeight: '700'}}>Be specific about the time period (ie quarter, year) that you are referring to.</span>
                                <br />
                                &emsp;Example: 
                                <br />
                                &emsp;&emsp;Good - How much did revenue grow in Q1 2022?
                                <br />
                                &emsp;&emsp;Bad - How much did revenue grow last quarter?
                            </li>
                        </ol>
                        
                    </div>

                    
                </div>
            </div>
            <ToastContainer />
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