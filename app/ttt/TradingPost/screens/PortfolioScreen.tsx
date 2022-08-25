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
import { useMakeSecurityFields, useWatchlistItemColumns } from "./WatchlistScreen";
import { AwaitedReturn, toPercent, toPercent2, toThousands } from "../utils/misc";
import { WatchlistSection } from "../components/WatchlistSection";
import Theme from '../theme-light.json'
import { LimitedTable } from "./TableModalScreen";
import { ButtonGroup } from "../components/ButtonGroup";
import { LineHolder, PieHolder } from "../components/PieHolder";
import { AppColors } from "../constants/Colors";
import { LineChart } from "../components/LineChart";

const styles = {
    stateLabel: {
        color: Theme["color-info-800"],
        textAlign: "center"
    } as TextStyle,
    stateValue: {
        // color: AppColors.primary,
        textAlign: "center",
        marginBottom: sizes.rem0_5
    } as TextStyle,
}
type TradeReturnType = AwaitedReturn<typeof Api.User.extensions.getTrades>

export const PortfolioScreen = (props: TabScreenProps) => {

    const [watchlists, setWatchlists] = useState<AllWatchlists>()
    const [quickWatchlist, setQuickWatchlist] = useState<IWatchlistGet>()
    const toast = useToast();//const [trades, setTrades] = useState<AwaitedReturn<typeof Api.User.extensions.getTrades>>();
    const [holdings, setHoldings] = useState<AwaitedReturn<typeof Api.User.extensions.getHoldings>>();
    const [portfolio, setPortfolio] = useState<AwaitedReturn<typeof Api.User.extensions.getPortfolio>>();
    const [returns, setReturns] = useState<AwaitedReturn<typeof Api.User.extensions.getReturns>>();

    useEffect(() => {
        (async () => {
            try {
                const [lists, holdings] = await Promise.all([
                    Api.Watchlist.extensions.getAllWatchlists(),
                    Api.User.extensions.getHoldings()
                ]);
                //KEeping apart for now .. seems to have an error
                try {
                    const portfolio = await Api.User.extensions.getPortfolio({});
                    setPortfolio(portfolio);
                } catch (ex) {
                    console.error(ex);
                }

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
                //          setTrades(trades);
                setHoldings(holdings);

            }
            catch (ex: any) {
                toast.show(ex.message);
            }
        })()
    }, [])


    useEffect(() => {
        Api.User.extensions.getReturns({
            startDate: new Date("8/21/22"),
            endDate: new Date("8/22/22")
        }).then(r => setReturns(r)).catch(ex => console.error(ex))
    }, [])

    const [portPeriod, setPortPeriod] = useState("1Y")
    const { columns: watchlistItemColumns } = useWatchlistItemColumns(true)
    return <View style={[paddView]}>
        <ScrollView>
            <ElevatedSection key={"portfolio"} title="Portfolio">
                <Subsection title="Performance">
                    <View style={{ marginBottom: sizes.rem1 }}>
                        <LineHolder />
                    </View>
                    <ButtonGroup key={"period"} items={["1D", "1W", "1M", "3M", "1Y", "5Y", "Max"].map(v => ({ label: v, value: v }))} onValueChange={(v) => setPortPeriod(v)} value={portPeriod} />
                    <View style={{ borderColor: "#ccc", borderWidth: 1, backgroundColor: "#f5f5f5", padding: sizes.rem0_5 / 2 }}>
                        <View key={"returns"} style={{ flexDirection: "row" }}>
                            {[
                                { title: "Total Return", value: 0.5 },
                                { title: "Beta", value: portfolio?.beta || 0 },
                                { title: "Sharpe Ratio", value: portfolio?.sharpe || 0 }]
                                .map((item, idx) => {
                                    return <View key={"key_" + idx} style={flex}>
                                        <Text style={styles.stateLabel} >{item.title}</Text>
                                        <Text style={styles.stateValue}>{toPercent(item.value)}</Text>
                                    </View>
                                })}
                        </View>
                        <View key="exposures" style={{ flexDirection: "row" }}>
                            {[
                                { title: "Long", value: portfolio?.exposure.long || 0 },
                                { title: "Short", value: portfolio?.exposure.short || 0 },
                                { title: "Gross", value: portfolio?.exposure.gross || 0 },
                                { title: "Net", value: portfolio?.exposure.net || 0 }]
                                .map((item, idx) => {
                                    return <View key={"key_" + idx} style={flex}>
                                        <Text style={styles.stateLabel} >{item.title}</Text>
                                        <Text style={styles.stateValue}>{toPercent(item.value)}</Text>
                                    </View>
                                })}
                        </View>
                    </View>
                </Subsection>
                <Subsection key="holdings" title="Holdings">{
                    <Table
                        data={holdings}
                        columns={[
                            ...useMakeSecurityFields((item: Exclude<typeof holdings, undefined>[0]) => {
                                return Number(item.security_id)
                            }),
                            { field: "quantity", stringify: (a, b, c) => String(a) },
                            { field: "price", stringify: toThousands },
                            { field: "value", stringify: toThousands },
                            { alias: "pnl", stringify: (a, b, c) => toThousands(Number(c.value) - Number(c.cost_basis)) }
                        ]} />
                }</Subsection>
                <Subsection key="trades" title="Trades">
                    <LimitedTable
                        title="All Trades"
                        maxPage={0}
                        tableProps={{
                            keyExtractor: (item, idx) => {
                                return item ? "trade_" + idx : "empty";
                            },
                            data: (async (a, $page) => {
                                const newArr = a || [];
                                newArr.push(... (await Api.User.extensions.getTrades({ $page, settings: {} })))
                                console.log(JSON.stringify(newArr))
                                return newArr;
                            }) as DataOrQuery<TradeReturnType[0]>,
                            columns: [
                                ...useMakeSecurityFields((item: TradeReturnType[0]) => {
                                    return Number(item.security_id)
                                }),
                                { field: "date", stringify: (a, b, c) => String(a) },
                                { field: "quantity", stringify: toThousands },
                                { field: "price", stringify: toThousands }
                            ]
                        }
                        }
                    />
                </Subsection>
            </ElevatedSection>
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