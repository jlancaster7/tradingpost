import React from "react"
import { View, Text } from "react-native"
import { HtmlViewProps } from "./HtmlView.interface"

export const HtmlView = (props: HtmlViewProps) => {
    return <View style={props.style}><iframe
        //marginwidth="0"
        //marginheight="0"
        //hspace="0"
        //vspace="0"
        //frameborder="0"
        name="_MYFIRAME" scrolling="no"
        src={props.isUrl ? props.children : undefined}
        srcDoc={!props.isUrl ? props.children : undefined}
        style={{ position: "absolute", top: 0, bottom: 0, height: "100%", width: "100%", borderWidth: 0 }} />
    </View>
}