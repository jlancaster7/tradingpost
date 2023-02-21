import {Api} from "@tradingpost/common/api";
import {AllWatchlists, IWatchlistGet, IWatchlistList} from "@tradingpost/common/api/entities/interfaces";
import React, {useCallback, useEffect, useState} from "react";
import {Animated, ScrollView, TextStyle, View} from "react-native";
import {AddButton, EditButton} from "../components/AddButton";
import {Avatar, Icon, Text} from '@ui-kitten/components'
import {ElevatedSection, Section, Subsection} from "../components/Section";
import {Table} from "../components/Table";
import {DataOrQuery, List} from '../components/List'

import {flex, fonts, paddView, sizes} from "../style";
import {useToast} from "react-native-toast-notifications";
import {SecPressable, useMakeSecurityFields, useWatchlistItemColumns} from "./WatchlistViewerScreen";
import {
    AwaitedReturn,
    toPercent,
    toPercent2,
    toThousands,
    toDollarsAndCents,
    toDollars,
    toNumber2,
    toNumber1,
    toFormatedDateTime
} from "../utils/misc";
import {WatchlistSection} from "../components/WatchlistSection";
import Theme from '../theme-light.json'
import {LimitedTable} from "./TableModalScreen";
import {ButtonGroup} from "../components/ButtonGroup";
import {LineHolder, PieHolder} from "../components/PieHolder";
import {AppColors} from "../constants/Colors";
import {LineChart} from "../components/LineChart";
import InteractiveChart from "../components/InteractiveGraph";
import {DashTabScreenProps, RootStackScreenProps} from "../navigation/pages";
import {TooltipComponent} from "../components/ToolTip";
import {useSecuritiesList} from "../SecurityList";
import {Header} from "../components/Headers";
import {WatchlistItemRenderItem} from "../components/WatchlistItemRenderItem";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {HoldingRenderItem} from "../components/HoldingRenderItem";
import {TradeRenderItem} from "../components/TradeRenderItem";
import {LimitedBlockList} from "./BlockListModalScreen";

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
    const nav = useNavigation();
    const [watchlists, setWatchlists] = useState<AllWatchlists>()
    const [quickWatchlist, setQuickWatchlist] = useState<IWatchlistGet>()
    const [shownMap, setShownMap] = useState<Record<string, boolean>>({})
    const toast = useToast();//const [trades, setTrades] = useState<AwaitedReturn<typeof Api.User.extensions.getTrades>>();
    const [holdings, setHoldings] = useState<AwaitedReturn<typeof Api.User.extensions.getHoldings>>();
    const [trades, setTrades] = useState<AwaitedReturn<typeof Api.User.extensions.getTrades>>();
    const [portfolio, setPortfolio] = useState<AwaitedReturn<typeof Api.User.extensions.getPortfolio>>();
    const [returns, setReturns] = useState<AwaitedReturn<typeof Api.User.extensions.getReturns>>();
    const [twReturns, settwReturns] = useState<{ x: string, y: number }[]>();
    const [portPeriod, setPortPeriod] = useState("1Y")
    const [focus, setFocus] = useState(false);

    useFocusEffect(useCallback(() => {
        (async () => {
            try {
                const [lists, holdings] = await Promise.all([
                    Api.Watchlist.extensions.getAllWatchlists(),
                    Api.User.extensions.getHoldings({})
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
                } else {
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
                setHoldings(holdings);
                setFocus((f) => !f)
            } catch (ex: any) {
                toast.show(ex.message);
            }
        })()
    }, []));


    useEffect(() => {
        (async () => {
            try {
                let today = new Date();
                const returns = await Api.User.extensions.getReturns({
                    startDate: new Date(today.setDate(today.getDate() - 1001)),
                    endDate: new Date()
                })
                setReturns(returns);
                if (!returns.length)
                    return
                let twr: { x: string, y: number }[] = [];
                const day = new Date(String(returns.slice(returns.length - periods[portPeriod])[0].date))
                twr.push({x: (new Date(day.setDate(day.getDate() - 1))).toUTCString(), y: 1})
                //twr.push(JSON.parse(JSON.stringify(returns[returns.length - periods[portPeriod]])));
                //twr[0].return = 1;
                //const day = new Date(String(twr[0].date))
                //twr[0].date = new Date(day.setDate(day.getDate() - 1));
                returns?.slice(returns.length - periods[portPeriod]).forEach((r, i) => {
                    twr.push({x: new Date(String(r.date)).toUTCString(), y: twr[i].y * (1 + r.return)})
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
        if (!returns || !returns.length) {
            return
        }

        let twr: { x: string, y: number }[] = [];
        const day = new Date(String(returns.slice(returns.length - periods[portPeriod])[0].date))
        twr.push({x: (new Date(day.setDate(day.getDate() - 1))).toUTCString(), y: 1})
        //twr.push(JSON.parse(JSON.stringify(returns[returns.length - periods[portPeriod]])));
        //twr[0].return = 1;
        //const day = new Date(String(twr[0].date))
        //twr[0].date = new Date(day.setDate(day.getDate() - 1));
        returns?.slice(returns.length - periods[portPeriod]).forEach((r, i) => {
            twr.push({x: new Date(String(r.date)).toUTCString(), y: twr[i].y * (1 + r.return)})
            //twr.push(JSON.parse(JSON.stringify(r)));
            //twr[i+1].return = twr[i].return * (1 + r.return);
        })
        settwReturns(twr);

    }, [portPeriod])

    let cummReturn = 0;
    const {securities: {bySymbol, byId}} = useSecuritiesList();

    if (twReturns) cummReturn = twReturns[twReturns.length - 1].y - 1;
    const {columns: watchlistItemColumns} = useWatchlistItemColumns(true)
    return <View style={[paddView]}>
        <Animated.FlatList
            key={'top_level_portfolio_screen'}
            data={[
                <View key={"portfolio_"}>
                    <Header text="Performance"/>
                    <ElevatedSection key={'pertformance_chart_section'} alt={true} title=""
                                     style={(twReturns === undefined) ? {display: 'none'} : {display: 'flex'}}>
                        <View key={'performance_chart'} style={{marginBottom: sizes.rem1}}>
                            {/*<LineHolder data={twReturns} />*/}
                            <InteractiveChart data={twReturns} period={portPeriod} performance={true}/>
                        </View>
                        <ButtonGroup key={"period"} items={["1D", "1W", "1M", "3M", "1Y", "2Y", "Max"].map(v => ({
                            label: v,
                            value: v
                        }))} onValueChange={(v) => setPortPeriod(v)} value={portPeriod}/>
                        <View key={'portfolio_stats'} style={[portfolio ? {display: 'flex'} : {display: 'none'}, {
                            borderColor: "#ccc",
                            borderWidth: 1,
                            backgroundColor: "#f5f5f5",
                            padding: sizes.rem0_5 / 2,
                            borderRadius: 4,
                            marginBottom: 12
                        }]}>

                            <View key={"returns"} style={{flexDirection: "row"}}>
                                {[
                                    {title: "Total Return", value: toPercent2(cummReturn)},
                                    {title: "Beta", value: toNumber2(portfolio?.beta || 0)},
                                    {title: "Sharpe Ratio", value: toPercent2(portfolio?.sharpe || 0)}]
                                    .map((item, idx) => {
                                        return <View key={"key_" + idx} style={flex}>
                                            <Text style={styles.stateLabel}>{item.title}</Text>
                                            <Text style={styles.stateValue}>{item.value}</Text>
                                        </View>
                                    })}
                            </View>
                            <View key="exposures" style={{flexDirection: "row"}}>
                                {[
                                    {title: "Long", value: portfolio?.exposure?.long || 0},
                                    {title: "Short", value: portfolio?.exposure?.short || 0},
                                    {title: "Gross", value: portfolio?.exposure?.gross || 0},
                                    {title: "Net", value: portfolio?.exposure?.net || 0}]
                                    .map((item, idx) => {
                                        return <View key={"key_" + idx} style={flex}>
                                            <Text style={styles.stateLabel}>{item.title}</Text>
                                            <Text style={styles.stateValue}>{toPercent(item.value)}</Text>
                                        </View>
                                    })}
                            </View>
                            <View style={{flex: 1, paddingHorizontal: sizes.rem1}}>
                                <Text
                                    style={{fontSize: fonts.xSmall}}>{"Return calculations are in beta. The more feedback you can provide us, the better we can do!"}</Text>
                            </View>
                        </View>
                    </ElevatedSection>
                    <Section key="holdings" alt={true} title="Holdings"
                             style={[holdings && holdings.length > 0 ? {display: 'flex'} : {display: 'none'}, {backgroundColor: AppColors.background}]}>{
                        <List
                            listKey="holdingsList"
                            datasetKey={`holdings_id_${holdings?.length}`}
                            data={holdings}
                            loadingMessage={" "}
                            noDataMessage={" "}
                            loadingItem={undefined}
                            numColumns={2}
                            renderItem={(item) => {
                                return (
                                    <HoldingRenderItem
                                        item={item}
                                        byId={byId}
                                        isOwner={true}
                                    />
                                )
                            }}
                        />
                    }</Section>
                    <Section key="trades" alt={true} title="Trades"
                             style={[!(holdings && twReturns && portfolio) ? {display: 'none'} : {display: 'flex'}, {backgroundColor: AppColors.background}]}>
                        <LimitedBlockList
                            listKey="portfolio_trades_table"
                            key={'trades_table'}
                            maxPage={0}
                            title={'All Trades'}
                            listProps={{
                                keyExtractor: (item: any, idx) => {
                                    return item ? "trade_" + item.securityId + item.date : "empty";
                                },
                                datasetKey: `trades_id_`,
                                data: async (a, $page, $limit) => {
                                    const newArr = a || [];
                                    newArr.push(...(await Api.User.extensions.getTrades({$page, settings: {}})))
                                    return newArr;
                                },
                                loadingMessage: " ",
                                noDataMessage: " ",
                                loadingItem: undefined,
                                numColumns: 2,
                                renderItem: (item: any) => {
                                    return (
                                        <TradeRenderItem
                                            item={item}
                                            byId={byId}
                                            isOwner={true}
                                        />
                                    )
                                }
                            }
                            }

                        />

                    </Section>
                    <Text style={[(holdings && twReturns && portfolio) ? {display: 'none'} : {display: 'flex'},
                        {fontSize: fonts.medium, fontWeight: '500', color: '#ccc'}]}>
                        {"You haven't linked a brokerage to TradingPost. Go to your Account page in the Side Menu and Link one today!"}
                    </Text>
                </View>,
                <View>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Header key={"quick_watch"} text="Quick Watch" style={{flex: 1}}/>
                        <View style={{marginBottom: sizes.rem0_5 / 2, marginHorizontal: 6}}>
                            {
                                watchlists?.quick.id ?
                                    <EditButton
                                        height={24}
                                        width={24}
                                        onPress={() => {
                                            nav.navigate("WatchlistEditor", {
                                                watchlistId: watchlists?.quick.id
                                            })
                                        }}/> :
                                    <AddButton
                                        height={24}
                                        width={24}
                                        onPress={() => {
                                            nav.navigate("WatchlistEditor", {
                                                watchlistId: -1
                                            })
                                        }}/>
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
                            const hideEmptyNote = false
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

                </View>
                ,
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
        >
        </Animated.FlatList>
    </View>

}