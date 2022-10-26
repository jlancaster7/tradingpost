
import Constants, { AppOwnership } from 'expo-constants'

export const makeRedirectUrl = (platform: string) => {
    let baseUrl = AppOwnership.Expo === Constants.appOwnership ? Constants.manifest?.hostUri : "";
    return `https://m.tradinpostapp.com/auth/${platform}`
}