import Auth from '@tradingpost/common/api/entities/static/AuthApi';
import { useCallback } from "react";
import User from '@tradingpost/common/api/entities/apis/UserApi';
import { useData } from "./lds";
import { registerDeviceForNotifications } from "./utils/notifications";

export const useAppUser = () => {
    const { value: appUser, setValue: setAppUser } = useData("currentUser");
    const { value: loginResult, setValue: setLoginResult } = useData("loginResult");
    const { value: authToken, setValue: setAuthToken } = useData("authToken");

    return {
        appUser,
        authToken,
        loginResult,
        signIn: useCallback(async (email: string, pass: string) => {
            const value = await Authentication.signIn(email, pass)
            setLoginResult(value.loginResult);
            setAppUser(value.currentUser);

            if (email !== '') {
                try {
                    await registerDeviceForNotifications();
                }
                catch (ex) {
                    console.error(ex);
                }
            }

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

