
import { getCallBackUrl } from '@tradingpost/common/api/entities/static/EntityApiBase';
import Constants, { AppOwnership } from 'expo-constants'

export const makeRedirectUrl = (platform: string) => {
    let baseUrl = AppOwnership.Expo === Constants.appOwnership ? Constants.manifest?.hostUri : "";
    return `${getCallBackUrl()}/auth/${platform}`
}