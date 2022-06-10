import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { View, Image } from "react-native";
import { SvgProps } from "react-native-svg";


export const SvgExpo = (props: SvgProps & { onReady: (parent: any) => void }) => {
    const url = (props.children as any).type;


    const lastRef = useRef("");;
    const [svgData, setSvgData] = useState("");
    useEffect(() => {
        lastRef.current = url;
        fetch(url, {}).then((data) => {
            if (data.ok) {
                data.text().then((result) => {
                    if (lastRef.current === url)
                        setSvgData(result);
                });
            }
            else throw data.statusText;
        }).catch(ex => console.log(ex));
    }), [url]
    //hacky but gotta convert 
    return <View style={props.style}>
        <div style={{ height: "100%", width: "100%", justifyContent: "center", alignContent: "center", alignItems: "center" }} dangerouslySetInnerHTML={{ __html: svgData }} />
    </View>
}