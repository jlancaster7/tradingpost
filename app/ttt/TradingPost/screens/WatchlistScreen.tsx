import { Api } from "@tradingpost/common/api";
import { AllWatchlists, IWatchlistGet, IWatchlistList } from "@tradingpost/common/api/entities/interfaces";
import React, { useEffect, useState } from "react";
import { ScrollView, TextStyle, View } from "react-native";
import { AddButton, EditButton } from "../components/AddButton";
import { Icon, Text } from '@ui-kitten/components'
import { ElevatedSection, Section, Subsection } from "../components/Section";
import { Table } from "../components/Table";
import { DataOrQuery } from '../components/List'
import { DashScreenProps, TabScreenProps } from "../navigation";
import { flex, paddView, sizes } from "../style";
import { useToast } from "react-native-toast-notifications";
import { useMakeSecurityFields, useWatchlistItemColumns } from "./WatchlistViewerScreen";
import { AwaitedReturn, toPercent, toPercent2, toThousands } from "../utils/misc";
import { WatchlistSection } from "../components/WatchlistSection";
import Theme from '../theme-light.json'

export const WatchlistScreen = (props: TabScreenProps) => {

    const [watchlists, setWatchlists] = useState<AllWatchlists>()
    const [quickWatchlist, setQuickWatchlist] = useState<IWatchlistGet>()
    const toast = useToast();//const [trades, setTrades] = useState<AwaitedReturn<typeof Api.User.extensions.getTrades>>();

    useEffect(() => {
        (async () => {
            try {
                const lists = await Api.Watchlist.extensions.getAllWatchlists();

                if (lists.quick.id) {
                    setQuickWatchlist(await Api.Watchlist.get(lists.quick.id));
                }
                else
                    setQuickWatchlist({
                        id: 0,
                        items: [],
                        name: "",
                        saved_by_count: 0,
                        type: "primary",
                        user: [],
                        is_saved: false
                    })
                setWatchlists(lists);
                

            }
            catch (ex: any) {
                toast.show(ex.message);
            }
        })()
    }, [])

    const { columns: watchlistItemColumns } = useWatchlistItemColumns(true)
    return <View style={[paddView]}>
        <ScrollView>
            
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
                    noDataMessage="No Companies"
                    columns={watchlistItemColumns}
                    data={quickWatchlist?.items}
                />
            </ElevatedSection>
            <WatchlistSection
                title="My Watchlists"
                key={"my_watchlist"}
                watchlists={watchlists?.created}
                showAddButton
                hideNoteOnEmpty
            />
            <WatchlistSection
                title="Shared Watchlists"
                key={"shared_watchlist"}
                watchlists={watchlists?.saved}
                shared
            />
            {/* <ElevatedSection key={"saved_watchlists"} title="Saved Watchlists">
                <Table
                    noDataMessage="No saved watchlists"
                    data={watchlists?.saved}
                    rowPressed={(info) => {
                        props.navigation.navigate("Watchlist", {
                            watchlistId: info.id
                        })
                    }}
                    columns={[
                        
                        
                    ]}

                />
            </ElevatedSection> */}
        </ScrollView>
    </View >

}