import { useCallback, useEffect, useState } from 'react';
import { EventRegister } from 'react-native-event-listeners'
import { LoginResult } from "@tradingpost/common/api/entities/static/AuthApi";
import { IUserGet } from "@tradingpost/common/api/entities/interfaces";
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage'

//current_user
//token
export interface LDS {
    currentUser: IUserGet | undefined,
    loginResult: LoginResult | undefined
    authToken: string | undefined
}

let lds: Partial<Record<keyof LDS, any>> = {}
const LDS_CACHE_KEY = "lds"
const ldsChangedEvenName = "lds_changed";

export const useData = <T extends keyof LDS>(key: T) => {
    const [value, _setValue] = useState<LDS[T]>(lds[key]);
    useEffect(() => {
        const sub = EventRegister.addEventListener(ldsChangedEvenName, (data) => {

            if (data.key === key) {
                _setValue(lds[key])
            }

        });
        return () => { EventRegister.removeEventListener(sub as string) };
    }, [key])
    return {
        value,
        setValue: useCallback(async (v: typeof value, cache?: boolean) => {
            lds[key] = v;
            if (cache) 
                await AsyncStorage.setItem(LDS_CACHE_KEY, JSON.stringify(lds));

            EventRegister.emit(ldsChangedEvenName, { key })
        }, [key])
    }
}


export const initLds = async () => {
    //load all cached values
    const result = await AsyncStorage.getItem(LDS_CACHE_KEY);
    if (result) {
        lds = JSON.parse(result);
        Object.keys(lds).forEach((k) =>
            EventRegister.emit(ldsChangedEvenName, { k }));
    }
    return lds;
};