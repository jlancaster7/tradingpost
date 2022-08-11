import { ViewStyle } from "react-native"

export interface HtmlViewProps {
    children: string,
    style?: ViewStyle,
    isUrl?:boolean
}