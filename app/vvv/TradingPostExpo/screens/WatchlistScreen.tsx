import { Api } from "@tradingpost/common/api";
import { AllWatchlists, IWatchlistGet, IWatchlistList } from "@tradingpost/common/api/entities/interfaces";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, TextStyle, View } from "react-native";
import { AddButton, EditButton } from "../components/AddButton";
import { Icon, Text } from '@ui-kitten/components'
import { ElevatedSection, Section, Subsection } from "../components/Section";
import { Table } from "../components/Table";
import { DataOrQuery } from '../components/List'
//import { DashScreenProps, TabScreenProps } from "../navigation";
import { flex, paddView, sizes } from "../style";
import { useToast } from "react-native-toast-notifications";
import { useMakeSecurityFields, useWatchlistItemColumns } from "./WatchlistViewerScreen";
import { AwaitedReturn, toPercent, toPercent2, toThousands } from "../utils/misc";
import { WatchlistSection } from "../components/WatchlistSection";
import Theme from '../theme-light.json'
import { FlatList } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";

export const WatchlistScreen = (props: any) => {

    const [watchlists, setWatchlists] = useState<AllWatchlists>()
    const [quickWatchlist, setQuickWatchlist] = useState<IWatchlistGet>()
    const toast = useToast();//const [trades, setTrades] = useState<AwaitedReturn<typeof Api.User.extensions.getTrades>>();
    const [focus, setFocus] = useState(false);
    const scrollRef = useRef<FlatList>(null);
    useFocusEffect(useCallback(()=> {
        
        (async () => {
            try {
                const lists = await Api.Watchlist.extensions.getAllWatchlists();

                if (lists.quick.id) {
                    setQuickWatchlist(await Api.Watchlist.get(lists.quick.id));
                }
                else {
                    setQuickWatchlist({
                        id: 0,
                        items: [],
                        name: "",
                        saved_by_count: 0,
                        type: "primary",
                        user: [],
                        is_saved: false
                    })
                }
                setFocus((f) => !f)
                setWatchlists(lists);
                console.log('useFocusEffect')

            }
            catch (ex: any) {
                toast.show(ex.message);
            }
        })()
        
    },[]))

    useEffect(() => {
        (async () => {

            
        })()
    }, [])

    const { columns: watchlistItemColumns } = useWatchlistItemColumns(true)
    return <View style={[paddView]}>
        <FlatList
            listKey="top_level_watchlist"
            data={[
            <ElevatedSection key={"quick_watch"} title="Quick Watch"
                button={(_p) => {
                    return watchlists?.quick.id ?
                        <EditButton {..._p} onPress={() => {
                            props.navigation.navigate("WatchlistEditor", {
                                watchlistId: watchlists?.quick.id
                            })
                        }} /> :
                        <AddButton {..._p} onPress={() => {
                            props.navigation.navigate("WatchlistEditor", {
                                watchlistId: -1
                            })
                        }} />
                }}
            >
                <Table
                    datasetKey={`${focus}`}
                    listKey="quick_watch_list"
                    noDataMessage="No Companies"
                    columns={watchlistItemColumns}
                    data={quickWatchlist?.items}
                />
            </ElevatedSection>,
            <WatchlistSection
                title="My Watchlists"
                key={"my_watchlist"}
                watchlists={watchlists?.created}
                showAddButton
                hideNoteOnEmpty
            />,
            <WatchlistSection
                title="Shared Watchlists"
                key={"shared_watchlist"}
                watchlists={watchlists?.saved}
                shared
            />
            ]}
            renderItem={(info) => {
                return info.item;
            }}
            ref={scrollRef} contentContainerStyle={[{ paddingTop: 20}]} nestedScrollEnabled         

            >
        </FlatList>
    </View >

}