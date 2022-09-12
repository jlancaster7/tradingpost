import React, { Children, cloneElement, PropsWithChildren } from "react";
import { createElement, Text } from 'react-native'
import { SvgProps } from "react-native-svg";

export const SvgExpo = (props: SvgProps & { children: any, onReady?: (parent: any) => void }) => {
    const propsCopy = { ...props, children: undefined }
    return <>{
        Children.map((props.children as React.FC<SvgProps>), (child) => {
            const TP = (child as any).type;
            return <TP {...propsCopy} />
        })
    }</>;
}