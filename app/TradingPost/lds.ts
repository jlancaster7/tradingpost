import { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native'
import { LoginResult } from './api/entities/apis/AuthApi';
import { IUserGet } from './api/entities/interfaces';

//current_user
//token
export interface LDS {
    currentUser: IUserGet | undefined,
    loginResult: LoginResult | undefined
}

const lds: Partial<Record<keyof LDS, any>> = {}
const ldsChangedEvenName = "lds_changed";

export const getData = () => {

}

export const useData = <T extends keyof LDS>(key: T) => {
    const [value, _setValue] = useState<LDS[T]>(lds[key]);
    useEffect(() => {
        const sub = DeviceEventEmitter.addListener(ldsChangedEvenName, (data) => {
            if (data.key === key)
                _setValue(lds[key])
        });
        return () => sub.remove();
    }, [key])
    return {
        value,
        setValue: useCallback((v: typeof value) =>
            DeviceEventEmitter.emit(ldsChangedEvenName, { key })
            , [key])
    }
}


export const initLds = async () => {
    //load all values
};