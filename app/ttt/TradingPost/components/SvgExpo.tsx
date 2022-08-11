import React, { PropsWithChildren } from "react";
import { Text } from 'react-native'
import { SvgProps } from "react-native-svg";

export const SvgExpo = (props: SvgProps & { children: any, onReady?: (parent: any) => void }) => {

    return <>{props.children}</>;
}