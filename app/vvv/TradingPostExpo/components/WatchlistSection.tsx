import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { Interface } from "@tradingpost/common/api"
import { IWatchlistList } from "@tradingpost/common/api/entities/interfaces"
import React, { useCallback, useEffect, useState } from "react"
import { Pressable, Text, View } from "react-native"
import { AppColors } from "../constants/Colors"
import { PlusIcon } from "../images"
import { useNoteField } from "../screens/WatchlistViewerScreen"
import { fonts, row, sizes } from "../style"
import { AddButton } from "./AddButton"
import { List } from "./List"
import { ElevatedSection, Section } from "./Section"
import { ITableColumn, Table } from "./Table"


export function WatchlistSection(props: { title: string, watchlists: Interface.IWatchlistList[] | undefined, showAddButton?: boolean, shared?: boolean, hideNoteOnEmpty?: boolean, datasetKey?: string }) {
    const nav = useNavigation<any>();
    const [focus, setFocus] = useState(false);
    useFocusEffect(useCallback(()=> {
        setFocus((f) => !f)
    },[]))
    const fields: ITableColumn<IWatchlistList>[] = !props.shared ?
        [{ field: "name", alias: "Name", align: "left" },
        { field: "item_count", alias: "Items" },
        { field: "saved_by_count", alias: "Saves" },
        { field: "type", alias: "Type" }] :

        [{ field: "name", alias: "Name", align: "left" },
        {field: "user", align: "left", alias: "Analyst", stringify: (user: IWatchlistList["user"], key, item) => {return user[0].handle}}]
    const { column, shownMap } = useNoteField(props.hideNoteOnEmpty);
    return <Section title={props.title} style={{backgroundColor: AppColors.background}} button={props.showAddButton ? (p) => <AddButton height={p.height} width={p.width} onPress={() => {
        nav.navigate("WatchlistEditor")
    }} /> : undefined}>
        <List 
            datasetKey={`${props.datasetKey ? props.datasetKey : props.watchlists?.length}`}
            listKey={props.title}
            loadingMessage={" "}
            noDataMessage={" "}
            loadingItem={undefined}
            numColumns={1}
            data={props.watchlists}
            ListHeaderComponent={() => {
                return <View key={"table_header"} style={{marginHorizontal: (sizes.rem1_5 / 4) + 7, paddingHorizontal: sizes.rem0_5, marginBottom: sizes.rem1 / 2}}>
                <View style={[row]}>
                    {fields.map((c, i) => {
                        return <Text key={`header_${i}`} numberOfLines={1} style={{flex: 1, textAlign: 'center', fontSize: fonts.small, color: '#9D9D9D'}} >{c.alias}</Text>
                    })}
                </View>
            </View>
            }}
            renderItem={(item)=> {
                return (
                    <ElevatedSection title="" style={{flex: 1, marginBottom: sizes.rem1_5 / 2, paddingVertical: sizes.rem0_5}}>
                        <Pressable
                            onPress={() => {
                                nav.navigate("WatchlistViewer", {
                                    watchlistId: item.item.id
                                })
                        }}>
                            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around'}}>
                                {
                                fields.map((c, i) => { 
                                    return (
                                        <Text style={{flex: 1, textAlign: 'center'}}> 
                                            {c.field ? 
                                                (c.field === 'user' ? item.item[c.field][0].handle : 
                                                    (c.field === 'type' ? item.item[c.field].slice(0,1).toUpperCase() + item.item[c.field].slice(1) : item.item[c.field])) : 
                                                ''} 
                                        </Text>
                                        )
                                        }
                                    )
                                }
                            </View>
                        </Pressable>
                    </ElevatedSection>

                )
            }}
        
        />
        {/*<Table
            listKey={props.title}
            datasetKey={`${focus}`}
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
        />*/}
    </Section>
}
