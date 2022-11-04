import Auth from '@tradingpost/common/api/entities/static/AuthApi';
import { useCallback } from "react";
import User from '@tradingpost/common/api/entities/apis/UserApi';
import { useData } from "./lds";
import { useState } from 'react';


// if (email !== '') {
//     try {
//         await registerDeviceForNotifications();
//     }
//     catch (ex) {
//         console.error(ex);
//     }
// }

export const useAppUser = () => {

    const { value: appUser, setValue: setAppUser } = useData("currentUser");
    const { value: loginResult, setValue: setLoginResult } = useData("loginResult");
    const { value: authToken, setValue: setAuthToken } = useData("authToken");



    return {
        appUser,
        authToken,
        loginResult,
        //TODO: stop gap... but we should make this resolved on the server probably 
        userState: appUser ? {
            needsSettings: !appUser.settings || !Object.keys(appUser.settings).length,
            needsAnalystSettings: appUser.settings?.analyst && !appUser.analyst_profile
        } : undefined,
        signIn: useCallback(async (email: string, pass: string) => {

            const value = await Authentication.signIn(email, pass)
            setLoginResult(value.loginResult);
            setAppUser(value.currentUser);
            if (value.loginResult.user_id)
                setAuthToken(value.loginResult.token);



        }, []),
        signOut: useCallback(() => {
            Auth.signOut();
            setAuthToken(undefined);
            setLoginResult(undefined);
            setAppUser(undefined);
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

