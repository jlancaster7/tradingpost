import React, { useEffect, useState, useRef } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "react-native"
import { useAppUser } from "../Authentication"
import { ElevatedSection } from "../components/Section"
import { Text } from '@ui-kitten/components'
import { RootStackScreenProps } from "../navigation/pages"
import { Link } from "../components/Link"
import { Api } from '@tradingpost/common/api'
import { ButtonPanel } from "../components/ScrollWithButtons"
import { paddView, sizes } from "../style"
import { useToast } from "react-native-toast-notifications"
import { useLinkTo } from "@react-navigation/native"
import { useTwitterAuth } from "../utils/third-party/twitter";
import { getCallBackUrl } from "@tradingpost/common/api/entities/static/EntityApiBase";
import { HtmlView } from "../components/HtmlView"

const clientId = "cm9mUHBhbVUxZzcyVGJNX0xrc2E6MTpjaQ";
const platform = "twitter",
    redirectUriText = `${getCallBackUrl()}/auth/${platform}`,
    redirectUri = new URL(redirectUriText),
    authUrlText = "https://twitter.com/i/oauth2/authorize"

export const TwitterAuthWebViewScreen = (props: any) => {
    let intervalHandler = useRef<any>()
    
    console.log(props.route.params.url);

    useEffect(() => {
        (async () => {
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
                return await Api.User.extensions.linkSocialAccount({ callbackUrl: getCallBackUrl(), platform,code, challenge: props.route.params.challenge}) ;        
        })()
    },[])
    useEffect(()=>{
        return ()=> clearInterval(intervalHandler.current)
    },[])
    return <View style={paddView}>
        <HtmlView isUrl={true}>
            {props.route.params.url}
        </HtmlView>
    </View>
}