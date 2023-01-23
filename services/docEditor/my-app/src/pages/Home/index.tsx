
import React, {useEffect, useState} from "react";
import { HtmlWindow } from "../../components/HtmlWindow";
import { LabelControlPanel } from "../../components/LabelPanel";
import fs from 'fs'

const baseApiUrl = process.env.REACT_APP_BASE_API_URL;

export function Home () {
    const [fileList, setFileList] = useState([])

    useEffect(() => {
        fetch(baseApiUrl + '/list', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(result => result.json())
        .then(responseList => {
            console.log(responseList.files)
            setFileList(responseList.files)
        })
    },[setFileList])
    return (
        <>
            <div style={{height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'gray'}}>
                {fileList.length && fileList.map((a: any) => {
                    return (
                        <div>
                            <a href={`/doceditor?fileName=${a}`}>
                                {a}
                            </a>
                        </div>
                    )
                })}
            </div>
        </>
    )
}
