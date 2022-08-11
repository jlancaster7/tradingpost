import React from "react"
import { Table } from "../components/Table"
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'
import { AllPages, TabScreenProps } from "../navigation"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Link } from "../components/Link"
import { flex, paddView, paddViewWhite } from "../style"
import { ElevatedSection } from "../components/Section"


export function LimitedTable<T>(props: {
    maxPage: number,
    title: string,
    tableProps: Omit<Parameters<typeof Table<T>>[0], "maxPage">
}) {
    const nav = useNavigation<NavigationProp<AllPages>>();
    return <View style={[{ height: "100%" }]}>
        <View>
            <Table {...props.tableProps} maxPage={props.maxPage} />
        </View>
        <Link
            style={{
                marginLeft: "auto"
            }}
            onPress={() => {
                nav.navigate("TableModal", {
                    tableProps: props.tableProps as any,
                    title: props.title
                })
            }}>View All</Link>
    </View>
}

export function TableModalScreen<T>(props: TabScreenProps<{ title: string, tableProps: Parameters<typeof Table<T>>[0] }>) {
    return props.route?.params?.tableProps ? <View style={paddView}><ElevatedSection title={props.route.params.title} ><Table {...props.route?.params?.tableProps} /></ElevatedSection></View> : <Text>Error</Text>
}