import { useCallback, useEffect, useState } from 'react';
import { EventRegister } from 'react-native-event-listeners'
import { LoginResult } from "@tradingpost/common/api/entities/static/AuthApi";
import { IUserGet, ISecurityList } from "@tradingpost/common/api/entities/interfaces";
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage'

//current_user
//token 
export interface LDS {
    currentUser: IUserGet | undefined,
    loginResult: LoginResult | undefined
    authToken: string | undefined,
    hasAuthed: boolean | undefined,
    firstTime: boolean | undefined,
    securities: {
        list: ISecurityList[],
        byId: Record<number, ISecurityList>,
        bySymbol: Record<string, ISecurityList>
    } | undefined
}


let lds: Partial<Record<keyof LDS, any>> = {}
let isCachedMap: Partial<Record<keyof LDS, true>> = {
    authToken: true,
    hasAuthed: true
}

let isExplirable: Partial<Record<keyof LDS, { duration: number, cachedAt?: number }>> = {
    securities: {
        duration: 4/*hours*/ * 60 * 60 * 1000
    }
}



const LDS_CACHE_KEY = "lds"
const ldsChangedEvenName = "lds_changed";

export const useData = <T extends keyof LDS>(key: T) => {
    const expireCheck = isExplirable[key]
    if (expireCheck?.cachedAt && expireCheck.duration <= (Date.now() - expireCheck.cachedAt)) {
        setValue(key, undefined);
    }

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
        setValue: useCallback(async (v: typeof value) => {
            await setValue(key, v)
        }, [key])
    }

}

export const setValue = async <T extends keyof LDS>(key: T, v: LDS[T]) => {
    lds[key] = v;
    if (isCachedMap[key]) {
        const cachedLds: Partial<LDS> = { ...lds }
        Object.keys(lds).forEach((k) => {
            if (!isCachedMap[k as keyof LDS]) {
                //console.log("DELETING KEY:" + k);
                delete cachedLds[k as keyof LDS]
            }
            else {
                //console.log("CACHING KEY" + k)
            }
        })
        await AsyncStorage.setItem(LDS_CACHE_KEY, JSON.stringify(cachedLds));
    }
    EventRegister.emit(ldsChangedEvenName, { key })
}

export const initLds = async () => {
    //load all cached values
    console.log("Initing LDS");
    const result = await AsyncStorage.getItem(LDS_CACHE_KEY);
    if (result) {
        console.log("Results" + result);
        lds = JSON.parse(result);
        Object.keys(lds).forEach((k) =>
            EventRegister.emit(ldsChangedEvenName, { k }));
    }
    return lds;
};