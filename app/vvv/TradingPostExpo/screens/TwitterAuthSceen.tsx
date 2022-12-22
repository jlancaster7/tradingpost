import React, { useEffect, useState, useRef, useCallback } from "react"
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
import { useLinkTo, useNavigation } from "@react-navigation/native"
import { useTwitterAuth } from "../utils/third-party/twitter";
import { getCallBackUrl } from "@tradingpost/common/api/entities/static/EntityApiBase";
import { HtmlView } from "../components/HtmlView"
import * as tURL from "url";
import uuid from 'react-native-uuid';

const clientId = "cm9mUHBhbVUxZzcyVGJNX0xrc2E6MTpjaQ";
const platform = "twitter",
    redirectUriText = `${getCallBackUrl()}/auth/${platform}`,
    redirectUri = new URL(redirectUriText),
    authUrlText = "https://twitter.com/i/oauth2/authorize"

export const TwitterAuthWebViewScreen = (props?: any) => {
    let intervalHandler = useRef<any>()
    const { loginState, signIn, signOut } = useAppUser()
    const toast = useToast();
    const nav = useNavigation()
    const linkTo = useLinkTo<any>();
    const state = useRef<string>(uuid.v4() as string);

    
    const _challenge = Math.random().toString().substring(2, 10);
    const authUrl = new URL(authUrlText);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUriText);
    authUrl.searchParams.append("state", state.current);
    authUrl.searchParams.append("scope", "users.read tweet.read offline.access");
    authUrl.searchParams.append("code_challenge", _challenge);
    authUrl.searchParams.append("code_challenge_method", "plain");

    
    return <View style={paddView}>
        <HtmlView isUrl={true} allowFileAccess={true} 
            onNavigationStateChange={(e: any) => {
                if (e.url !== undefined) {
                    const url = tURL.parse(e.url, true);
                    const baseURL = 'https://' + (url.hostname || '') + (url.pathname || '') 
                    if (baseURL === redirectUriText && url.path) {
                        //AsyncStorage.setItem(`auth-${platform}-code`, String(url.query.code));
                        const code = String(url.query.code);
                        Api.User.extensions.linkSocialAccount({ callbackUrl: getCallBackUrl(), platform, code, challenge: _challenge})
                            .then((handle) => {
                                if (props?.route?.params) {
                                    toast.show(`You've successfully claimed your Twitter account!`)
                                    linkTo('/create/addclaims')
                                } else nav.navigate('AccountInformation', {newTwitterHandle: handle})
                            })
                            .catch((err) => {
                                toast.show('This Twitter account has already been claimed! If you think this is a mistake, please reach out to help@tradingpostapp.com.')
                                if (props?.route?.params) linkTo('/create/addclaims')
                                else nav.navigate('AccountInformation')
                            })
                    }
                }
            }} 
        >
            {String(authUrl)}
        </HtmlView>
    </View>
}