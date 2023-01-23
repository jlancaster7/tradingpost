import React, {useEffect, useState} from "react";
import { HtmlWindow } from "../../components/HtmlWindow";
import { LabelControlPanel } from "../../components/LabelPanel";
import { useQuery } from "../../utils";

const baseApiUrl = process.env.REACT_APP_BASE_API_URL;

export function DocEditor () {
    const [divKey, setDivKey] = useState(''),
          [title, setTitle] = useState(''),
          [newTitle, setNewTitle] = useState(''),
          [htmlString, setHtmlString] = useState(''),
          [edittedHtml, setEdittedHtml] = useState(''),
          queryHook = useQuery(),
          fileName = queryHook.get('fileName');
    useEffect(() => {
        setNewTitle('')
    }, [divKey])
    
    useEffect(() => {
        if (!fileName) return;
        fetch(baseApiUrl + '/file' + `?fileName=${fileName}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(result => result.json())
        .then(responseHtml => {
            console.log(responseHtml.html)
            setHtmlString(responseHtml.html)
            setEdittedHtml(responseHtml.html)
        })
        .catch(err => {
            console.error(err);
        })
    }, [])
    return (
        <>
            <div style={{height: '100vh', display: 'flex', flexDirection: 'row', backgroundColor: 'gray'}}>
                <HtmlWindow key={`${htmlString.length}_${divKey}`}
                            html={htmlString} 
                            style={{width: '70vw', height: '70%', overflowY:'scroll', overflowX: 'clip', padding: 10, backgroundColor: 'white'}}
                            divKey={divKey}
                            setDivKey={setDivKey}
                            title={title}
                            setTitle={setTitle}
                            newTitle={newTitle}
                            setNewTitle={setNewTitle}
                            />
                <div style={{width: '30vw', height: '70%'}}>
                    <LabelControlPanel 
                                       divKey={divKey} 
                                       title={title} 
                                       setTitle={setTitle} 
                                       newTitle={newTitle}
                                       setNewTitle={setNewTitle}
                                       //edittedHtml={edittedHtml}
                                       //setEdittedHtml={setEdittedHtml}
                                       //fileName={fileName || ''}
                                       />
                </div>
            </div>
        </>
    )
}