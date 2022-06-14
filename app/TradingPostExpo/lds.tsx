import { useCallback, useEffect, useState } from 'react';
import { EventRegister } from 'react-native-event-listeners'
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
        const sub = EventRegister.addEventListener(ldsChangedEvenName, (data) => {
            if (data.key === key)
                _setValue(lds[key])
        });
        return () => { EventRegister.removeEventListener(sub as string) };
    }, [key])
    return {
        value,
        setValue: useCallback((v: typeof value) =>
            EventRegister.emit(ldsChangedEvenName, { key })
            , [key])
    }
}


export const initLds = async () => {
    //load all values
};