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
import { WatchlistSectionListItem } from "./WatchlistSectionListItem";
import { LimitedBlockList } from "../screens/BlockListModalScreen";



export function WatchlistLimitedPublicSection(props: { title: string, watchlists: Interface.IWatchlistList[] | undefined, showAddButton?: boolean, shared?: boolean, hideNoteOnEmpty?: boolean, datasetKey?: string }) {
    const nav = useNavigation<any>();
    const {title, watchlists, shared, showAddButton, datasetKey, hideNoteOnEmpty} = props
    //const [watchlistListData, setWatchlistListData] = useState<{id: number,name: string,  logoUriList: string[], type: string, isNotification: boolean, userHandle: string, userImageUri: string}[]>([])
    const { securities: { bySymbol, byId } } = useSecuritiesList();
/*
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
*/


    const { column, shownMap } = useNoteField(hideNoteOnEmpty);
    return <Section title={title} style={{backgroundColor: AppColors.background}} button={showAddButton ? (p) => <View style={{marginHorizontal: 6}}><AddButton height={30} width={30} onPress={() => {
        nav.navigate("WatchlistEditor")
    }} /></View> : undefined}>
        <LimitedBlockList
            listKey={title}
            key={`${title}_watchlist_table`}
            maxPage={0}
            title={title}
            listProps={{
                loadingMessage: " ",
                noDataMessage: " ",
                loadingItem: undefined,
                numColumns: 1,
                datasetKey: `${title}_watchlist_table_dataset`,
                data: async (a, $page, $limit) => {
                    const newArr = a || [];
                    (await Api.Watchlist.extensions.getPublicWatchlists({page: $page, limit: 5})).forEach((item, index) => {
                        newArr.push({
                            ...item, 
                            iconUriList: item.symbolList.filter(a => bySymbol[a]).map(a => bySymbol[a].logo_url)})
                    })
                    return newArr;
                },
                renderItem: (item: any)=> {
                    if (item.item) {
                        return <WatchlistSectionListItem id={item.item.id} 
                                                  shared={shared || false}
                                                  name={item.item.name} 
                                                  logoUriList={item.item.iconUriList} 
                                                  type={item.item.type} 
                                                  userHandle={item.item.userHandle} 
                                                  userImageUri={item.item.userImageUri}
                                                  />
                        }
                    else { 
                        return <View></View>
                    }
                }
            }}
            
        
        />
    </Section>
}
