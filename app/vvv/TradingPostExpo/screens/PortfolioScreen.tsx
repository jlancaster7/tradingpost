import { Api } from "@tradingpost/common/api";
import { AllWatchlists, IWatchlistGet, IWatchlistList } from "@tradingpost/common/api/entities/interfaces";
import React, { useEffect, useState } from "react";
import { Animated, ScrollView, TextStyle, View } from "react-native";
import { AddButton, EditButton } from "../components/AddButton";
import { Icon, Text } from '@ui-kitten/components'
import { ElevatedSection, Section, Subsection } from "../components/Section";
import { Table } from "../components/Table";
import { DataOrQuery } from '../components/List'

import { flex, fonts, paddView, sizes } from "../style";
import { useToast } from "react-native-toast-notifications";
import { useMakeSecurityFields, useWatchlistItemColumns } from "./WatchlistViewerScreen";
import { AwaitedReturn, toPercent, toPercent2, toThousands, toDollarsAndCents, toDollars, toNumber2, toNumber1 } from "../utils/misc";
import { WatchlistSection } from "../components/WatchlistSection";
import Theme from '../theme-light.json'
import { LimitedTable } from "./TableModalScreen";
import { ButtonGroup } from "../components/ButtonGroup";
import { LineHolder, PieHolder } from "../components/PieHolder";
import { AppColors } from "../constants/Colors";
import { LineChart } from "../components/LineChart";
import InteractiveChart from "../components/InteractiveGraph";
import { DashTabScreenProps, RootStackScreenProps } from "../navigation/pages";

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

