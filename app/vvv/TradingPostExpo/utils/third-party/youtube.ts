import AsyncStorage from "@react-native-async-storage/async-storage";
import { Api } from "@tradingpost/common/api";
import { openBrowserAsync, WebBrowserResultType } from "expo-web-browser";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Linking } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import uuid from 'react-native-uuid';
import { makeRedirectUrl } from "./shared";

//TODO: SHould put this all in the app later as a generate link 
const clientId = "408632420955-7gsbtielmra10pj4sdccgml20tphfujk.apps.googleusercontent.com";
const platform = "youtube",
    redirectUriText = makeRedirectUrl(platform),// `http://localhost:19006/auth/${platform}`,
    redirectUri = new URL(redirectUriText),
    authUrlText = "https://accounts.google.com/o/oauth2/v2/auth"
//state = `amira_${platform}`;

export interface ITokenResponse {
    "token_type": "bearer",
    "expires_in": number,
    "access_token": string,
    "scope": string
}

export interface TwitterMe {
    id: string,
    name: string
    username: string
}

export function useGoogleAuth() {
    const state = useRef<string>(uuid.v4() as string);
    let intervalHandler = useRef<any>()
    
    const openAuth = useCallback(async () => {
        await AsyncStorage.removeItem("auth-youtube-code");
        const _challenge = Math.random().toString().substring(2, 10);
        //const authUrl = new URL(authUrlText);
        // authUrl.searchParams.append("response_type", "code");
        // authUrl.searchParams.append("client_id", clientId);
        // authUrl.searchParams.append("redirect_uri", redirectUriText);
        // authUrl.searchParams.append("state", state.current);
        // authUrl.searchParams.append("scope", "https://www.googleapis.com/auth/youtube");
        // authUrl.searchParams.append("code_challenge", _challenge);
        // authUrl.searchParams.append("code_challenge_method", "plain");
    //https://www.googleapis.com/auth/youtubepartner-channel-audit
        const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?`+
        `scope=https%3A//www.googleapis.com/auth/youtube%20https%3A//www.googleapis.com/auth/youtubepartner-channel-audit&`+
        `include_granted_scopes=true&`+
        `response_type=code&`+
        `state=state_parameter_passthrough_value&`+
        `redirect_uri=${encodeURIComponent(redirectUriText)}&`+
        `client_id=${clientId}`;

        const openResult = await openBrowserAsync(googleUrl);
        
        const code = await new Promise<string>((res,rej)=>{
        //HACK: will look for a better solution later 
            //TODO: Also need to check state here just in case no matter what ... 
            clearInterval(intervalHandler.current);       
            intervalHandler.current =setInterval(async ()=>{
                const code = await AsyncStorage.getItem("auth-youtube-code");
                if(code){
                    res(code);
                clearInterval(intervalHandler.current);
                }
            },1000);
        })
        
        // let respTest = await resp.text();
        // if (!resp.ok)
        //     throw new Error(respTest)
        // else {
        //     //respTest = await resp.text();
        //     console.log(respTest);
        // }
        //const auth    //: ITokenResponse =  JSON.parse(respTest);  //await resp.json();
        return await Api.User.extensions.linkSocialAccount({platform,code, challenge:_challenge});
    }, []);

    //Clean up interval if its dangling 
    useEffect(()=>{
        return ()=> clearInterval(intervalHandler.current)
    },[])

    return openAuth
}

// export const getToken = async (info: {
//     code: string
// }) => {
//     try {
        
//         // const meResp = await fetch("https://api.twitter.com/2/users/me", {
//         //     method: "GET",
//         //     headers: {
//         //         Authorization: `Bearer ${auth.access_token}`
//         //     }
//         // });

//         // if (!meResp.ok)
//         //     throw new Error(await meResp.text())

//         // const meData: {
//         //     data: TwitterMe

//         // } = await meResp.json();


//     })

// }