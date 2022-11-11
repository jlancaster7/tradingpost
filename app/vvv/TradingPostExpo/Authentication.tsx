import Auth from '@tradingpost/common/api/entities/static/AuthApi';
import { useCallback, useEffect } from "react";
import User from '@tradingpost/common/api/entities/apis/UserApi';
import { useData } from "./lds";
import { useState } from 'react';
import { EventRegister } from 'react-native-event-listeners';
import { Log } from './utils/logger';


// if (email !== '') {
//     try {
//         await registerDeviceForNotifications();
//     }
//     catch (ex) {
//         console.error(ex);
//     }
// }


const loginStateChangedEventName = "LOGIN_STATE_CAHNGED";



export const useAppUser = (tracker?: string) => {

    const { value: _appUser, setValue: setAppUser } = useData("currentUser");
    const { value: _loginResult, setValue: setLoginResult } = useData("loginResult");
    const { value: _authToken, setValue: setAuthToken } = useData("authToken");
    const [toggleRefresh, setToggleRefresh] = useState(true);
    type LoginState = {
        appUser: typeof _appUser,
        loginResult: typeof _loginResult,
        authToken: typeof _authToken,
        //TODO: stop gap... but we should make this resolved on the server probably 
        setupStatus?: {
            needsSettings: boolean,
            needsAnalystSettings: boolean
        }
    };

    const createLoginState = (currentUser: typeof _appUser, loginResult: typeof _loginResult): LoginState => {
        return {
            appUser: currentUser,
            authToken: loginResult?.user_id ? loginResult.token : undefined,
            loginResult: loginResult,
            setupStatus: currentUser ? {
                needsSettings: !currentUser.settings || !Object.keys(currentUser.settings).length,
                needsAnalystSettings: Boolean(currentUser.settings?.analyst) && !currentUser.analyst_profile
            } : undefined
        }
    }

    const [loginState, setLoginState] = useState(_appUser || _loginResult ? createLoginState(_appUser, _loginResult) : undefined)

    useEffect(() => {
        if (tracker)
            console.log("CREATING WITH A TRACKER OF " + tracker);
        const sub = EventRegister.addEventListener(loginStateChangedEventName, (data) => {
            if (tracker)
                console.log("TRIGGERED TRACKER OF " + tracker);
            setLoginState(data);
        });
        return () => {
            EventRegister.removeEventListener(sub as string)
        };
    }, [tracker])

    return {
        loginState,
        forceTrigger: () => {
            if (_loginResult){
                console.log("FORCING RESULT")
                setLoginResult({ ..._loginResult });
            }
        },
        signIn: useCallback(async (email: string, pass: string) => {
            setLoginState(undefined);
            const value = await Authentication.signIn(email, pass)
            setLoginResult(value.loginResult);
            setAppUser(value.currentUser);
            if (value.loginResult.user_id)
                setAuthToken(value.loginResult.token);

            EventRegister.emit(loginStateChangedEventName, createLoginState(value.currentUser, value.loginResult))

        }, []),
        signOut: useCallback(() => {
            Auth.signOut();
            setAuthToken(undefined);
            setLoginResult(undefined);
            setAppUser(undefined);
            setLoginState(undefined);
            EventRegister.emit(loginStateChangedEventName, undefined);
        }, [])
    }
}

export const Authentication = {
    signIn: async (email: string, pass: string) => {
        const result = await Auth.login(email, pass);
        return {
            loginResult: result,
            currentUser: result.user_id ? await User.get(result.user_id) : undefined
        }
    }
}