const periods: { [key: string]: number } = {
    "1D": 1,
    "1W": 5,
    "1M": 20,
    "3M": 60,
    "1Y": 252,
    "2Y": 504,
    "Max": 1000
}
export const PortfolioScreen = (props: DashTabScreenProps<"Portfolio">) => {
    
    const [watchlists, setWatchlists] = useState<AllWatchlists>()
    const [quickWatchlist, setQuickWatchlist] = useState<IWatchlistGet>()
    const toast = useToast();//const [trades, setTrades] = useState<AwaitedReturn<typeof Api.User.extensions.getTrades>>();
    const [holdings, setHoldings] = useState<AwaitedReturn<typeof Api.User.extensions.getHoldings>>();
    const [portfolio, setPortfolio] = useState<AwaitedReturn<typeof Api.User.extensions.getPortfolio>>();
    const [returns, setReturns] = useState<AwaitedReturn<typeof Api.User.extensions.getReturns>>();
    const [twReturns, settwReturns] = useState<{ x: string, y: number }[]>();
    const [portPeriod, setPortPeriod] = useState("1Y")

    useEffect(() => {
        (async () => {
            try {
                const [lists, holdings] = await Promise.all([
                    Api.Watchlist.extensions.getAllWatchlists(),
                    Api.User.extensions.getHoldings({})
                ]);
                console.log(holdings)
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
        (async () => {
            try {
                let today = new Date();
                const returns = await Api.User.extensions.getReturns({
                    startDate: new Date(today.setDate(today.getDate() - 1001)),
                    endDate: new Date()
                })
                setReturns(returns);
                let twr: { x: string, y: number }[] = [];
                const day = new Date(String(returns.slice(returns.length - periods[portPeriod])[0].date))
                twr.push({ x: (new Date(day.setDate(day.getDate() - 1))).toUTCString(), y: 1 })
                //twr.push(JSON.parse(JSON.stringify(returns[returns.length - periods[portPeriod]])));
                //twr[0].return = 1;
                //const day = new Date(String(twr[0].date))
                //twr[0].date = new Date(day.setDate(day.getDate() - 1));
                returns?.slice(returns.length - periods[portPeriod]).forEach((r, i) => {
                    twr.push({ x: new Date(String(r.date)).toUTCString(), y: twr[i].y * (1 + r.return) })
                    //twr.push(JSON.parse(JSON.stringify(r)));
                    //twr[i+1].return = twr[i].return * (1 + r.return);
                })

                settwReturns(twr);

            } catch (err) {
                console.error(err)
            }
        })()
    }, [])
    useEffect(() => {
        if (!returns) {
            return
        }

        let twr: { x: string, y: number }[] = [];
        const day = new Date(String(returns.slice(returns.length - periods[portPeriod])[0].date))
        twr.push({ x: (new Date(day.setDate(day.getDate() - 1))).toUTCString(), y: 1 })
        //twr.push(JSON.parse(JSON.stringify(returns[returns.length - periods[portPeriod]])));
        //twr[0].return = 1;
        //const day = new Date(String(twr[0].date))
        //twr[0].date = new Date(day.setDate(day.getDate() - 1));
        returns?.slice(returns.length - periods[portPeriod]).forEach((r, i) => {
            twr.push({ x: new Date(String(r.date)).toUTCString(), y: twr[i].y * (1 + r.return) })
            //twr.push(JSON.parse(JSON.stringify(r)));
            //twr[i+1].return = twr[i].return * (1 + r.return);
        })
        settwReturns(twr);

    }, [portPeriod])

    let cummReturn = 0;

    if (twReturns) cummReturn = twReturns[twReturns.length - 1].y - 1;
    const { columns: watchlistItemColumns } = useWatchlistItemColumns(true)
    return <View style={[paddView]}>
        <Animated.FlatList
            key={'top_level_portfolio_screen'}
            data={[
                <ElevatedSection key={"portfolio_"} title="Portfolio">
                    <Subsection key={'pertformance_chart_section'} alt={true} title="Performance" style={(twReturns === undefined) ? { display: 'none' } : { display: 'flex' }}>
                        <View key={'performance_chart'} style={{ marginBottom: sizes.rem1 }} >
                            {/*<LineHolder data={twReturns} />*/}
                            <InteractiveChart data={twReturns} period={portPeriod} performance={true} />
                        </View>
                        <ButtonGroup key={"period"} items={["1D", "1W", "1M", "3M", "1Y", "2Y", "Max"].map(v => ({ label: v, value: v }))} onValueChange={(v) => setPortPeriod(v)} value={portPeriod} />
                        <View key={'portfolio_stats'} style={[portfolio ? { display: 'flex' } : { display: 'none' }, { borderColor: "#ccc", borderWidth: 1, backgroundColor: "#f5f5f5", padding: sizes.rem0_5 / 2 }]}>
                            <View key={"returns"} style={{ flexDirection: "row" }}>
                                {[
                                    { title: "Total Return", value: toPercent2(cummReturn) },
                                    { title: "Beta", value: toNumber2(portfolio?.beta || 0) },
                                    { title: "Sharpe Ratio", value: toPercent2(portfolio?.sharpe || 0) }]
                                    .map((item, idx) => {
                                        return <View key={"key_" + idx} style={flex}>
                                            <Text style={styles.stateLabel} >{item.title}</Text>
                                            <Text style={styles.stateValue}>{item.value}</Text>
                                        </View>
                                    })}
                            </View>
                            <View key="exposures" style={{ flexDirection: "row" }}>
                                {[
                                    { title: "Long", value: portfolio?.exposure?.long || 0 },
                                    { title: "Short", value: portfolio?.exposure?.short || 0 },
                                    { title: "Gross", value: portfolio?.exposure?.gross || 0 },
                                    { title: "Net", value: portfolio?.exposure?.net || 0 }]
                                    .map((item, idx) => {
                                        return <View key={"key_" + idx} style={flex}>
                                            <Text style={styles.stateLabel} >{item.title}</Text>
                                            <Text style={styles.stateValue}>{toPercent(item.value)}</Text>
                                        </View>
                                    })}
                            </View>
                        </View>
                    </Subsection>
                    <Subsection key="holdings" alt={true} title="Holdings" style={holdings ? { display: 'flex' } : { display: 'none' }}>{
                        <Table
                            listKey="portfolio_holdings_table"
                            data={holdings}
                            key={'holdings_table'}
                            columns={[
                                ...useMakeSecurityFields((item: Exclude<typeof holdings, undefined>[0]) => {
                                    return Number(item.security_id)
                                }),
                                { alias: "# Shares", stringify: (a, b, c) => String(toThousands(c.quantity)), headerStyle: { overflow: 'visible' } },
                                { alias: "Price", stringify: (a, b, c) => String(toDollarsAndCents(c.price)), headerStyle: { overflow: 'visible' } },
                                { alias: "$ Value", stringify: (a, b, c) => String(toDollars(c.value)), headerStyle: { overflow: 'visible' } },
                                { alias: "PnL", stringify: (a, b, c) => c.cost_basis ? toDollars(Number(c.value) - Number(c.cost_basis)) : '-', headerStyle: { overflow: 'visible' } }
                            ]}
                            renderAuxItem={(info) => {
                                return <Text numberOfLines={1} style={[info.item.option_info ? { display: 'flex' } : { display: 'none' }, { fontSize: fonts.xSmall }]}>
                                    {info.item.option_info && `${String(info.item.option_info[0].type).toLowerCase() === 'call' ? 'C' : 'P'}${toNumber1(info.item.option_info[0].strike_price)} ${new Date(info.item.option_info[0].expiration).toLocaleDateString()}`}
                                </Text>
                            }}
                        />
                    }</Subsection>
                    <Subsection key="trades" alt={true} title="Trades" style={!(holdings && twReturns && portfolio) ? { display: 'none' } : { display: 'flex' }}>
                        <LimitedTable
                            listKey="portfolio_trades_table"
                            title="All Trades"
                            key={'trades_table'}
                            maxPage={0}
                            tableProps={{
                                keyExtractor: (item, idx) => {
                                    return item ? "trade_" + idx : "empty";
                                },
                                data: (async (a, $page) => {
                                    const newArr = a || [];
                                    newArr.push(... (await Api.User.extensions.getTrades({ $page, settings: {} })))
                                    return newArr;
                                }) as DataOrQuery<TradeReturnType[0]>,
                                columns: [
                                    ...useMakeSecurityFields((item: TradeReturnType[0]) => {
                                        return Number(item.security_id)
                                    }),
                                    { alias: "Date", stringify: (a, b, c) => new Date(Date.parse(String(c.date))).toLocaleDateString() },
                                    { alias: "Type", stringify: (a, b, c) => String(c.type).toLowerCase()[0].toUpperCase() },
                                    { alias: "# Shares", stringify: (a, b, c) => String(toThousands(c.quantity)) },
                                    { alias: "Price", stringify: (a, b, c) => String(toDollarsAndCents(c.price)) }
                                ],
                                renderAuxItem: (info) => {
                                    return <Text numberOfLines={1} style={[info.item.option_info ? { display: 'flex' } : { display: 'none' }, { fontSize: fonts.xSmall }]}>
                                        {info.item.option_info && `${String(info.item.option_info[0].type).toLowerCase() === 'call' ? 'C' : 'P'}${toNumber1(info.item.option_info[0].strike_price)} ${new Date(info.item.option_info[0].expiration).toLocaleDateString()}`}
                                    </Text>
                                }
                            }
                            }

                        />
                    </Subsection>
                    <Text style={[(holdings && twReturns && portfolio) ? { display: 'none' } : { display: 'flex' },
                    { fontSize: fonts.medium, fontWeight: '500', color: '#ccc' }]}>
                        {"You haven't linked a brokerage to TradingPost. Go to your Account page in the Side Menu and Link one today!"}
                    </Text>
                </ElevatedSection>,
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
        >
        </Animated.FlatList>
    </View >

}