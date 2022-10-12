import React from "react"
import { View, Text } from "react-native"
import { HtmlViewProps } from "./HtmlView.interface"
import { WebView } from 'react-native-webview'

export const HtmlView = (props: HtmlViewProps) => {
    return <WebView style={[props.style, {minHeight: 1, opacity: 0.99}]} source={props.isUrl ? { uri: props.children } : { html: props.children }} />
}