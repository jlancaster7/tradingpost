import { Api } from "@tradingpost/common/api";
import { AllWatchlists, IWatchlistGet, IWatchlistList } from "@tradingpost/common/api/entities/interfaces";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, TextStyle, View } from "react-native";
import { AddButton, EditButton } from "../components/AddButton";
import { Avatar, Icon, Text } from '@ui-kitten/components'
import { ElevatedSection, Section, Subsection } from "../components/Section";
import { WatchlistItemRenderItem } from '../components/WatchlistItemRenderItem'
import { Table } from "../components/Table";
import { DataOrQuery } from '../components/List'
//import { DashScreenProps, TabScreenProps } from "../navigation";
import { flex, fonts, paddView, sizes } from "../style";
import { useToast } from "react-native-toast-notifications";
import { NoteEditor, SecPressable, useMakeSecurityFields, useWatchlistItemColumns } from "./WatchlistViewerScreen";
import { AwaitedReturn, toDollarsAndCents, toPercent, toPercent2, toThousands } from "../utils/misc";
import { WatchlistSection } from "../components/WatchlistSection";
import Theme from '../theme-light.json'
import { FlatList } from "react-native-gesture-handler";
import { List } from "../components/List"
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSecuritiesList } from "../SecurityList";
import { Header } from "../components/Headers";
import { AppColors } from "../constants/Colors";
import { SwitchField } from "../components/SwitchField";

export const WatchlistScreen = (props: any) => {
    const nav = useNavigation();
    const [watchlists, setWatchlists] = useState<AllWatchlists>()
    const [shownMap, setShownMap] = useState<Record<string, boolean>>({})
    const [quickWatchlist, setQuickWatchlist] = useState<IWatchlistGet>()
    const [notificationToggle, setNotificationToggle] = useState<boolean>(false);
    const toast = useToast();//const [trades, setTrades] = useState<AwaitedReturn<typeof Api.User.extensions.getTrades>>();
    const [focus, setFocus] = useState(false);
    const scrollRef = useRef<FlatList>(null);
    useFocusEffect(useCallback(()=> {
        
        (async () => {
            try {
                const lists = await Api.Watchlist.extensions.getAllWatchlists();
                if (lists.quick.id) {
                    const quickWatchlist = await Api.Watchlist.get(lists.quick.id) 
                    setQuickWatchlist(quickWatchlist);
                    setNotificationToggle(quickWatchlist.is_notification)
                }
                else {
                    setQuickWatchlist({
                        id: 0,
                        items: [],
                        name: "",
                        saved_by_count: 0,
                        type: "primary",
                        user: [],
                        is_saved: false,
                        is_notification: false
                    })
                }
                
                setWatchlists(lists);

            }
            catch (ex: any) {
                toast.show(ex.message);
            }
        })()
        
    },[]))

    const { columns: watchlistItemColumns } = useWatchlistItemColumns(true)
    const { securities: { bySymbol, byId } } = useSecuritiesList();
    const hideEmptyNote = false;
    return <View style={[paddView]}>
        <FlatList
            listKey="top_level_watchlist"
            data={[
                <View key={'quickwatchlist'}>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Header key={"quick_watch"} text="Quick Watch" style={{flex: 1}}/>
                        <View style={{marginHorizontal: 6, justifyContent: 'center'}}> 
                            {  
                                watchlists?.quick.id ?
                                    <EditButton
                                        height={30}
                                        width={30} 
                                        onPress={() => {
                                            nav.navigate("WatchlistEditor", {
                                                watchlistId: watchlists?.quick.id
                                            })
                                    }} /> :
                                    <AddButton
                                        height={30}
                                        width={30} 
                                        onPress={() => {
                                            nav.navigate("WatchlistEditor", {
                                                watchlistId: -1
                                            })
                                    }} />
                                }
                        </View>
                    </View>
                
                <List
                    datasetKey={`quickwatch_num_${quickWatchlist?.items.length}`}
                    listKey={`quickwatch_list${quickWatchlist?.items.length}`}
                    loadingMessage={" "}
                    noDataMessage={" "}
                    loadingItem={undefined}
                    numColumns={2}
                    data={quickWatchlist?.items}
                    renderItem={(item) => {                        
                        return (
                            <WatchlistItemRenderItem
                                item={item}
                                bySymbol={bySymbol}
                                byId={byId}
                                hideEmptyNote={hideEmptyNote}
                                setShownMap={setShownMap}
                                shownMap={shownMap}
                                watchlist={quickWatchlist}
                                    />
                        )
                    }}
                />
                {quickWatchlist ? <SwitchField
                    label='Enable Notifications'
                    checked={notificationToggle}
                    onChange={async () => {
                        if (!quickWatchlist?.id ) return;
                        Api.Watchlist.extensions.toggleNotification({
                            id: quickWatchlist?.id,
                            is_notification: !quickWatchlist?.is_notification
                        })
                        setNotificationToggle(!notificationToggle);
                    }}
                    viewStyle={{
                        flexDirection: 'row-reverse', justifyContent: 'space-between', paddingHorizontal: sizes.rem1_5, paddingTop: sizes.rem0_5, paddingBottom: sizes.rem0_5, backgroundColor: AppColors.background
                    }}
                    toggleStyle={{}}
                    textStyle={{alignSelf: 'center'}}>
                </SwitchField> : undefined}
            </View>,
            <WatchlistSection
                datasetKey={`my_watchlist_${watchlists?.created.length}`}
                title="My Watchlists"
                key={`my_watchlist${watchlists?.created.length}`}
                watchlists={watchlists?.created}
                showAddButton
                hideNoteOnEmpty
            />,
            <WatchlistSection
                datasetKey={`shared_watchlist_${watchlists?.saved.length}`}
                title="Shared Watchlists"
                key={`shared_watchlist${watchlists?.saved.length}`}
                watchlists={watchlists?.saved}
                shared
            />
            ]}
            renderItem={(info) => {
                return info.item;
            }}
            ref={scrollRef} contentContainerStyle={[{ paddingTop: 0}]} nestedScrollEnabled         

            >
        </FlatList>
    </View >

}