import {ExpoConfig, ConfigContext} from '@expo/config';
import {networkInterfaces} from 'os'

export default ({config}: ConfigContext): ExpoConfig => {
    // const localIp = Object.values(require('os')
    //     .networkInterfaces())
    //     .reduce((r, list) =>
    //         r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), []).pop();
    const localIp = "http://192.168.0.6:8080";

    return {
        ...config,
        extra: {
            localIp: localIp
        }
    }
};