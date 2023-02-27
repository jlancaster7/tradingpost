import React, { ReactElement, ReactNode } from 'react'
import { View, ViewProps, ViewStyle } from 'react-native';

import { elevated, sizes, shaded } from '../style';
import { Header, Subheader } from './Headers'

interface SecitonProps {
    title: string,
    useSubHeading?: boolean,
    children?: ReactNode,
    button?: (props: { height: number, width: number }) => ReactElement,
    alt?: boolean
    style?: ViewProps["style"],
    
}

export function Section(props: SecitonProps) {
    const { title, children, useSubHeading} = props;
    return (
        <View  style={[{ backgroundColor: "white", marginBottom: sizes.rem1 }, props.style]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {Boolean(title) && (useSubHeading ? <Subheader text={title} style={{ color: props.alt ? "#434343" : undefined }} /> : <Header text={title} />)}
                {props.button && props.button({ height: sizes.rem1_5, width: sizes.rem1_5 })}
            </View>
            {children}
        </View>
    )
}

export function Subsection(props: Omit<SecitonProps, 'useSubHeading'>) {
    return <Section useSubHeading {...props} />
}

export const ElevatedSection = (props: Parameters<typeof Section>[0]) => {
    const style = [[elevated, { paddingHorizontal: sizes.rem1 }], props.style]
    return <Section {...props} style={style} />
}
export const ShadedSection = (props: Parameters<typeof Section>[0]) => {
    const style = [[shaded, { paddingHorizontal: sizes.rem1 }], props.style]
    return <Section {...props} style={style} />
}