import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useRef, useState } from "react";
import { Animated, FlatList, NativeSyntheticEvent, ScrollView, View, NativeScrollEvent, useWindowDimensions } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { Avatar, Text } from '@ui-kitten/components'
import { elevated, flex, fonts, paddView, row, sizes } from "../style";
import { ElevatedSection } from "../components/Section";
import { Tab, TabBar } from "@ui-kitten/components";
import { FavButton } from "../components/AddButton";
import { toDollarsAndCents, toPercent2, toFormatedDateTime } from "../utils/misc";
import InteractiveChart from "../components/InteractiveGraph";
import { ButtonGroup } from "../components/ButtonGroup";
import { FeedPart } from "./FeedScreen";
import { RootStackScreenProps } from "../navigation/pages";
import { AppColors } from "../constants/Colors";
import { CompanyProfileBar } from "../components/CompanyProfileBar";
import { TimePeriodButton } from "../components/TimePeriodButtons";
import { VictoryStockChart } from "../components/VictoryStockChart";

const periods: { [key: string]: number } = {
    "1D": 1,
    "1W": 5,
    "1M": 20,
    "3M": 60,
    "1Y": 252,
    "2Y": 252 * 2,
    "5Y": 252 * 5,
    "Max": 252 * 10
}
const tabBarMargin = sizes.rem1;

export const CompanyScreen = (props: RootStackScreenProps<"Company">) => {

    const [security, setSecurity] = useState<Interface.ISecurityGet>();
    const [securityPrices, setSecurityPrices] = useState<{open: number, high: number, low: number, close: number, x: Date}[]>([]);
    const [chartPrices, setChartPrices] = useState<{open: number, high: number, low: number, close: number, x: Date}[]>([]);
    const { securityId } = props.route.params
    const toast = useToast();
    const [isFav, setIsFav] = useState(false);
    const [description, setDescription] = useState<string>();
    const [portPeriod, setPortPeriod] = useState("1Y")
    const [tab, setTab] = useState(0);
    const scrollRef = useRef<FlatList>(null);
    const translateHeaderY = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Api.Security.get(securityId)
            .then((s) => {
                setSecurity(s)
                s.description ? setDescription(s.description.substring(0, 300) + '...') : '';
                setIsFav(s.isOnQuickWatch || false)
            })
            .catch((ex) => toast.show(ex.message))
        Api.Security.extensions.getPrices({ securityId: securityId, includeIntraday: false, includeHistorical: true })
            .then((p) => {
                //const prices = p.historical.slice(p.historical.length - periods[portPeriod]).map((a: any) => {
                //    return { x: a.date, y: a.close }
                //})
                const prices = p.historical.map((a: any) => {
                    return { x: new Date(a.date), open: a.open, high: a.high, low: a.low, close: a.close }
                })
                setSecurityPrices(prices)
                setChartPrices(prices.slice(prices.length - periods[portPeriod]))
            })
            .catch((ex) => toast.show(ex.message))

    }, [securityId])
    useEffect(() => {
        setChartPrices(securityPrices.slice(securityPrices.length - (periods[portPeriod])))
    }, [portPeriod])
    //const pxChange =  security?.price?.price || security?.price?.open ? (security?.price?.price - security?.price?.open) / security?.price?.open : 0
    return <View style={flex}>
        <Animated.FlatList
            data={[
                <View style={{ paddingTop: sizes.rem0_5, backgroundColor: AppColors.background, 
                    //transform: [{ translateY: translation }], 
                    alignItems: "stretch", width: "100%" }}>
                    <View style={[
                        //collapsed ? {display: 'none'} : {display: 'flex'}, 
                        { paddingHorizontal: sizes.rem1, backgroundColor: AppColors.background }]}>
                        <ElevatedSection key={"Company"} title="">
                            <View style={{flexDirection: 'row'}}>
                                <View style={{flex: 1, marginBottom: sizes.rem1}}>
                                    <CompanyProfileBar symbol={security?.symbol}
                                                       companyName={security?.company_name} 
                                                       imageUri={security?.logo_url}
                                                       secId={securityId || -1}
                                                       contentSize='large'
                                                       />
                                </View>
                                <FavButton height={24} width={24} isSelected={isFav}  onPress={() => {
                                    if (security) {
                                        Api.Security.extensions.quickadd({
                                            add: !isFav,
                                            ticker: security?.symbol
                                        })
                                        setIsFav(!isFav);
                                    }
                                }} />
                           </View>
                           
                            <View style={{ marginBottom: sizes.rem1 }} >
                                <InteractiveChart data={chartPrices.map(a => {return {x: a.x, y: a.close}})} performance={false} />
                                {/*chartPrices.length ? <VictoryStockChart data={chartPrices}/> : undefined*/}
                            </View>
                            <TimePeriodButton key={"period"} 
                                items={["1D", "1W", "1M", "3M", "1Y", "5Y", "Max"].map(v => ({ label: v, value: v }))} 
                                onValueChange={(v) => setPortPeriod(v)} 
                                value={portPeriod} 
                                style={{width: '70%'}}
                            />
                             <View style={[row, { marginVertical: sizes.rem0_5 }]}>
                                <Text style={flex} category={"label"}>Open</Text>
                                <Text style={flex} category={"c1"}>{toDollarsAndCents(security?.price?.open)}</Text>
                                <Text style={flex} category={"label"}>52 Wk High</Text>
                                <Text style={flex} category={"c1"}>{toDollarsAndCents(security?.week_52_high)}</Text>
                            </View>
                            <View style={[row, { marginBottom: sizes.rem1 }]}>
                                <Text style={flex} category={"label"}>Close</Text>
                                <Text style={flex} category={"c1"}>{toDollarsAndCents(security?.price?.price)}</Text>
                                <Text style={flex} category={"label"}>52 Wk Low</Text>
                                <Text style={flex} category={"c1"}>{toDollarsAndCents(security?.week_52_low)}</Text>
                            </View>
                        </ElevatedSection >
                    </View>
                    <View style={[
                        //collapsed ? {display: 'flex'} : {display: 'flex'},
                        { paddingHorizontal: sizes.rem1, backgroundColor: AppColors.background }]}>
                        <ElevatedSection title="" style={{marginBottom: sizes.rem0_5}} >
                            <TabBar
                                key={"company_tabBar"}
                                indicatorStyle={{
                                    marginTop: 26,
                                    marginHorizontal: 10
                                }}
                                style={{width: "100%", marginHorizontal: 0 }}
                                selectedIndex={tab}
                                onSelect={t => {
                                    //setTab(t);
                                }}>
                                {["Posts", "Analysts"].map(t => <Tab key={"tab_id" + t} style={{ marginTop: -4 }} title={t} />)}
                            </TabBar>
                        </ ElevatedSection>
                    </View>
                </View>,
                <View style={[{ paddingHorizontal: 0 }]}>
                    {security && <FeedPart searchTerms={`$${security?.symbol}`} />}
                </View>
            ]}
            renderItem={(info) => {
                return info.item;
            }}
            ref={scrollRef} contentContainerStyle={[{ paddingTop: 0 }]} nestedScrollEnabled
            /*
            onMomentumScrollEnd={(ev) => {
                if (collapsed && !isMaxed) {
                    scrollRef.current?.scrollToOffset({ offset: clampMax, animated: true });
                    setIsMaxed(true);
                }
            }}
            </View>
            */
            onScroll={Animated.event<NativeSyntheticEvent<NativeScrollEvent>>([
                { nativeEvent: { contentOffset: { y: translateHeaderY } } }
            ], { useNativeDriver: true })}
            >
        </Animated.FlatList>
        
    </View >


}