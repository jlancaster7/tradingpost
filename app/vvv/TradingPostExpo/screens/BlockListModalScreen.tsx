import React from "react"
import { List } from "../components/List"
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'
import { AllPages, TabScreenProps } from "../navigation"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Link } from "../components/Link"
import { flex, paddView, paddViewWhite } from "../style"
import { ElevatedSection, Section } from "../components/Section"
import { Header } from "../components/Headers"
import { AppColors } from "../constants/Colors"


export function LimitedBlockList<T>(props: {
    maxPage?: number,
    
    listKey: string,
    title: string,
    listProps: Omit<Parameters<typeof List>[0], "maxPage">
}) {
    const nav = useNavigation();
    return <View style={[{}]}>
        <View>
            <List {...props.listProps} listKey={props.listKey} maxPage={props.maxPage} />
        </View>
        <Link
            style={{
                marginLeft: "auto"
            }}
            onPress={() => {
                nav.navigate("BlockListModal", {
                    listProps: props.listProps as any,
                    title: props.title
                })
            }}>View All</Link>
    </View>
}

export function BlockListModalScreen<T>(props: TabScreenProps<{ title: string, listProps: Parameters<typeof List>[0] }>) {
    return (
        props.route?.params?.listProps ? 
        <View style={paddView}>
            <Section title={props.route.params.title} style={{backgroundColor: AppColors.background}}>
                <List {...props.route?.params?.listProps} />
            </Section>
        </View> : 
        <Text>Error</Text>
        )
}