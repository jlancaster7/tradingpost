import { Api, Interface } from "@tradingpost/common/api";
import React, { useEffect, useRef, useState } from "react";
import { Animated, FlatList, NativeSyntheticEvent, ScrollView, View, NativeScrollEvent, useWindowDimensions } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { Avatar, Text } from '@ui-kitten/components'
import { elevated, flex, fonts, paddView, row, sizes } from "../style";
import { ElevatedSection } from "../components/Section";
import { Tab, TabBar } from "@ui-kitten/components";
import { FavButton } from "../components/AddButton";
import { toDollarsAndCents } from "../utils/misc";
import InteractiveChart from "../components/InteractiveGraph";
import { ButtonGroup } from "../components/ButtonGroup";
import { FeedPart } from "./FeedScreen";
import { RootStackScreenProps } from "../navigation/pages";
import { AppColors } from "../constants/Colors";

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
    const [securityPrices, setSecurityPrices] = useState<{ x: string, y: number }[]>();
    const { securityId } = props.route.params
    const toast = useToast();
    const [isFav, setIsFav] = useState(false);
    const [description, setDescription] = useState<string>();
    const [portPeriod, setPortPeriod] = useState("1Y")
    const [tab, setTab] = useState(0);
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const scrollRef = useRef<FlatList>(null);
    const translateHeaderY = useRef(new Animated.Value(0)).current;
    /*
    
    let headerHeight =  sizes.rem0_5 * 3 +  fonts.small * 2 + 
                        sizes.rem0_5 * 3 + sizes.rem1 * 2 + fonts.small * 2 + ((9 / 16) * windowWidth) + sizes.rem0_5 + sizes.rem1 + 42 +
                        ( Number(elevated.paddingVertical) + Number(elevated.marginBottom) + sizes.rem1 + fonts.large ) + (description ? 100 : 0) + sizes.rem1 + sizes.rem0_5
    //const headerHeight = 680;
    const minViewHeight = windowHeight - headerHeight;
    const [collapsed, setCollapsed] = useState(false);
    const [isMaxed, setIsMaxed] = useState(false);
    const clampMax = headerHeight //- ( Number(elevated.paddingVertical) + Number(elevated.marginBottom) + sizes.rem1 + fonts.large ) ; 
    //console.log(clampMax);
    const translation = translateHeaderY.interpolate({
        inputRange: [0, clampMax],
        outputRange: [0, -clampMax],
        extrapolate: 'clamp',
    });
    
    useEffect(() => {
        translation.addListener((v: { value: number }) => {
            const c = Math.abs(v.value + clampMax) < 40;
            const isMaxed = -v.value === clampMax;
            setCollapsed(c);
            setIsMaxed(isMaxed);
        });
        return () => translation.removeAllListeners();
    }, [translation, clampMax]);
    */
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
                const prices = p.historical.slice(p.historical.length - periods[portPeriod]).map((a: any) => {
                    return { x: a.date, y: a.close }
                })
                setSecurityPrices(prices);

            })
            .catch((ex) => toast.show(ex.message))

    }, [securityId, portPeriod])

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
                            <View style={[row, { marginVertical: sizes.rem0_5 }]}>
                                <Avatar source={{ uri: security?.logo_url }} style={{ marginRight: sizes.rem0_5 }} />
                                <View style={flex}>
                                    <Text>{security?.symbol}</Text>
                                    <Text>{security?.company_name}</Text>
                                </View>
                                <View>
                                    <FavButton height={24} width={24} isSelected={isFav}  onPress={() => {
                                    if (security) {
                                        Api.Security.extensions.quickadd({
                                            add: !isFav,
                                            ticker: security?.symbol
                                        })
                                        setIsFav(!isFav);
                                    }
                                }} />
                                <Text>{toDollarsAndCents(security?.price?.price)}</Text>
                                </View>
                            </View>
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
                            <View style={{ marginBottom: sizes.rem1 }} >
                                <InteractiveChart data={securityPrices} performance={false} />
                            </View>

                            <ButtonGroup key={"period"} 
                                items={["1D", "1W", "1M", "3M", "1Y", "5Y", "Max"].map(v => ({ label: v, value: v }))} 
                                onValueChange={(v) => setPortPeriod(v)} 
                                value={portPeriod} 
                            />
                            <Text numberOfLines={5} style={{}}>{description}</Text>
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
                                    setTab(t);
                                }}>
                                {["Posts", "Analysts"].map(t => <Tab key={"tab_id" + t} style={{ marginTop: -4 }} title={t} />)}
                            </TabBar>
                        </ ElevatedSection>
                    </View>
                </View>,
                <View style={[{ paddingHorizontal: 0 }]}>
                    {security && <FeedPart searchText={`$${security?.symbol}`} />}
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