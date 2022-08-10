import React, { ReactElement, ReactNode } from 'react'
import { ViewStyle } from 'react-native';
import { View } from 'react-native-ui-lib'
import { sizes } from '../style';
import { Header, Subheader } from './Headers'

interface SecitonProps {
    title: string,
    useSubHeading?: boolean,
    children?: ReactNode,
    button?: (props: { height: number, width: number }) => ReactElement,
    alt?: boolean
    style?: ViewStyle
}

export function Section(props: SecitonProps) {
    const { title, children, useSubHeading } = props;
    return (
        <View style={[{ backgroundColor: "white", marginBottom:sizes.rem1 }, props.style]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {useSubHeading ? <Subheader text={title} style={{ color: props.alt ? "#434343" : undefined }} /> : <Header text={title} />}
                {props.button && props.button({ height: sizes.rem1_5, width: sizes.rem1_5 })}
            </View>
            {children}
        </View>
    )
}

export function Subsection(props: Omit<SecitonProps, 'useSubHeading'>) {
    return <Section useSubHeading {...props} />
}