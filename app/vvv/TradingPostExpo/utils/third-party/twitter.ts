import AsyncStorage from "@react-native-async-storage/async-storage";
import { Api } from "@tradingpost/common/api";
import { openBrowserAsync, WebBrowserResultType } from "expo-web-browser";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Linking } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import uuid from 'react-native-uuid';
import { initLds } from "../../lds";
//TODO: SHould put this all in the app later as a generate link 
const clientId = "cm9mUHBhbVUxZzcyVGJNX0xrc2E6MTpjaQ";
const platform = "twitter",
    redirectUriText = `https://m.tradingpostapp.com/auth/${platform}`,
    redirectUri = new URL(redirectUriText),
    authUrlText = "https://twitter.com/i/oauth2/authorize"
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

export function useTwitterAuth() {
    const state = useRef<string>(uuid.v4() as string);
    let intervalHandler = useRef<any>()
    
    const openAuth = useCallback(async () => {
        await AsyncStorage.removeItem("auth-twitter-code");
        const _challenge = Math.random().toString().substring(2, 10);
        const authUrl = new URL(authUrlText);
        authUrl.searchParams.append("response_type", "code");
        authUrl.searchParams.append("client_id", clientId);
        authUrl.searchParams.append("redirect_uri", redirectUriText);
        authUrl.searchParams.append("state", state.current);
        authUrl.searchParams.append("scope", "users.read tweet.read offline.access");
        authUrl.searchParams.append("code_challenge", _challenge);
        authUrl.searchParams.append("code_challenge_method", "plain");
        console.log("OPENING BRWOSER")
        const openResult = await openBrowserAsync(authUrl.toString());
        
        const code = await new Promise<string>((res,rej)=>{
        //HACK: will look for a better solution later 
            //TODO: Also need to check state here just in case no matter what ... 
            clearInterval(intervalHandler.current);       
            intervalHandler.current =setInterval(async ()=>{
                const code = await AsyncStorage.getItem("auth-twitter-code");
                console.log("########## LOOKING FOR THE CODE ##########");
                if(code){{
                    res(code);
                    console.log("########## I FOUND THE CODE ##########");
                }
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
        return  await Api.User.extensions.linkSocialAccount({platform,code, challenge:_challenge}) ;        
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