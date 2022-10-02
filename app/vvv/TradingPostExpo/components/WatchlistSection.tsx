import { useNavigation } from "@react-navigation/native"
import { Interface } from "@tradingpost/common/api"
import { IWatchlistList } from "@tradingpost/common/api/entities/interfaces"
import React, { useEffect, useState } from "react"
import { Pressable, Text } from "react-native"
import { PlusIcon } from "../images"
import { useNoteField } from "../screens/WatchlistViewerScreen"
import { sizes } from "../style"
import { AddButton } from "./AddButton"
import { ElevatedSection, Section } from "./Section"
import { ITableColumn, Table } from "./Table"


export function WatchlistSection(props: { title: string, watchlists: Interface.IWatchlistList[] | undefined, showAddButton?: boolean, shared?: boolean, hideNoteOnEmpty?: boolean }) {
    const nav = useNavigation<any>();

    const fields: ITableColumn<IWatchlistList>[] = !props.shared ?
        [{ field: "name", alias: "Name", align: "left" },
        { field: "item_count", alias: "Items" },
        { field: "saved_by_count", alias: "Saves" },
        { field: "type", alias: "Type" }] :

        [{ field: "name", alias: "Name", align: "left" },
        {
            field: "user",
            align: "left",
            alias: "Analyst",
            stringify: (user: IWatchlistList["user"], key, item) => {
                return user[0].handle
            },
        }]
    const { column, shownMap } = useNoteField(props.hideNoteOnEmpty);
    return <ElevatedSection title={props.title} button={props.showAddButton ? (p) => <AddButton height={p.height} width={p.width} onPress={() => {
        nav.navigate("WatchlistEditor")
    }} /> : undefined}>
        <Table
            noDataMessage={props.shared ? "No Shared Watchlists" : "No Watchlists"}
            columns={[
                ...fields,
                column
            ]}
            rowPressed={(item, idx) => {
                nav.navigate("WatchlistViewer", {
                    watchlistId: item.id
                })
            }}
            renderAuxItem={(info) => shownMap[info.index] ? <Text><Text style={{ fontWeight: "bold" }}>Details: </Text>{info.item.note}</Text> : null}
            data={props.watchlists}
        />
    </ElevatedSection>
}
