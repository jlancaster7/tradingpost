import { Api } from "@tradingpost/common/api";
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
import { useSecuritiesList } from "../SecurityList";
import { OverlappingIconList } from "./OverlappingIconList";
import { Avatar, Icon } from "@ui-kitten/components";



export function WatchlistSection(props: { title: string, watchlists: Interface.IWatchlistList[] | undefined, showAddButton?: boolean, shared?: boolean, hideNoteOnEmpty?: boolean, datasetKey?: string }) {
    const nav = useNavigation<any>();
    const {title, watchlists, shared} = props
    const [watchlistListData, setWatchlistListData] = useState<{id: number,name: string,  logoUriList: string[], type: string, isNotification: boolean, userHandle: string, userImageUri: string}[]>([])
    const { securities: { bySymbol, byId } } = useSecuritiesList();

    useEffect(() => {
        (async () => {
            if (watchlists && watchlists.length) {
                const tempList: any[] = [];
                for (let w of watchlists) {
                    const watchlist = await Api.Watchlist.get(w.id)
                    const itemList = watchlist.items.filter(a => bySymbol[a.symbol] !== undefined)
                    
                    tempList.push({
                        id: w.id,
                        name: w.name,
                        logoUriList: itemList.map(a => bySymbol[a.symbol].logo_url),
                        type: w.type,
                        isNotification: watchlist.is_notification,
                        userHandle: w.user[0].handle,
                        userImageUri: w.user[0].profile_url
                    })
                }
                setWatchlistListData(tempList)
            }
            
        })()
    }, [])



    const { column, shownMap } = useNoteField(props.hideNoteOnEmpty);
    return <Section title={props.title} style={{backgroundColor: AppColors.background}} button={props.showAddButton ? (p) => <View style={{marginHorizontal: 6}}><AddButton height={30} width={30} onPress={() => {
        nav.navigate("WatchlistEditor")
    }} /></View> : undefined}>
        <List 
            datasetKey={`${props.datasetKey ? props.datasetKey : watchlistListData.length}`}
            listKey={props.title}
            loadingMessage={" "}
            noDataMessage={" "}
            loadingItem={undefined}
            numColumns={1}
            data={watchlistListData}
            renderItem={(item)=> {
                return (
                    <ElevatedSection title="" style={{flex: 1, marginBottom: sizes.rem1_5 / 2, paddingVertical: sizes.rem0_5}}>
                        <Pressable
                            onPress={() => {
                                nav.navigate("WatchlistViewer", {
                                    watchlistId: item.item.id
                                })
                        }}>
                            {shared ? 
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                                    
                                    <Text style={{width: '33%', textAlign: 'center'}}>{item.item.name}</Text>
                                    <OverlappingIconList viewStyle={{width: '33%', justifyContent: 'center'}} maxIcons={5} iconUriList={item.item.logoUriList} />
                                    <View style={{width: '33%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                        <Avatar
                                            style={ {borderWidth: 1, borderColor: '#ccc'}}
                                            resizeMode={'cover'}
                                            size={'tiny'}
                                            shape="round"
                                            source={{uri: item.item.userImageUri}}
                                            />
                                        <Text style={{marginLeft: sizes.rem0_5,textAlign: 'center'}}>{item.item.userHandle}</Text>
                                    </View>
                                </View> : 
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                                    <Text style={{width: '33.33%', textAlign: 'center'}}>{item.item.name}</Text>
                                    <OverlappingIconList viewStyle={{width: '33.33%', justifyContent: 'center'}} maxIcons={5} iconUriList={item.item.logoUriList} />
                                    <View style={{width: `${33.33}%`, alignItems: 'center'}}>
                                        {item.item.type === 'public' ?  
                                            <Icon 
                                                fill={"green"}
                                                height={24}
                                                width={24}
                                                name="unlock-outline" style={{
                                                    height: 24,
                                                    width: 24
                                                }}/> :
                                            <Icon 
                                                fill={"red"}
                                                height={24}
                                                width={24}
                                                name="lock-outline" style={{
                                                    height: 24,
                                                    width: 24
                                                }}/>
                                            }
                                    </View>
                                    
                                </View>}
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
