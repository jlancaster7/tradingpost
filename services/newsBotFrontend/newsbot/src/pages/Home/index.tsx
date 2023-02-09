
import React, {useEffect, useState} from "react";
import { notify } from "../../utils";
import { ToastContainer} from 'react-toastify';
import '../../styles/styles.css'


const baseUrl = 'http://localhost:8085'

export function Home () {
    const [articleText, setArticleText] = useState('');
    const [articleUrl, setArticleUrl] = useState('');
    const [articleSource, setArticleSource] = useState('');
    const [articleSummary, setarticleSummary] = useState('');
    const [audioFileUri, setAudioFileUri] = useState('');

    const handleSummarySubmit = (e: { preventDefault: () => void;}) => {
        e.preventDefault();
        
        if (articleText === '') {
            console.log('You need to enter some article text')
            return
        }
        else {
            fetch(baseUrl + '/newsBot/summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    articleText: articleText
                })
            })
            .then(result => result.json())
            .then(text => {
                setarticleSummary(text.summary)
            })
        }
    }
    const handleSummaryPush = (e: { preventDefault: () => void}) => {
        e.preventDefault();
        if (articleSummary === '') {
            console.log('There is no summary to push')
        } 
        else {
            fetch(baseUrl + '/newsBot/createPost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    articleSummary: articleSummary,
                    articleUrl: articleUrl,
                    articleSource: articleSource
                })
            })
            .then(result => result.json())
            .then(text => {
                setarticleSummary(text.summary)
            })
        }
    }
    const handleAudioPush = (e: { preventDefault: () => void}) => {
        e.preventDefault();
        if (articleSummary === '') {
            console.log('There is no summary to push')
        } 
        else {
            fetch(baseUrl + '/newsBot/createAudio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    articleSummary: articleSummary,
                    //articleUrl: articleUrl,
                    //articleSource: articleSource
                })
            })
            .then(response => response.json())
            .then(result => {
                setAudioFileUri(result.uri)
                console.log(result.msg)
            })
        }
    }
    const handleMergeAV = (e: { preventDefault: () => void}) => {
        e.preventDefault();
        /*
        if (audioFileUri === '') {
            console.log('There is no summary to push')
        } 
        else {
        */
            fetch(baseUrl + '/newsBot/mergeAV', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    audioFileUri: audioFileUri
                })
            })
            .then(result => result.json())
            .then(text => {
                setAudioFileUri(text)
                console.log(text)
            })
        //}
    }

    return (
        <>
        <div className="HomePage">
                <h2>
                    TradingPost News Bot Tool
                </h2>
                <form className="articleForm">
                    <div className="articleDataContainer">
                        <input className="articleData"
                            placeholder="Article Url"
                            onChange={(e) => setArticleUrl(e.target.value)}
                            
                            value={articleUrl}
                        />
                        <input className="articleData"
                            placeholder="Article Source"
                            onChange={(e) => setArticleSource(e.target.value)}
                            
                            value={articleSource}
                        />
                    </div>
                    <div className="textInputContainer">
                        <input className="articleTextInput"
                            placeholder="Copy and paste article text here"
                            onChange={(e) => setArticleText(e.target.value)}
                            onKeyPress={(e) => {if ( e.key === 'Enter') handleSummarySubmit(e)}}
                            value={articleText}
                        />
                        <button className="articleInputButton"
                                onClick={handleSummarySubmit}>
                            Get Summary
                        </button>
                    </div>

                </form>
                <div>
                    <h3>
                        Summary
                    </h3>
                    <p className="articleSummary">
                        {articleSummary}
                    </p>
                    <div style={articleSummary === '' ? {display: 'none'} : {display: 'block'}}>
                        <button className="pushArticleButton"
                                onClick={handleAudioPush}>
                            Generate and upload audio file
                        </button>
                    </div>
                    <div style={audioFileUri === '' ? {display: 'none'} : {display: 'block'}}>
                        <p>
                            {audioFileUri}
                        </p>
                    </div>
                    <div>
                        <button className="mergeAVButton"
                                onClick={handleMergeAV}>
                            Merge Audio with Video
                        </button>
                    </div>
                    <div style={articleSummary === '' ? {display: 'none'} : {display: 'block'}}>
                        <button className="pushArticleButton"
                                onClick={handleSummaryPush}>
                            Push summmary to posts
                        </button>
                    </div>
                </div>
        </div>
        </>
    )
}
