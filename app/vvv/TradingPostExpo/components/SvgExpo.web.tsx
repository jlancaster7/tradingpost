import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { View, Image } from "react-native";
import { SvgProps } from "react-native-svg";


export const SvgExpo = (props: SvgProps & { onReady?: (parent: any) => void }) => {
    const url = (props.children as any).type;
    const lastRef = useRef("");;
    const onReadyRef = useRef(props.onReady);
    onReadyRef.current = props.onReady;
    const divRef = useRef<HTMLDivElement>(null);

    const [svgData, setSvgData] = useState("");
    useEffect(() => {


        lastRef.current = url;
        fetch(url, {}).then((data) => {
            if (data.ok) {
                data.text().then((result) => {
                    if (lastRef.current === url)
                        setSvgData(result);
                    // //hacky right now ... will fix later 

                    setTimeout(() => {
                        if (onReadyRef.current)
                            onReadyRef.current(divRef.current)
                    }, 222)
                });
            }
            else throw data.statusText;
        }).catch(ex => console.log(ex));


    }), [url]



    //hacky but gotta convert 
    return <View style={props.style}>
        <div ref={divRef} style={{ height: "100%", width: "100%", justifyContent: "center", alignContent: "center", alignItems: "center", display:"flex" }} dangerouslySetInnerHTML={{ __html: svgData }} />
    </View>
}